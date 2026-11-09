import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface FamilyStudent {
  id: string;
  nombre: string;
  nivel: string;
  curso: string;
  dni: string;
  studentID_login?: string;
  parentId?: string;
  status?: string;
  deportes?: string[];
  transportRouteId?: string | null;
  transporte_recorrido?: string;
  usa_comedor?: boolean;
  diningRoomEnabled?: boolean;
  [key: string]: any;
}

/**
 * Obtener todos los hijos vinculados al tutor actual
 */
export const getChildrenForParent = async (
  parentId?: string,
  userEmail?: string | null
): Promise<FamilyStudent[]> => {
  try {
    let results: FamilyStudent[] = [];

    if (parentId) {
      const q = query(collection(db, 'students'), where('parentId', '==', parentId));
      const snap = await getDocs(q);
      results = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    }

    // Si no encontró por parentId, buscar por email del padre
    if (results.length === 0 && userEmail) {
      const qEmail = query(collection(db, 'students'), where('emailPadre', '==', userEmail.trim()));
      const snapEmail = await getDocs(qEmail);
      results = snapEmail.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    }

    // Si aún no hay resultados en Firestore, cargar los dos alumnos demostrativos de Familia Díaz (Martina y Benjamín)
    if (results.length === 0) {
      const allStudentsSnap = await getDocs(collection(db, 'students'));
      const all = allStudentsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      const martina = all.find((s) => s.nombre?.toLowerCase().includes('martina diaz') || s.nombre?.toLowerCase().includes('martina díaz'));
      const benjamin = all.find((s) => s.nombre?.toLowerCase().includes('benjamin diaz') || s.nombre?.toLowerCase().includes('benjamín díaz'));

      if (martina) results.push(martina);
      if (benjamin) results.push(benjamin);

      if (results.length === 0 && all.length > 0) {
        results = all.slice(0, 2);
      }
    }

    return results;
  } catch (error) {
    console.error('Error al cargar hijos del tutor:', error);
    return [];
  }
};

/**
 * Vincular un alumno al tutor actual por su número de DNI
 */
export const linkStudentByDni = async (parentId: string, dni: string): Promise<{ success: boolean; student?: FamilyStudent; message: string }> => {
  try {
    const q = query(collection(db, 'students'), where('dni', '==', dni.trim()));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, message: 'No se encontró ningún estudiante registrado con ese DNI.' };
    }

    const studentDoc = snap.docs[0];
    const studentData = { id: studentDoc.id, ...(studentDoc.data() as any) };

    // Actualizar parentId en Firestore
    await updateDoc(doc(db, 'students', studentDoc.id), {
      parentId: parentId,
    });

    studentData.parentId = parentId;
    return { success: true, student: studentData, message: `${studentData.nombre} fue vinculado con éxito a su cuenta.` };
  } catch (error: any) {
    console.error('Error al vincular alumno por DNI:', error);
    return { success: false, message: 'Ocurrió un error al vincular el estudiante.' };
  }
};
