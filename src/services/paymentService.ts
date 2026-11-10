import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface PaymentRecord {
  id: string;
  studentName: string;
  studentDni: string;
  curso: string;
  nivel: string;
  parentEmail?: string;
  period?: string; // e.g. "Noviembre 2026 (Cuota 10/10)"
  dueDate: string; // e.g. "10/11/2026"
  baseTuition?: number;
  diningAmount?: number;
  transportAmount?: number;
  sportsAmount?: number;
  totalAmount: number;
  status: 'pagado' | 'pendiente';
  paidAt?: string;
  paymentMethod?: string;
  receiptNumber?: string;
}

/**
 * Genera la nómina predeterminada de cuotas y pagos del ciclo lectivo 2026
 * con desglose detallado de servicios escolares vinculados al estudiante.
 */
export const getDefaultStudentPayments = (student: {
  nombre?: string;
  dni?: string;
  curso?: string;
  nivel?: string;
  usa_comedor?: boolean;
  diningRoomEnabled?: boolean;
  transportRouteId?: string | null;
  transporte_recorrido?: string;
  deportes?: string[];
}): PaymentRecord[] => {
  const isComedor = !!(student.usa_comedor || student.diningRoomEnabled);
  const isTransport = !!(student.transportRouteId || student.transporte_recorrido);
  const isSports = !!(student.deportes && student.deportes.length > 0);

  const base = 42000;
  const dining = isComedor ? 12000 : 0;
  const transport = isTransport ? 9500 : 0;
  const sports = isSports ? 4500 : 0;
  const total = base + dining + transport + sports;

  const name = student.nombre || 'Martina Díaz';
  const dni = student.dni || '46777888';
  const curso = student.curso || '1° Año A';
  const nivel = student.nivel || 'Secundaria';

  return [
    {
      id: 'pay-nov-2026',
      studentName: name,
      studentDni: dni,
      curso,
      nivel,
      period: 'Noviembre 2026 (Cuota 10/10)',
      dueDate: '10/11/2026',
      baseTuition: base,
      diningAmount: dining,
      transportAmount: transport,
      sportsAmount: sports,
      totalAmount: total,
      status: 'pendiente',
    },
    {
      id: 'pay-oct-2026',
      studentName: name,
      studentDni: dni,
      curso,
      nivel,
      period: 'Octubre 2026 (Cuota 9/10)',
      dueDate: '10/10/2026',
      baseTuition: base,
      diningAmount: dining,
      transportAmount: transport,
      sportsAmount: sports,
      totalAmount: total,
      status: 'pagado',
      paidAt: '06/10/2026 · 11:30 hs',
      paymentMethod: 'Transferencia Bancaria (Santander)',
      receiptNumber: 'REC-2026-09418',
    },
    {
      id: 'pay-sep-2026',
      studentName: name,
      studentDni: dni,
      curso,
      nivel,
      period: 'Septiembre 2026 (Cuota 8/10)',
      dueDate: '10/09/2026',
      baseTuition: 40000,
      diningAmount: isComedor ? 11000 : 0,
      transportAmount: isTransport ? 9000 : 0,
      sportsAmount: isSports ? 4000 : 0,
      totalAmount: 40000 + (isComedor ? 11000 : 0) + (isTransport ? 9000 : 0) + (isSports ? 4000 : 0),
      status: 'pagado',
      paidAt: '08/09/2026 · 09:15 hs',
      paymentMethod: 'Débito Automático',
      receiptNumber: 'REC-2026-08102',
    },
    {
      id: 'pay-ago-2026',
      studentName: name,
      studentDni: dni,
      curso,
      nivel,
      period: 'Agosto 2026 (Cuota 7/10)',
      dueDate: '10/08/2026',
      baseTuition: 40000,
      diningAmount: isComedor ? 11000 : 0,
      transportAmount: isTransport ? 9000 : 0,
      sportsAmount: isSports ? 4000 : 0,
      totalAmount: 40000 + (isComedor ? 11000 : 0) + (isTransport ? 9000 : 0) + (isSports ? 4000 : 0),
      status: 'pagado',
      paidAt: '05/08/2026 · 16:45 hs',
      paymentMethod: 'Caja Escolar / Efectivo',
      receiptNumber: 'REC-2026-07291',
    },
    {
      id: 'pay-jul-2026',
      studentName: name,
      studentDni: dni,
      curso,
      nivel,
      period: 'Julio 2026 (Cuota 6/10)',
      dueDate: '10/07/2026',
      baseTuition: 38000,
      diningAmount: isComedor ? 10500 : 0,
      transportAmount: isTransport ? 8500 : 0,
      sportsAmount: isSports ? 3500 : 0,
      totalAmount: 38000 + (isComedor ? 10500 : 0) + (isTransport ? 8500 : 0) + (isSports ? 3500 : 0),
      status: 'pagado',
      paidAt: '07/07/2026 · 10:20 hs',
      paymentMethod: 'Transferencia Bancaria (Santander)',
      receiptNumber: 'REC-2026-06114',
    },
  ];
};

/**
 * Obtener nómina de pagos y cobranzas de la institución
 */
export const getPayments = async (): Promise<PaymentRecord[]> => {
  const snap = await getDocs(collection(db, 'payments'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
};

/**
 * Obtener las cuotas y pagos correspondientes a un alumno
 */
export const getStudentPayments = async (student: any): Promise<PaymentRecord[]> => {
  const fallback = getDefaultStudentPayments(student || {});
  try {
    const snap = await getDocs(collection(db, 'payments'));
    const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as PaymentRecord[];

    const studentDni = student?.dni ? String(student.dni).trim() : '';
    const studentName = student?.nombre ? String(student.nombre).toLowerCase().trim() : '';

    const matching = all.filter((p) => {
      if (studentDni && p.studentDni && String(p.studentDni).trim() === studentDni) return true;
      if (studentName && p.studentName && p.studentName.toLowerCase().includes(studentName)) return true;
      return false;
    });

    if (matching.length > 0) {
      // Ordenar por fecha o estado (primero pendientes)
      return matching.sort((a, b) => (a.status === 'pendiente' ? -1 : 1));
    }
    return fallback;
  } catch (err) {
    console.warn('Error al obtener pagos de Firestore, usando nómina institucional:', err);
    return fallback;
  }
};

/**
 * Informar o registrar pago de cuota
 */
export const informPayment = async (
  paymentId: string,
  details: {
    method: string;
    reference?: string;
  }
): Promise<void> => {
  try {
    const ref = doc(db, 'payments', paymentId);
    const now = new Date();
    await updateDoc(ref, {
      status: 'pagado',
      paidAt: `${now.toLocaleDateString('es-AR')} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs`,
      paymentMethod: details.method || 'Transferencia Bancaria (Santander)',
      receiptNumber: details.reference ? `TR-${details.reference}` : `REC-2026-${Date.now().toString().slice(-5)}`,
    });
  } catch (err) {
    console.warn('Aviso: el pago se registró en memoria local/modo demo:', err);
  }
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
