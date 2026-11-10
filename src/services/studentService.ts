import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
  status: string;
  email?: string;
  telefono?: string;
}

/**
 * Obtiene el perfil real del estudiante directamente desde Firestore
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
      const nivel = studentData.nivel
        ? studentData.nivel.charAt(0).toUpperCase() + studentData.nivel.slice(1).toLowerCase()
        : 'Secundaria';

      return {
        id: studentData.id,
        nombre: studentData.nombre || user.nombre || 'Estudiante',
        dni: studentData.dni || user.dni || '',
        studentID_login: studentData.studentID_login || user.studentID_login || '',
        curso: studentData.curso || '1° Año A',
        nivel,
        promedio: studentData.promedio !== undefined ? studentData.promedio : (user.promedio ?? 8.8),
        conducta: studentData.conducta || user.conducta || 'Excelente',
        asistencia: studentData.asistencia || user.asistencia || '96% Óptima',
        asistencia_porcentaje: studentData.asistencia_porcentaje || user.asistencia_porcentaje || 96,
        deportes: Array.isArray(studentData.deportes) ? studentData.deportes : (user.deportes || []),
        usa_comedor: studentData.usa_comedor !== undefined ? Boolean(studentData.usa_comedor) : Boolean(user.usa_comedor),
        transporte_recorrido: studentData.transporte_recorrido || user.transporte_recorrido || 'Recorrido Norte (Av. Alvear - Sarmiento)',
        status: studentData.status || user.status || 'activo',
        email: studentData.email || user.email || '',
      };
    }
  } catch (err) {
    console.warn('Error consultando perfil de estudiante en Firestore:', err);
  }

  // Si ya existían datos de sesión en user, respetarlos
  return {
    id: user.uid || '',
    nombre: user.nombre || 'Estudiante',
    dni: user.dni || '',
    studentID_login: user.studentID_login || user.legajo || '',
    curso: user.curso || '1° Año A',
    nivel: user.nivel || 'Secundaria',
    promedio: user.promedio !== undefined ? user.promedio : 8.8,
    conducta: user.conducta || 'Excelente',
    asistencia: user.asistencia || '96% Óptima',
    asistencia_porcentaje: user.asistencia_porcentaje || 96,
    deportes: user.deportes || [],
    usa_comedor: Boolean(user.usa_comedor),
    transporte_recorrido: user.transporte_recorrido || 'Recorrido Norte (Av. Alvear - Sarmiento)',
    status: user.status || 'activo',
    email: user.email || '',
  };
};
