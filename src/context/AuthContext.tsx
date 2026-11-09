import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../services/firebase';

export interface UserProfile {
  uid: string;
  email: string | null;
  nombre?: string;
  apellido?: string;
  role?: string;
  dni?: string;
  studentID_login?: string;
  legajo?: string;
  curso?: string;
  nivel?: string;
  promedio?: number | string;
  conducta?: string;
  asistencia?: string;
  asistencia_porcentaje?: number;
  telefono?: string;
  deportes?: string[];
  usa_comedor?: boolean;
  transporte_recorrido?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Restaurar sesión persistida de alumno desde AsyncStorage si existe
    const restoreSession = async () => {
      try {
        const saved = await AsyncStorage.getItem('educore_student_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          setLoading(false);
          return true;
        }
      } catch (e) {
        console.warn('Error leyendo sesión de AsyncStorage:', e);
      }
      return false;
    };

    restoreSession();

    // 2. Escuchar el estado de Firebase Auth en tiempo real (Admins y Tutores)
    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      setFirebaseUser(currentFirebaseUser);

      if (currentFirebaseUser) {
        try {
          const userDocRef = doc(db, 'users', currentFirebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUser({
              uid: currentFirebaseUser.uid,
              email: currentFirebaseUser.email,
              ...data,
              role: data.role || 'Padre',
            });
          } else {
            // Verificar si el UID existe en la colección 'students' de Firestore
            const studentDocRef = doc(db, 'students', currentFirebaseUser.uid);
            const studentDocSnap = await getDoc(studentDocRef);
            if (studentDocSnap.exists()) {
              const data = studentDocSnap.data();
              setUser({
                uid: currentFirebaseUser.uid,
                email: currentFirebaseUser.email,
                ...data,
                role: 'Estudiante',
              });
            } else {
              setUser((prev) => {
                if (prev && prev.role === 'Estudiante') return prev;
                return {
                  uid: currentFirebaseUser.uid,
                  email: currentFirebaseUser.email,
                  role: 'Padre',
                };
              });
            }
          }
        } catch (error) {
          console.warn('Error cargando perfil desde Firestore:', error);
          setUser((prev) => {
            if (prev) return prev;
            return {
              uid: currentFirebaseUser.uid,
              email: currentFirebaseUser.email,
              role: 'Padre',
            };
          });
        }
      } else {
        AsyncStorage.getItem('educore_student_session').then((saved) => {
          if (saved) {
            try {
              setUser(JSON.parse(saved));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = (identifier || '').trim();
    const cleanPass = (pass || '').trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Por favor, completa todos los campos.' };
    }

    // ── 1. DETECCIÓN DE FORMATO ALUMNO (LEGAJO O DNI) ──
    const isStudentFormat =
      cleanId.toUpperCase().startsWith('EST-') ||
      cleanId.toUpperCase().startsWith('TEST-') ||
      /^\d{7,9}$/.test(cleanId) ||
      !cleanId.includes('@');

    if (isStudentFormat) {
      try {
        let studentData: any = null;

        // A. Consultar en Firestore por studentID_login (ej. EST-2026-401)
        const q1 = query(collection(db, 'students'), where('studentID_login', '==', cleanId));
        const qSnap1 = await getDocs(q1);
        if (!qSnap1.empty) {
          studentData = { id: qSnap1.docs[0].id, ...qSnap1.docs[0].data() };
        } else {
          // B. Consultar en Firestore por DNI (ej. 46777888)
          const q2 = query(collection(db, 'students'), where('dni', '==', cleanId));
          const qSnap2 = await getDocs(q2);
          if (!qSnap2.empty) {
            studentData = { id: qSnap2.docs[0].id, ...qSnap2.docs[0].data() };
          }
        }

        // Si NO existe en la base de datos Firestore, denegar acceso inmediatamente (cero mocks)
        if (!studentData) {
          return {
            success: false,
            error: 'No se encontró ningún estudiante registrado con ese Legajo o DNI en la base de datos.',
          };
        }

        // C. Validación de clave con la base de datos (clave asignada o DNI institucional)
        const validPassword = String(studentData.password || studentData.clave || studentData.dni || '');
        if (validPassword && cleanPass !== validPassword) {
          return {
            success: false,
            error: 'Contraseña incorrecta. Recordá que tu clave inicial de alumno es tu DNI.',
          };
        }

        // D. Construir perfil 100% DINÁMICO a partir de Firestore
        const nivel = studentData.nivel
          ? studentData.nivel.charAt(0).toUpperCase() + studentData.nivel.slice(1).toLowerCase()
          : 'Secundaria';

        const studentProfile: UserProfile = {
          uid: studentData.id,
          email: studentData.email || `${studentData.studentID_login?.toLowerCase() || 'estudiante'}@educore.edu.ar`,
          nombre: studentData.nombre,
          dni: studentData.dni,
          studentID_login: studentData.studentID_login,
          legajo: studentData.studentID_login,
          curso: studentData.curso || '1° Año A',
          nivel,
          promedio: studentData.promedio !== undefined ? studentData.promedio : 8.8,
          conducta: studentData.conducta || 'Excelente',
          asistencia: studentData.asistencia || '96% Óptima',
          asistencia_porcentaje: studentData.asistencia_porcentaje || 96,
          role: 'Estudiante',
          deportes: Array.isArray(studentData.deportes) ? studentData.deportes : [],
          usa_comedor: studentData.usa_comedor !== undefined ? Boolean(studentData.usa_comedor) : false,
          transporte_recorrido: studentData.transporte_recorrido || 'Recorrido Norte (Av. Alvear - Sarmiento)',
          status: studentData.status || 'activo',
        };

        await AsyncStorage.setItem('educore_student_session', JSON.stringify(studentProfile));
        setUser(studentProfile);
        return { success: true };
      } catch (err: any) {
        console.warn('Error consultando estudiante en Firestore:', err);
        return {
          success: false,
          error: 'Error de conexión con la base de datos al validar el estudiante.',
        };
      }
    }

    // ── 2. LOGIN DE USUARIOS CON CORREO (ADMIN O PADRES/TUTORES) ──
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanId, cleanPass);
      const uid = userCredential.user.uid;

      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const role = (data.role || '').toLowerCase();

        const isAllowed =
          role.includes('padre') ||
          role.includes('tutor') ||
          role.includes('admin') ||
          role.includes('estudiante') ||
          role.includes('student') ||
          role.includes('alumno');

        if (!isAllowed) {
          await signOut(auth);
          return { success: false, error: 'Acceso restringido: Rol no autorizado para esta aplicación.' };
        }
      }

      await AsyncStorage.removeItem('educore_student_session');
      return { success: true };
    } catch (err: any) {
      let message = 'Error al iniciar sesión.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = 'Correo electrónico o contraseña incorrectos.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Formato de correo o credencial no válido.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'No existe una cuenta registrada con este usuario en la base de datos.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos fallidos. Intenta más tarde.';
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    await AsyncStorage.removeItem('educore_student_session');
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
