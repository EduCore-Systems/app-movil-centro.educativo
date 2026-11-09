import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface PaymentRecord {
  id: string;
  studentName: string;
  studentDni: string;
  curso: string;
  nivel: string;
  parentEmail: string;
  dueDate?: string;
  baseTuition?: number;
  diningAmount?: number;
  transportAmount?: number;
  sportsAmount?: number;
  totalAmount: number;
  status: 'pagado' | 'pendiente';
  paidAt?: string;
  paymentMethod?: string;
}

/**
 * Obtener nómina de pagos y cobranzas de la institución
 */
export const getPayments = async (): Promise<PaymentRecord[]> => {
  const snap = await getDocs(collection(db, 'payments'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
};

/**
 * Registrar cobro presencial en secretaría
 */
export const markPaymentAsPaid = async (paymentId: string): Promise<void> => {
  const ref = doc(db, 'payments', paymentId);
  await updateDoc(ref, {
    status: 'pagado',
    paidAt: new Date().toLocaleDateString('es-AR') + ' (Presencial)',
    paymentMethod: 'Efectivo / Caja Escolar',
  });
};
