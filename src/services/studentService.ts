import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface StudentProfileData {
  id: string;
  nombre: string;
  dni: string;
  studentID_login: string;
  curso: string;
  nivel: string;
  promedio: number | string;
  conducta: string;
  asistencia: string;
  asistencia_porcentaje: number;
  deportes: string[];
  usa_comedor: boolean;
  transporte_recorrido: string;
  transporte_estado?: string;
  comedor_estado?: string;
  status: string;
  email?: string;
  telefono?: string;
}

const mapDocToProfile = (studentData: any, user: any): StudentProfileData => {
  const nivel = studentData.nivel
    ? studentData.nivel.charAt(0).toUpperCase() + studentData.nivel.slice(1).toLowerCase()
    : 'Secundaria';

  return {
    id: studentData.id || user?.uid || '',
    nombre: studentData.nombre || user?.nombre || 'Estudiante',
    dni: studentData.dni || user?.dni || '',
    studentID_login: studentData.studentID_login || user?.studentID_login || '',
    curso: studentData.curso || user?.curso || '1° Año A',
    nivel,
    promedio: studentData.promedio !== undefined ? studentData.promedio : (user?.promedio ?? 8.8),
    conducta: studentData.conducta || user?.conducta || 'Excelente',
    asistencia: studentData.asistencia || user?.asistencia || '96% Óptima',
    asistencia_porcentaje: studentData.asistencia_porcentaje || user?.asistencia_porcentaje || 96,
    deportes: Array.isArray(studentData.deportes) ? studentData.deportes : (user?.deportes || []),
    usa_comedor: studentData.usa_comedor !== undefined ? Boolean(studentData.usa_comedor) : Boolean(user?.usa_comedor),
    transporte_recorrido: studentData.transporte_recorrido || user?.transporte_recorrido || 'Recorrido Norte (Av. Alvear - Sarmiento)',
    transporte_estado: studentData.transporte_estado || user?.transporte_estado || 'sin_servicio',
    comedor_estado: studentData.comedor_estado || user?.comedor_estado || 'sin_servicio',
    status: studentData.status || user?.status || 'activo',
    email: studentData.email || user?.email || '',
    telefono: studentData.telefono || user?.telefono || '',
  };
};

/**
 * Escucha en tiempo real los cambios del perfil del estudiante en Firestore
 */
export const subscribeStudentProfile = (
  user: any,
  onUpdate: (data: StudentProfileData) => void
): Unsubscribe => {
  if (!user) return () => {};

  let unsub: Unsubscribe | null = null;
  let isCancelled = false;

  const init = async () => {
    try {
      let docId = user.uid;
      let found = false;

      // 1. Verificar si existe doc con id user.uid
      if (docId) {
        const snap = await getDoc(doc(db, 'students', docId));
        if (snap.exists()) {
          found = true;
        }
      }

      // 2. Si no, buscar por studentID_login o DNI
      if (!found && (user.studentID_login || user.dni || user.legajo)) {
        const identifier = user.studentID_login || user.dni || user.legajo;
        const q1 = query(collection(db, 'students'), where('studentID_login', '==', identifier));
        const qSnap1 = await getDocs(q1);
        if (!qSnap1.empty) {
          docId = qSnap1.docs[0].id;
          found = true;
        } else {
          const q2 = query(collection(db, 'students'), where('dni', '==', identifier));
          const qSnap2 = await getDocs(q2);
          if (!qSnap2.empty) {
            docId = qSnap2.docs[0].id;
            found = true;
          }
        }
      }

      if (isCancelled) return;

      if (found && docId) {
        unsub = onSnapshot(doc(db, 'students', docId), (docSnap) => {
          if (isCancelled || !docSnap.exists()) return;
          const data = mapDocToProfile({ id: docSnap.id, ...docSnap.data() }, user);
          onUpdate(data);
        });
      } else {
        onUpdate(mapDocToProfile(user, user));
      }
    } catch (err) {
      console.warn('Error suscribiendo al perfil de estudiante:', err);
      if (!isCancelled) {
        onUpdate(mapDocToProfile(user, user));
      }
    }
  };

  init();

  return () => {
    isCancelled = true;
    if (unsub) unsub();
  };
};

/**
 * Obtiene el perfil del estudiante desde Firestore (Consulta estática puntual)
 */
export const getStudentProfile = async (user: any): Promise<StudentProfileData> => {
  if (!user) {
    return {
      id: '',
      nombre: 'Estudiante',
      dni: '',
      studentID_login: '',
      curso: '1° Año A',
      nivel: 'Secundaria',
      promedio: 8.8,
      conducta: 'Excelente',
      asistencia: '96% Óptima',
      asistencia_porcentaje: 96,
      deportes: [],
      usa_comedor: false,
      transporte_recorrido: 'Recorrido Norte (Av. Alvear - Sarmiento)',
      transporte_estado: 'sin_servicio',
      comedor_estado: 'sin_servicio',
      status: 'activo',
    };
  }

  try {
    let studentData: any = null;

    // 1. Intentar por UID directo en colección 'students'
    if (user.uid) {
      const snap = await getDoc(doc(db, 'students', user.uid));
      if (snap.exists()) {
        studentData = { id: snap.id, ...snap.data() };
      }
    }

    // 2. Intentar buscar por studentID_login o DNI
    if (!studentData && (user.studentID_login || user.dni || user.legajo)) {
      const identifier = user.studentID_login || user.dni || user.legajo;
      if (identifier) {
        const q1 = query(collection(db, 'students'), where('studentID_login', '==', identifier));
        const qSnap1 = await getDocs(q1);
        if (!qSnap1.empty) {
          studentData = { id: qSnap1.docs[0].id, ...qSnap1.docs[0].data() };
        } else {
          const q2 = query(collection(db, 'students'), where('dni', '==', identifier));
          const qSnap2 = await getDocs(q2);
          if (!qSnap2.empty) {
            studentData = { id: qSnap2.docs[0].id, ...qSnap2.docs[0].data() };
          }
        }
      }
    }

    if (studentData) {
      return mapDocToProfile(studentData, user);
    }
  } catch (err) {
    console.warn('Error consultando perfil de estudiante en Firestore:', err);
  }

  return mapDocToProfile(user, user);
};
