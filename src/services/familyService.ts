import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
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
  transporte_estado?: 'confirmado' | 'pendiente_confirmacion' | 'sin_servicio' | string;
  usa_comedor?: boolean;
  diningRoomEnabled?: boolean;
  comedor_estado?: 'confirmado' | 'pendiente_confirmacion' | 'sin_servicio' | string;
  [key: string]: any;
}

/**
 * Escucha cambios en tiempo real de un estudiante específico por ID de documento
 */
export const subscribeStudentById = (
  studentId: string,
  onUpdate: (student: FamilyStudent) => void
): Unsubscribe => {
  if (!studentId) return () => {};

  const docRef = doc(db, 'students', studentId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate({ id: snap.id, ...(snap.data() as any) });
      }
    },
    (error) => {
      console.warn(`Error en listener en tiempo real de estudiante ${studentId}:`, error);
    }
  );
};

/**
 * Escucha en tiempo real la lista de hijos vinculados al tutor actual
 */
export const subscribeChildrenForParent = (
  parentId?: string,
  userEmail?: string | null,
  onUpdate: (children: FamilyStudent[]) => void = () => {}
): Unsubscribe => {
  let unsubParent: Unsubscribe | null = null;
  let unsubEmail: Unsubscribe | null = null;
  let unsubsDemo: Unsubscribe[] = [];
  let isCancelled = false;

  const cleanup = () => {
    isCancelled = true;
    if (unsubParent) unsubParent();
    if (unsubEmail) unsubEmail();
    unsubsDemo.forEach((u) => u());
    unsubsDemo = [];
  };

  const setupDemoFallback = async () => {
    if (isCancelled) return;
    try {
      const allStudentsSnap = await getDocs(collection(db, 'students'));
      if (isCancelled) return;
      const all = allStudentsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      const martina = all.find(
        (s) =>
          s.nombre?.toLowerCase().includes('martina diaz') ||
          s.nombre?.toLowerCase().includes('martina díaz')
      );
      const benjamin = all.find(
        (s) =>
          s.nombre?.toLowerCase().includes('benjamin diaz') ||
          s.nombre?.toLowerCase().includes('benjamín díaz')
      );

      const demoList: FamilyStudent[] = [];
      if (martina) demoList.push(martina);
      if (benjamin) demoList.push(benjamin);
      if (demoList.length === 0 && all.length > 0) {
        demoList.push(...all.slice(0, 2));
      }

      onUpdate(demoList);

      // Vincular listeners individuales en tiempo real para cada estudiante en demo
      unsubsDemo.forEach((u) => u());
      unsubsDemo = demoList.map((demoStudent) => {
        return onSnapshot(
          doc(db, 'students', demoStudent.id),
          (docSnap) => {
            if (isCancelled || !docSnap.exists()) return;
            const updated = { id: docSnap.id, ...(docSnap.data() as any) };
            const idx = demoList.findIndex((item) => item.id === updated.id);
            if (idx !== -1) {
              demoList[idx] = updated;
              onUpdate([...demoList]);
            }
          },
          (err) => console.warn('Error en snapshot de estudiante demo:', err)
        );
      });
    } catch (e) {
      console.warn('Error en fallback demo de hijos:', e);
    }
  };

  const init = async () => {
    try {
      if (parentId) {
        const qParent = query(collection(db, 'students'), where('parentId', '==', parentId));
        unsubParent = onSnapshot(
          qParent,
          (snap) => {
            if (isCancelled) return;
            if (!snap.empty) {
              const students = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
              onUpdate(students);
            } else if (userEmail) {
              if (!unsubEmail) {
                const qEmail = query(
                  collection(db, 'students'),
                  where('emailPadre', '==', userEmail.trim())
                );
                unsubEmail = onSnapshot(
                  qEmail,
                  (eSnap) => {
                    if (isCancelled) return;
                    if (!eSnap.empty) {
                      const emailStudents = eSnap.docs.map((d) => ({
                        id: d.id,
                        ...(d.data() as any),
                      }));
                      onUpdate(emailStudents);
                    } else {
                      setupDemoFallback();
                    }
                  },
                  (err) => console.warn('Error en listener por email:', err)
                );
              }
            } else {
              setupDemoFallback();
            }
          },
          (err) => console.warn('Error en listener por parentId:', err)
        );
      } else if (userEmail) {
        const qEmail = query(
          collection(db, 'students'),
          where('emailPadre', '==', userEmail.trim())
        );
        unsubEmail = onSnapshot(
          qEmail,
          (eSnap) => {
            if (isCancelled) return;
            if (!eSnap.empty) {
              const emailStudents = eSnap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as any),
              }));
              onUpdate(emailStudents);
            } else {
              setupDemoFallback();
            }
          },
          (err) => console.warn('Error en listener por email:', err)
        );
      } else {
        setupDemoFallback();
      }
    } catch (err) {
      console.warn('Error iniciando suscripción de hijos:', err);
      setupDemoFallback();
    }
  };

  init();

  return cleanup;
};

/**
 * Obtener todos los hijos vinculados al tutor actual (Consulta estática puntual)
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
