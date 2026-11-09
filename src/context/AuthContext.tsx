import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export interface UserProfile {
  uid: string;
  email: string | null;
  nombre?: string;
  apellido?: string;
  role?: string;
  dni?: string;
  telefono?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar el estado de Firebase Auth en tiempo real
    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      setFirebaseUser(currentFirebaseUser);

      if (currentFirebaseUser) {
        try {
          // Consultar los datos del usuario en la coleccion 'users' de Firestore
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
            // Perfil basico si aun no tiene documento en users
            setUser({
              uid: currentFirebaseUser.uid,
              email: currentFirebaseUser.email,
              role: 'Padre',
            });
          }
        } catch (error) {
          console.error('Error cargando perfil desde Firestore:', error);
          setUser({
            uid: currentFirebaseUser.uid,
            email: currentFirebaseUser.email,
            role: 'Padre',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const uid = userCredential.user.uid;

      // Verificar rol en Firestore
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const role = (data.role || '').toLowerCase();
        
        // RF-01: Exclusivo para Padres/Tutores (o Admin en pruebas)
        const isAllowed = role.includes('padre') || role.includes('tutor') || role.includes('admin');
        if (!isAllowed) {
          await signOut(auth);
          return { success: false, error: 'Acceso restringido: Esta app es exclusiva para Padres y Tutores.' };
        }
      }

      return { success: true };
    } catch (err: any) {
      let message = 'Error al iniciar sesión.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = 'Correo electrónico o contraseña incorrectos.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'No existe una cuenta registrada con este correo.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos fallidos. Intenta más tarde.';
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    await signOut(auth);
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
