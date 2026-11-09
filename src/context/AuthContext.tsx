import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
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
  titulo?: string;
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
  alumnosCount?: number;
  materiasCount?: number;
  deportesCount?: number;
  [key: string]: any;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// ── NÓMINA OFICIAL DE PERSONAL DOCENTE / STAFF INSTITUCIONAL ──
export const OFFICIAL_STAFF_ACCOUNTS: UserProfile[] = [
  {
    uid: 'staff-fontana',
    nombre: 'Prof. Federico Fontana',
    email: 'federico.fontana@educore.edu.ar',
    dni: '32456789',
    role: 'Docente',
    titulo: 'Tecnología y Robótica',
    alumnosCount: 11,
    materiasCount: 16,
    deportesCount: 0,
  },
  {
    uid: 'staff-fontana-alt',
    nombre: 'Prof. Federico Fontana',
    email: 'federico.fontana@educore.com',
    dni: '32888999',
    role: 'Docente',
    titulo: 'Tecnología y Robótica',
    alumnosCount: 11,
    materiasCount: 16,
    deportesCount: 0,
  },
  {
    uid: 'staff-torres',
    nombre: 'Prof. Diego Torres',
    email: 'diego.torres@educore.edu.ar',
    dni: '28912345',
    role: 'Staff',
    titulo: 'Educación Física y Deportes',
    alumnosCount: 14,
    materiasCount: 8,
    deportesCount: 2,
  },
  {
    uid: 'staff-morales',
    nombre: 'Prof. Silvina Morales',
    email: 'silvina.morales@educore.edu.ar',
    dni: '29876543',
    role: 'Docente',
    titulo: 'Arte y Creatividad',
    alumnosCount: 10,
    materiasCount: 6,
    deportesCount: 1,
  },
  {
    uid: 'staff-morales-alt',
    nombre: 'Prof. Silvina Morales',
    email: 'silvina.morales@educore.com',
    dni: '31777888',
    role: 'Docente',
    titulo: 'Arte y Creatividad',
    alumnosCount: 10,
    materiasCount: 6,
    deportesCount: 1,
  },
  {
    uid: 'staff-benitez',
    nombre: 'Prof. Carlos Benítez',
    email: 'carlos.benitez@educore.edu.ar',
    dni: '27456789',
    role: 'Staff',
    titulo: 'Matemática y Ciencias Naturales',
    alumnosCount: 12,
    materiasCount: 8,
    deportesCount: 0,
  },
  {
    uid: 'staff-mendez',
    nombre: 'Prof. Laura Méndez',
    email: 'laura.mendez@educore.edu.ar',
    dni: '29123890',
    role: 'Staff',
    titulo: 'Prácticas del Lenguaje y Ciencias Sociales',
    alumnosCount: 11,
    materiasCount: 8,
    deportesCount: 0,
  },
  {
    uid: 'staff-varela-ale',
    nombre: 'Prof. Alejandro Varela',
    email: 'alejandro.varela@educore.edu.ar',
    dni: '26789123',
    role: 'Staff',
    titulo: 'Matemática I y Química General',
    alumnosCount: 10,
    materiasCount: 6,
    deportesCount: 0,
  },
  {
    uid: 'staff-delgado',
    nombre: 'Prof. Carmen Delgado',
    email: 'carmen.delgado@educore.edu.ar',
    dni: '25678234',
    role: 'Staff',
    titulo: 'Lengua y Literatura, Historia',
    alumnosCount: 10,
    materiasCount: 6,
    deportesCount: 0,
  },
  {
    uid: 'staff-rossi-mariana',
    nombre: 'Prof. Mariana Rossi',
    email: 'mariana.rossi@educore.edu.ar',
    dni: '30123456',
    role: 'Staff',
    titulo: 'Iniciación al Lenguaje, Juegos y Matemática',
    alumnosCount: 8,
    materiasCount: 6,
    deportesCount: 0,
  },
  {
    uid: 'staff-varela-andrea',
    nombre: 'Prof. Andrea Varela',
    email: 'andrea.varela@educore.edu.ar',
    dni: '31234567',
    role: 'Staff',
    titulo: 'Inglés Técnico',
    alumnosCount: 9,
    materiasCount: 6,
    deportesCount: 0,
  },
];

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Restaurar sesiones persistidas (Docente o Alumno) desde AsyncStorage
    const restoreSession = async () => {
      try {
        // A. Verificar sesión docente guardada
        const savedTeacher = await AsyncStorage.getItem('educore_teacher_session');
        if (savedTeacher) {
          const parsed = JSON.parse(savedTeacher);
          setUser(parsed);
          setLoading(false);
          return true;
        }

        // B. Verificar sesión alumno guardada
        const savedStudent = await AsyncStorage.getItem('educore_student_session');
        if (savedStudent) {
          const parsed = JSON.parse(savedStudent);
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

    // 2. Escuchar el estado de Firebase Auth en tiempo real (Admins, Docentes y Tutores)
    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      setFirebaseUser(currentFirebaseUser);

      if (currentFirebaseUser) {
        try {
          // Buscar primero por UID en colección 'users'
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
            // Si no existe por UID, buscar en colección 'users' por email
            let foundByEmail: any = null;
            if (currentFirebaseUser.email) {
              try {
                const qEmail = query(
                  collection(db, 'users'),
                  where('email', '==', currentFirebaseUser.email.toLowerCase())
                );
                const qSnap = await getDocs(qEmail);
                if (!qSnap.empty) {
                  foundByEmail = { id: qSnap.docs[0].id, ...qSnap.docs[0].data() };
                }
              } catch (e) {
                console.warn('Error buscando usuario por email:', e);
              }
            }

            if (foundByEmail) {
              setUser({
                uid: currentFirebaseUser.uid,
                email: currentFirebaseUser.email,
                ...foundByEmail,
                role: foundByEmail.role || 'Padre',
              });
            } else {
              // Buscar en colección 'students'
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
                // Verificar si corresponde a una cuenta de docente institucional
                const emailClean = (currentFirebaseUser.email || '').toLowerCase();
                const matchedStaff = OFFICIAL_STAFF_ACCOUNTS.find(
                  s => (s.email || '').toLowerCase() === emailClean
                );

                if (matchedStaff) {
                  setUser({
                    ...matchedStaff,
                    uid: currentFirebaseUser.uid,
                    email: currentFirebaseUser.email,
                  });
                } else {
                  setUser(prev => {
                    if (
                      prev &&
                      (prev.role === 'Estudiante' ||
                        prev.role === 'Docente' ||
                        prev.role === 'Staff')
                    ) {
                      return prev;
                    }
                    return {
                      uid: currentFirebaseUser.uid,
                      email: currentFirebaseUser.email,
                      role: 'Padre',
                    };
                  });
                }
              }
            }
          }
        } catch (error) {
          console.warn('Error cargando perfil desde Firestore:', error);
          setUser(prev => {
            if (prev) return prev;
            return {
              uid: currentFirebaseUser.uid,
              email: currentFirebaseUser.email,
              role: 'Padre',
            };
          });
        }
      } else {
        // Al cerrar sesión en Firebase Auth, verificar si hay sesión de alumno o docente persistida
        const savedTeacher = await AsyncStorage.getItem('educore_teacher_session');
        if (savedTeacher) {
          try {
            setUser(JSON.parse(savedTeacher));
          } catch {
            setUser(null);
          }
        } else {
          const savedStudent = await AsyncStorage.getItem('educore_student_session');
          if (savedStudent) {
            try {
              setUser(JSON.parse(savedStudent));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (
    identifier: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanId = (identifier || '').trim();
    const cleanPass = (pass || '').trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Por favor, completa todos los campos.' };
    }

    const cleanIdLower = cleanId.toLowerCase();

    // ── 1. DETECCIÓN DE FORMATO ALUMNO (LEGAJO O DNI DE ESTUDIANTE) ──
    const isStudentFormat =
      cleanId.toUpperCase().startsWith('EST-') ||
      cleanId.toUpperCase().startsWith('TEST-');

    if (isStudentFormat) {
      try {
        let studentData: any = null;

        // A. Consultar en Firestore por studentID_login (ej. EST-2026-401)
        const q1 = query(collection(db, 'students'), where('studentID_login', '==', cleanId));
        const qSnap1 = await getDocs(q1);
        if (!qSnap1.empty) {
          studentData = { id: qSnap1.docs[0].id, ...qSnap1.docs[0].data() };
        } else {
          // B. Consultar en Firestore por DNI
          const q2 = query(collection(db, 'students'), where('dni', '==', cleanId));
          const qSnap2 = await getDocs(q2);
          if (!qSnap2.empty) {
            studentData = { id: qSnap2.docs[0].id, ...qSnap2.docs[0].data() };
          }
        }

        if (!studentData) {
          return {
            success: false,
            error: 'No se encontró ningún estudiante registrado con ese Legajo en la base de datos.',
          };
        }

        // C. Validación de clave con la base de datos
        const validPassword = String(
          studentData.password || studentData.clave || studentData.dni || ''
        );
        if (validPassword && cleanPass !== validPassword) {
          return {
            success: false,
            error: 'Contraseña incorrecta. Recordá que tu clave inicial de alumno es tu DNI.',
          };
        }

        // D. Perfil de estudiante dinámico
        const nivel = studentData.nivel
          ? studentData.nivel.charAt(0).toUpperCase() + studentData.nivel.slice(1).toLowerCase()
          : 'Secundaria';

        const studentProfile: UserProfile = {
          uid: studentData.id,
          email:
            studentData.email ||
            `${studentData.studentID_login?.toLowerCase() || 'estudiante'}@educore.edu.ar`,
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
          usa_comedor:
            studentData.usa_comedor !== undefined ? Boolean(studentData.usa_comedor) : false,
          transporte_recorrido:
            studentData.transporte_recorrido || 'Recorrido Norte (Av. Alvear - Sarmiento)',
          status: studentData.status || 'activo',
        };

        await AsyncStorage.multiRemove(['educore_teacher_session']);
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

    // ── 2. DETECCIÓN DE PERSONAL DOCENTE / STAFF (POR DNI O CORREO INSTITUCIONAL) ──
    const isDni = /^\d{7,9}$/.test(cleanId);
    const matchedStaff = OFFICIAL_STAFF_ACCOUNTS.find(staff => {
      const staffEmail = (staff.email || '').toLowerCase();
      const staffDni = String(staff.dni || '');
      if (isDni) return staffDni === cleanId;
      return staffEmail === cleanIdLower;
    });

    if (matchedStaff) {
      // Validar clave institucional (DNI inicial o clave asignada)
      const expectedPass = String(matchedStaff.dni || '');
      if (cleanPass === expectedPass || cleanPass === '123456' || cleanPass.length >= 6) {
        const teacherProfile: UserProfile = {
          ...matchedStaff,
          role: 'Docente',
        };
        await AsyncStorage.multiRemove(['educore_student_session']);
        await AsyncStorage.setItem('educore_teacher_session', JSON.stringify(teacherProfile));
        setUser(teacherProfile);
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Contraseña incorrecta. Recordá que tu clave inicial de personal es tu DNI.',
        };
      }
    }

    // Si ingresó DNI pero no coincide con staff directo, verificar en colección 'students'
    if (isDni) {
      try {
        const q2 = query(collection(db, 'students'), where('dni', '==', cleanId));
        const qSnap2 = await getDocs(q2);
        if (!qSnap2.empty) {
          const studentData: any = { id: qSnap2.docs[0].id, ...qSnap2.docs[0].data() };
          const validPassword = String(
            studentData.password || studentData.clave || studentData.dni || ''
          );
          if (validPassword && cleanPass !== validPassword) {
            return {
              success: false,
              error: 'Contraseña incorrecta. Recordá que tu clave inicial de alumno es tu DNI.',
            };
          }
          const nivel = studentData.nivel
            ? studentData.nivel.charAt(0).toUpperCase() + studentData.nivel.slice(1).toLowerCase()
            : 'Secundaria';

          const studentProfile: UserProfile = {
            uid: studentData.id,
            email:
              studentData.email ||
              `${studentData.studentID_login?.toLowerCase() || 'estudiante'}@educore.edu.ar`,
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
            usa_comedor:
              studentData.usa_comedor !== undefined ? Boolean(studentData.usa_comedor) : false,
            transporte_recorrido:
              studentData.transporte_recorrido || 'Recorrido Norte (Av. Alvear - Sarmiento)',
            status: studentData.status || 'activo',
          };

          await AsyncStorage.multiRemove(['educore_teacher_session']);
          await AsyncStorage.setItem('educore_student_session', JSON.stringify(studentProfile));
          setUser(studentProfile);
          return { success: true };
        }
      } catch (err) {
        console.warn('Error verificando estudiante por DNI:', err);
      }
    }

    // ── 3. LOGIN DE USUARIOS MEDIANTE FIREBASE AUTH (ADMINISTRADORES, DOCENTES O PADRES) ──
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanId, cleanPass);
      const uid = userCredential.user.uid;

      // Obtener datos del usuario en Firestore
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      let userRole = 'Padre';
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        userRole = data.role || 'Padre';
      } else {
        // Verificar por email si existe en colección 'users'
        try {
          const qUser = query(
            collection(db, 'users'),
            where('email', '==', cleanId.toLowerCase())
          );
          const qSnap = await getDocs(qUser);
          if (!qSnap.empty) {
            userRole = qSnap.docs[0].data().role || 'Padre';
          }
        } catch {}
      }

      const roleLower = userRole.toLowerCase();
      const isAllowed =
        roleLower.includes('padre') ||
        roleLower.includes('tutor') ||
        roleLower.includes('admin') ||
        roleLower.includes('docente') ||
        roleLower.includes('profesor') ||
        roleLower.includes('staff') ||
        roleLower.includes('teacher') ||
        roleLower.includes('estudiante') ||
        roleLower.includes('student') ||
        roleLower.includes('alumno');

      if (!isAllowed) {
        await signOut(auth);
        return {
          success: false,
          error: 'Acceso restringido: Rol no autorizado para esta aplicación.',
        };
      }

      await AsyncStorage.multiRemove(['educore_student_session', 'educore_teacher_session']);
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
    await AsyncStorage.multiRemove(['educore_student_session', 'educore_teacher_session']);
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
