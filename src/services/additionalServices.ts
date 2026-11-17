import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface TransportRoute {
  id: string;
  name: string;
  cost: number;
}

export interface StudentService {
  id: string;
  nombre: string;
  nivel: string;
  status?: string;
  transportRouteId?: string | null;
  transporte_recorrido?: string;
  transporte_estado?: 'confirmado' | 'pendiente_confirmacion' | 'sin_servicio' | string;
  diningRoomEnabled?: boolean;
  usa_comedor?: boolean;
  comedor_estado?: 'confirmado' | 'pendiente_confirmacion' | 'sin_servicio' | string;
}

// =======================
// RECORRIDOS DE TRANSPORTE
// =======================
export const getTransportRoutes = async (): Promise<TransportRoute[]> => {
  const snapshot = await getDocs(collection(db, 'transport_routes'));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TransportRoute));
};

export const createTransportRoute = async (
  routeData: Omit<TransportRoute, 'id'>
): Promise<TransportRoute> => {
  const docRef = await addDoc(collection(db, 'transport_routes'), routeData);
  return { id: docRef.id, ...routeData };
};

export const updateTransportRoute = async (
  id: string,
  routeData: Partial<Omit<TransportRoute, 'id'>>
): Promise<void> => {
  const docRef = doc(db, 'transport_routes', id);
  await updateDoc(docRef, routeData);
};

export const deleteTransportRoute = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'transport_routes', id));
};

// =======================
// ESTUDIANTES PARA SERVICIOS
// =======================
export const getServiceStudents = async (): Promise<StudentService[]> => {
  const snapshot = await getDocs(collection(db, 'students'));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as StudentService))
    .filter((s) => s.status !== 'pendiente');
};

// Asignar o desasignar recorrido de transporte
export const updateStudentTransport = async (
  studentId: string,
  transportRouteId: string | null,
  routeName: string | null = null,
  estado: string = 'confirmado'
): Promise<void> => {
  const docRef = doc(db, 'students', studentId);
  const data: any = { transportRouteId: transportRouteId || null };
  if (routeName !== null) {
    data.transporte_recorrido = routeName;
  }
  if (estado !== null) {
    data.transporte_estado = transportRouteId ? estado : 'sin_servicio';
  }
  await updateDoc(docRef, data);
};

// Confirmar solicitud de transporte
export const confirmStudentTransport = async (studentId: string): Promise<void> => {
  const docRef = doc(db, 'students', studentId);
  await updateDoc(docRef, { transporte_estado: 'confirmado' });
};

// Habilitar o deshabilitar servicio de comedor
export const updateStudentDining = async (
  studentId: string,
  diningRoomEnabled: boolean,
  estado: string = 'confirmado'
): Promise<void> => {
  const docRef = doc(db, 'students', studentId);
  await updateDoc(docRef, {
    diningRoomEnabled,
    usa_comedor: diningRoomEnabled,
    comedor_estado: diningRoomEnabled ? estado : 'sin_servicio',
  });
};

// Confirmar solicitud de comedor
export const confirmStudentDining = async (studentId: string): Promise<void> => {
  const docRef = doc(db, 'students', studentId);
  await updateDoc(docRef, { comedor_estado: 'confirmado' });
};
