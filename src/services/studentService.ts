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

export const DEFAULT_MATEO_ROSSI: StudentProfileData = {
  id: 'student-mateo-rossi',
  nombre: 'Mateo Rossi',
  dni: '46777888',
  studentID_login: 'test-est-2026-401',
  curso: '1° Año A',
  nivel: 'Secundaria',
  promedio: 8.8,
  conducta: 'Excelente',
  asistencia: '96% Óptima',
  asistencia_porcentaje: 96,
  deportes: ['XjMjzVd0XVwv0jJSa24c', '5lW9VLF6xaD7dMILDixr'], // Fútbol y Ajedrez (2/2 cupos)
  usa_comedor: true,
  transporte_recorrido: 'Recorrido Norte (Av. Alvear - Sarmiento)',
  status: 'activo',
  email: 'mateo.rossi@educore.edu.ar',
};

/**
 * Obtiene el perfil del estudiante desde Firestore con fallback automático
 */
export const getStudentProfile = async (user: any): Promise<StudentProfileData> => {
  if (!user) return DEFAULT_MATEO_ROSSI;

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
    if (!studentData && (user.studentID_login || user.dni || user.email)) {
      const identifier = user.studentID_login || user.dni;
      if (identifier) {
        const q = query(collection(db, 'students'), where('studentID_login', '==', identifier));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          studentData = { id: qSnap.docs[0].id, ...qSnap.docs[0].data() };
        }
      }
    }

    if (studentData) {
      return {
        id: studentData.id,
        nombre: studentData.nombre || user.nombre || DEFAULT_MATEO_ROSSI.nombre,
        dni: studentData.dni || user.dni || DEFAULT_MATEO_ROSSI.dni,
        studentID_login: studentData.studentID_login || DEFAULT_MATEO_ROSSI.studentID_login,
        curso: studentData.curso || DEFAULT_MATEO_ROSSI.curso,
        nivel: studentData.nivel || DEFAULT_MATEO_ROSSI.nivel,
        promedio: studentData.promedio !== undefined ? studentData.promedio : DEFAULT_MATEO_ROSSI.promedio,
        conducta: studentData.conducta || DEFAULT_MATEO_ROSSI.conducta,
        asistencia: studentData.asistencia || DEFAULT_MATEO_ROSSI.asistencia,
        asistencia_porcentaje: studentData.asistencia_porcentaje || DEFAULT_MATEO_ROSSI.asistencia_porcentaje,
        deportes: Array.isArray(studentData.deportes) ? studentData.deportes : DEFAULT_MATEO_ROSSI.deportes,
        usa_comedor: studentData.usa_comedor !== undefined ? Boolean(studentData.usa_comedor) : DEFAULT_MATEO_ROSSI.usa_comedor,
        transporte_recorrido: studentData.transporte_recorrido || DEFAULT_MATEO_ROSSI.transporte_recorrido,
        status: studentData.status || 'activo',
        email: studentData.email || user.email || DEFAULT_MATEO_ROSSI.email,
      };
    }
  } catch (err) {
    console.warn('Error consultando perfil de estudiante en Firestore:', err);
  }

  // Fallback con datos de sesión o Mateo Rossi oficial
  return {
    ...DEFAULT_MATEO_ROSSI,
    nombre: user.nombre || DEFAULT_MATEO_ROSSI.nombre,
    dni: user.dni || DEFAULT_MATEO_ROSSI.dni,
    studentID_login: user.studentID_login || user.legajo || DEFAULT_MATEO_ROSSI.studentID_login,
  };
};
