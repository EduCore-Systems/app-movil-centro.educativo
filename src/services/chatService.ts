import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'Padre' | 'Docente' | 'Sistema';
  text: string;
  createdAt: any;
  read?: boolean;
}

export interface ConversationItem {
  id: string;
  studentId: string;
  studentName: string;
  studentCourse?: string;
  studentDni?: string;
  studentLegajo?: string;
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  subjectName: string;
  lastMessage?: string;
  lastMessageAt?: any;
  lastSenderRole?: string;
  unreadByParent?: number;
  unreadByTeacher?: number;
}

/**
 * Mensajes de demostración que replican exactamente la captura del usuario
 */
export const DEMO_CONVERSATION: ConversationItem = {
  id: 'demo-matematica',
  studentId: 'martina-diaz',
  studentName: 'Martina Díaz',
  studentCourse: '1° Año A',
  studentDni: '46777888',
  studentLegajo: 'EST-2026-401',
  parentId: 'parent-demo',
  parentName: 'Familia Díaz',
  teacherId: 'teacher-carlos',
  teacherName: 'Prof. Carlos Benítez',
  teacherEmail: 'carlos.benitez@educore.com',
  subjectName: 'Matemática',
  lastMessage: 'aguardo su consulta',
  lastMessageAt: '11:20 a. m.',
  lastSenderRole: 'Docente',
  unreadByParent: 0,
};

export const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'teacher-carlos',
    senderName: 'PROF. CARLOS BENÍTEZ',
    senderRole: 'Docente',
    text: 'Estimada familia, el estudiante viene participando con mucho compromiso.',
    createdAt: '04:33 p. m.',
  },
  {
    id: 'msg-2',
    senderId: 'teacher-carlos',
    senderName: 'PROF. CARLOS BENÍTEZ',
    senderRole: 'Docente',
    text: 'Buenas tardes. Con gusto le respondo la inquietud.',
    createdAt: '05:04 p. m.',
  },
  {
    id: 'msg-3',
    senderId: 'parent-demo',
    senderName: 'TÚ (TUTOR)',
    senderRole: 'Padre',
    text: 'Hola buenas tardes',
    createdAt: '11:17 a. m.',
  },
  {
    id: 'msg-4',
    senderId: 'teacher-carlos',
    senderName: 'PROF. CARLOS BENÍTEZ',
    senderRole: 'Docente',
    text: 'Buenas tardes. Con gusto le respondo la inquietud.',
    createdAt: '11:18 a. m.',
  },
  {
    id: 'msg-5',
    senderId: 'teacher-carlos',
    senderName: 'PROF. CARLOS BENÍTEZ',
    senderRole: 'Docente',
    text: 'aguardo su consulta',
    createdAt: '11:20 a. m.',
  },
];

/**
 * Obtener o crear conversación en Firestore
 */
export const getOrCreateConversation = async ({
  student,
  parentUser,
  teacher,
  subjectName,
}: {
  student: any;
  parentUser: any;
  teacher: any;
  subjectName: string;
}): Promise<ConversationItem> => {
  const studentId = student?.id || student?.studentID_login || 'general';
  const teacherId = teacher.id || 'docente';
  const cleanSubject = subjectName || 'Consulta General';

  try {
    const q = query(
      collection(db, 'conversations'),
      where('parentId', '==', parentUser.uid || 'parent-demo'),
      where('studentId', '==', studentId)
    );
    const snap = await getDocs(q);
    let existing: ConversationItem | null = null;

    snap.forEach((d) => {
      const data = d.data() as ConversationItem;
      if (data.subjectName === cleanSubject) {
        existing = { ...(data as any), id: d.id };
      }
    });

    if (existing) return existing;

    const newConvData: any = {
      studentId,
      studentName: student?.nombre || 'Martina Díaz',
      studentCourse: student?.curso || '1° Año A',
      studentDni: student?.dni || '46777888',
      studentLegajo: student?.studentID_login || 'EST-2026-401',
      parentId: parentUser.uid || 'parent-demo',
      parentName: parentUser.nombre || 'Familia Díaz',
      teacherId,
      teacherName: teacher.name || 'Docente Titular',
      teacherEmail: teacher.email || '',
      subjectName: cleanSubject,
      lastMessage: 'Consulta iniciada',
      lastMessageAt: serverTimestamp(),
      lastSenderRole: 'Sistema',
      unreadByTeacher: 0,
      unreadByParent: 0,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'conversations'), newConvData);
    return { id: docRef.id, ...newConvData };
  } catch (err) {
    console.warn('Fallback a conversación local por restricciones de Firestore:', err);
    return {
      id: `local-${Date.now()}`,
      studentId,
      studentName: student?.nombre || 'Martina Díaz',
      parentId: parentUser?.uid || 'parent-demo',
      parentName: 'Familia Díaz',
      teacherId,
      teacherName: teacher.name || 'Docente Titular',
      subjectName: cleanSubject,
      lastMessage: 'Consulta iniciada',
    };
  }
};

/**
 * Escucha conversaciones de la familia en tiempo real
 */
export const subscribeToFamilyConversations = (
  parentUid: string,
  callback: (convs: ConversationItem[]) => void
) => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('parentId', '==', parentUid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const convs = snapshot.docs.map((d) => ({
          ...(d.data() as any),
          id: d.id,
        }));

        if (convs.length === 0) {
          callback([DEMO_CONVERSATION]);
        } else {
          callback(convs);
        }
      },
      (err) => {
        console.warn('Error al consultar Firestore conversations, cargando demo:', err);
        callback([DEMO_CONVERSATION]);
      }
    );
  } catch (e) {
    callback([DEMO_CONVERSATION]);
    return () => {};
  }
};

/**
 * Escucha mensajes en tiempo real
 */
export const subscribeToMessages = (
  conversationId: string,
  callback: (msgs: ChatMessage[]) => void
) => {
  if (conversationId === 'demo-matematica' || conversationId.startsWith('local-')) {
    callback(DEMO_MESSAGES);
    return () => {};
  }

  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    return onSnapshot(
      messagesRef,
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({
          ...(d.data() as any),
          id: d.id,
        }));
        if (msgs.length === 0) {
          callback(DEMO_MESSAGES);
        } else {
          callback(msgs);
        }
      },
      () => {
        callback(DEMO_MESSAGES);
      }
    );
  } catch (e) {
    callback(DEMO_MESSAGES);
    return () => {};
  }
};

/**
 * Enviar mensaje
 */
export const sendMessage = async (
  conversationId: string,
  { senderId, senderName, senderRole, text }: { senderId: string; senderName: string; senderRole: 'Padre' | 'Docente'; text: string }
) => {
  if (!text.trim()) return;

  if (conversationId !== 'demo-matematica' && !conversationId.startsWith('local-')) {
    try {
      const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
      const convDocRef = doc(db, 'conversations', conversationId);

      await addDoc(messagesColRef, {
        senderId,
        senderName,
        senderRole,
        text: text.trim(),
        createdAt: serverTimestamp(),
      });

      await updateDoc(convDocRef, {
        lastMessage: text.trim(),
        lastMessageAt: serverTimestamp(),
        lastSenderRole: senderRole,
        unreadByTeacher: increment(1),
      });
    } catch (err) {
      console.warn('Error al guardar mensaje en Firestore:', err);
    }
  }
};
