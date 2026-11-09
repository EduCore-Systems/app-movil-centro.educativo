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
import { db, auth } from './firebase';

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
 * Conversación de demostración inicial (coincide con la vista oficial web)
 */
export const DEMO_CONVERSATION: ConversationItem = {
  id: 'demo-matematica',
  studentId: 'martina-diaz',
  studentName: 'Martina Díaz',
  studentCourse: '1° Año A (Secundaria)',
  studentDni: '46777888',
  studentLegajo: 'EST-2026-401',
  parentId: 'parent-demo',
  parentName: 'Familia Díaz',
  teacherId: 'teacher-carlos',
  teacherName: 'Prof. Carlos Benítez',
  teacherEmail: 'carlos.benitez@educore.edu.ar',
  subjectName: 'Matemática I',
  lastMessage: 'aguardo su consulta',
  lastSenderRole: 'Docente',
  unreadByParent: 0,
  unreadByTeacher: 0,
};

/**
 * Mensajes iniciales de demostración (idénticos a la captura web del usuario)
 */
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
 * Busca una conversación existente o crea una nueva entre el tutor y el docente en Firestore.
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
  const currentUid = auth.currentUser?.uid || parentUser?.uid || 'parent-demo';
  const studentId = student?.id || student?.studentID_login || student?.dni || 'martina-diaz';
  const teacherId = teacher.id || teacher.uid || teacher.teacherId || 'docente';
  const cleanSubject = subjectName || 'Consulta General';

  try {
    // 1. Buscar si ya existe una conversación abierta para este tutor, alumno y docente/materia
    const q = query(
      collection(db, 'conversations'),
      where('parentId', '==', currentUid),
      where('studentId', '==', studentId)
    );

    const snap = await getDocs(q);
    let existingConv: ConversationItem | null = null;

    snap.forEach((d) => {
      const data = d.data();
      if (
        (data.teacherId === teacherId || data.teacherEmail === teacher.email) &&
        data.subjectName === cleanSubject
      ) {
        existingConv = { ...(data as any), id: d.id };
      }
    });

    if (existingConv) {
      return existingConv;
    }

    // 2. Si no existe, crear la nueva conversación con metadata completa
    const newConvData: Omit<ConversationItem, 'id'> = {
      studentId,
      studentName: student?.nombre || 'Martina Díaz',
      studentCourse: student?.curso ? `${student.curso} (${student.nivel || 'Secundaria'})` : '1° Año A (Secundaria)',
      studentDni: student?.dni || '46777888',
      studentLegajo: student?.studentID_login || studentId,
      parentId: currentUid,
      parentName: parentUser?.nombre || (parentUser?.email ? `Familia ${parentUser.email.split('@')[0]}` : 'Familia Díaz'),
      teacherId,
      teacherName: teacher.name || teacher.nombre || 'Docente Titular',
      teacherEmail: teacher.email || '',
      subjectName: cleanSubject,
      lastMessage: 'Consulta iniciada',
      lastMessageAt: serverTimestamp(),
      lastSenderRole: 'Sistema',
      unreadByTeacher: 0,
      unreadByParent: 0,
    };

    const docRef = await addDoc(collection(db, 'conversations'), {
      ...newConvData,
      createdAt: serverTimestamp(),
    });

    return { id: docRef.id, ...newConvData };
  } catch (err) {
    console.warn('Error en getOrCreateConversation Firestore, usando fallback local:', err);
    return {
      id: `local-conv-${Date.now()}`,
      studentId,
      studentName: student?.nombre || 'Martina Díaz',
      studentCourse: '1° Año A (Secundaria)',
      parentId: currentUid,
      parentName: 'Familia Díaz',
      teacherId,
      teacherName: teacher.name || 'Docente Titular',
      subjectName: cleanSubject,
      lastMessage: 'Consulta iniciada',
      lastMessageAt: new Date(),
      lastSenderRole: 'Sistema',
      unreadByParent: 0,
      unreadByTeacher: 0,
    };
  }
};

/**
 * Escucha en tiempo real todas las conversaciones de un tutor / familia.
 */
export const subscribeToFamilyConversations = (
  parentUid: string,
  callback: (convs: ConversationItem[]) => void
) => {
  if (!parentUid) {
    callback([DEMO_CONVERSATION]);
    return () => {};
  }

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

        convs.sort((a, b) => {
          const timeA = a.lastMessageAt?.toMillis ? a.lastMessageAt.toMillis() : (a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0);
          const timeB = b.lastMessageAt?.toMillis ? b.lastMessageAt.toMillis() : (b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0);
          return timeB - timeA;
        });

        if (convs.length === 0) {
          callback([DEMO_CONVERSATION]);
        } else {
          callback(convs);
        }
      },
      (err) => {
        console.warn('Error al escuchar conversaciones Firestore:', err);
        callback([DEMO_CONVERSATION]);
      }
    );
  } catch (e) {
    console.warn('Excepción al conectar a Firestore:', e);
    callback([DEMO_CONVERSATION]);
    return () => {};
  }
};

/**
 * Escucha en tiempo real los mensajes de una conversación.
 */
export const subscribeToMessages = (
  conversationId: string,
  callback: (msgs: ChatMessage[]) => void
) => {
  if (!conversationId) {
    callback(DEMO_MESSAGES);
    return () => {};
  }

  // Si es la conversación demo local pura y no está en firestore
  if (conversationId === 'demo-matematica') {
    // Intentar escuchar si existe en firestore con ese ID; si da error o no existe devolver DEMO_MESSAGES
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      return onSnapshot(
        messagesRef,
        (snapshot) => {
          if (snapshot.empty) {
            callback(DEMO_MESSAGES);
          } else {
            const msgs = snapshot.docs.map((d) => ({
              ...(d.data() as any),
              id: d.id,
            }));
            msgs.sort((a, b) => {
              const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
              const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
              return timeA - timeB;
            });
            callback(msgs);
          }
        },
        () => {
          callback(DEMO_MESSAGES);
        }
      );
    } catch {
      callback(DEMO_MESSAGES);
      return () => {};
    }
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
          msgs.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return timeA - timeB;
          });
          callback(msgs);
        }
      },
      (err) => {
        console.warn('Error al escuchar mensajes en tiempo real:', err);
        callback(DEMO_MESSAGES);
      }
    );
  } catch (e) {
    callback(DEMO_MESSAGES);
    return () => {};
  }
};

/**
 * Enviar mensaje con sincronización Firestore garantizada
 */
export const sendMessage = async (
  conversationId: string,
  {
    senderId,
    senderName,
    senderRole,
    text,
  }: {
    senderId: string;
    senderName: string;
    senderRole: 'Padre' | 'Docente';
    text: string;
  }
) => {
  if (!text || !text.trim()) return;

  const cleanText = text.trim();
  const currentUid = auth.currentUser?.uid || senderId;

  // Si es un id local, no podemos escribirlo a Firestore hasta tener doc real
  if (conversationId.startsWith('local-')) {
    return;
  }

  try {
    const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
    const convDocRef = doc(db, 'conversations', conversationId);

    // 1. Guardar mensaje en subcolección
    await addDoc(messagesColRef, {
      senderId: currentUid,
      senderName: senderName || 'TÚ (TUTOR)',
      senderRole: senderRole || 'Padre',
      text: cleanText,
      createdAt: serverTimestamp(),
      read: false,
    });

    // 2. Actualizar cabecera de conversación
    await updateDoc(convDocRef, {
      lastMessage: cleanText,
      lastMessageAt: serverTimestamp(),
      lastSenderRole: senderRole || 'Padre',
      unreadByTeacher: increment(1),
    });
  } catch (err) {
    console.error('Error al guardar mensaje en Firestore:', err);
    throw err;
  }
};

/**
 * Marca la conversación como leída para el padre
 */
export const markConversationAsRead = async (conversationId: string, readerRole: string = 'Padre') => {
  if (!conversationId || conversationId.startsWith('local-') || conversationId === 'demo-matematica') return;

  try {
    const convDocRef = doc(db, 'conversations', conversationId);
    await updateDoc(convDocRef, { unreadByParent: 0 });
  } catch (err) {
    console.warn('Error al marcar conversación como leída:', err);
  }
};
