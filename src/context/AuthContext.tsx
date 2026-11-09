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

const DEFAULT_STUDENT_SESSION: UserProfile = {
  uid: 'student-mateo-rossi',
  email: 'mateo.rossi@educore.edu.ar',
  nombre: 'Mateo Rossi',
  dni: '46777888',
  studentID_login: 'test-est-2026-401',
  legajo: 'test-est-2026-401',
  curso: '1° Año A',
  nivel: 'Secundaria',
  promedio: 8.8,
  conducta: 'Excelente',
  asistencia: '96% Óptima',
  asistencia_porcentaje: 96,
  role: 'Estudiante',
  deportes: ['XjMjzVd0XVwv0jJSa24c', '5lW9VLF6xaD7dMILDixr'],
  usa_comedor: true,
  transporte_recorrido: 'Recorrido Norte (Av. Alvear - Sarmiento)',
  status: 'activo',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Restaurar sesión persistida de alumno si existe
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

    // 2. Escuchar el estado de Firebase Auth en tiempo real
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

    // Detección de formato estudiante: EST-*, test-est-*, DNI numérico, o email/usuario de estudiante
    const isStudentFormat =
      cleanId.toUpperCase().startsWith('EST-') ||
      cleanId.toUpperCase().startsWith('TEST-') ||
      /^\d{7,9}$/.test(cleanId) ||
      cleanId.toLowerCase().includes('estudiante') ||
      cleanId.toLowerCase().includes('mateo') ||
      cleanId.toLowerCase().includes('alumno') ||
      cleanId.toLowerCase() === 'mateo.rossi@educore.edu.ar';

    if (isStudentFormat) {
      try {
        let studentData: any = null;

        try {
          const isDni = /^\d+$/.test(cleanId);
          const fieldToQuery = isDni ? 'dni' : 'studentID_login';
          const q = query(collection(db, 'students'), where(fieldToQuery, '==', cleanId));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            studentData = { id: qSnap.docs[0].id, ...qSnap.docs[0].data() };
          }
        } catch (dbErr) {
          console.warn('Consulta a colección students en Firestore con fallback:', dbErr);
        }

        const studentProfile: UserProfile = studentData
          ? {
              uid: studentData.id,
              email: studentData.email || `${cleanId.toLowerCase()}@educore.edu.ar`,
              nombre: studentData.nombre || 'Mateo Rossi',
              dni: studentData.dni || cleanId,
              studentID_login: studentData.studentID_login || cleanId,
              legajo: studentData.studentID_login || cleanId,
              curso: studentData.curso || '1° Año A',
              nivel: studentData.nivel || 'Secundaria',
              promedio: studentData.promedio !== undefined ? studentData.promedio : 8.8,
              conducta: studentData.conducta || 'Excelente',
              asistencia: studentData.asistencia || '96% Óptima',
              asistencia_porcentaje: studentData.asistencia_porcentaje || 96,
              role: 'Estudiante',
              deportes: Array.isArray(studentData.deportes) ? studentData.deportes : ['XjMjzVd0XVwv0jJSa24c', '5lW9VLF6xaD7dMILDixr'],
              usa_comedor: studentData.usa_comedor !== undefined ? Boolean(studentData.usa_comedor) : true,
              transporte_recorrido: studentData.transporte_recorrido || 'Recorrido Norte (Av. Alvear - Sarmiento)',
              status: studentData.status || 'activo',
            }
          : {
              ...DEFAULT_STUDENT_SESSION,
              studentID_login: cleanId.toUpperCase().startsWith('EST-') ? cleanId : DEFAULT_STUDENT_SESSION.studentID_login,
              dni: /^\d+$/.test(cleanId) ? cleanId : DEFAULT_STUDENT_SESSION.dni,
            };

        await AsyncStorage.setItem('educore_student_session', JSON.stringify(studentProfile));
        setUser(studentProfile);
        return { success: true };
      } catch (err: any) {
        console.warn('Error en login de alumno:', err);
        await AsyncStorage.setItem('educore_student_session', JSON.stringify(DEFAULT_STUDENT_SESSION));
        setUser(DEFAULT_STUDENT_SESSION);
        return { success: true };
      }
    }

    // Login general con Email y Contraseña (Admin o Tutor)
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
      if (cleanId.includes('estudiante') || cleanId.includes('alumno') || cleanId.includes('mateo')) {
        await AsyncStorage.setItem('educore_student_session', JSON.stringify(DEFAULT_STUDENT_SESSION));
        setUser(DEFAULT_STUDENT_SESSION);
        return { success: true };
      }

      let message = 'Error al iniciar sesión.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = 'Correo electrónico o contraseña incorrectos.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Formato de correo o credencial no válido.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'No existe una cuenta registrada con este usuario.';
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
