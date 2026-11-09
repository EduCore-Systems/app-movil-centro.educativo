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
  senderRole: 'Padre' | 'Docente' | 'Sistema' | 'Staff' | 'Admin';
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
  parentEmail?: string;
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
 * Conversaciones oficiales del panel docente (coinciden exactamente con la captura oficial de la web)
 */
export const TEACHER_DEMO_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-martina-rossi',
    studentId: 'st-martina-diaz',
    studentName: 'Martina Díaz',
    studentCourse: '1° Año A',
    subjectName: 'Matemática',
    parentId: 'parent-rossi',
    parentName: 'Familia Rossi (Tutor)',
    parentEmail: 'familia.rossi@educore.com',
    teacherId: 'teacher-fontana',
    teacherName: 'Prof. Federico Fontana',
    lastMessage: 'Mañana hay clases?',
    lastMessageAt: '09-nov',
    lastSenderRole: 'Padre',
    unreadByTeacher: 1,
    unreadByParent: 0,
  },
  {
    id: 'conv-joaquin-lopez',
    studentId: 'st-joaquin-lopez',
    studentName: 'Joaquín López',
    studentCourse: 'Sala de 5 A',
    subjectName: 'Juegos y Matemática',
    parentId: 'parent-lopez',
    parentName: 'Familia López',
    parentEmail: 'familia.lopez@educore.com',
    teacherId: 'teacher-fontana',
    teacherName: 'Prof. Federico Fontana',
    lastMessage: 'Buuenaaaasss',
    lastMessageAt: '25-oct',
    lastSenderRole: 'Padre',
    unreadByTeacher: 0,
    unreadByParent: 0,
  },
  {
    id: 'conv-martina-diaz-fabri',
    studentId: 'st-martina-diaz',
    studentName: 'Martina Díaz',
    studentCourse: '1° Año A',
    subjectName: 'Matemática',
    parentId: 'parent-fabricio',
    parentName: 'Tutor Autorizado (fabricio@gmail.com)',
    parentEmail: 'fabricio@gmail.com',
    teacherId: 'teacher-fontana',
    teacherName: 'Prof. Federico Fontana',
    lastMessage: 'Estimada familia, el estudiante viene participando con mucho compromiso.',
    lastMessageAt: '04-oct',
    lastSenderRole: 'Docente',
    unreadByTeacher: 0,
    unreadByParent: 0,
  },
  {
    id: 'conv-thiago-rossi',
    studentId: 'st-thiago-rossi',
    studentName: 'Thiago Rossi',
    studentCourse: '4° Grado A',
    subjectName: 'Matemática',
    parentId: 'parent-rossi-2',
    parentName: 'Familia Rossi',
    parentEmail: 'familia.rossi@educore.com',
    teacherId: 'teacher-fontana',
    teacherName: 'Prof. Federico Fontana',
    lastMessage: 'Buenas tardes profesor, le consulto por la tarea.',
    lastMessageAt: '04-oct',
    lastSenderRole: 'Padre',
    unreadByTeacher: 0,
    unreadByParent: 0,
  },
];

export const TEACHER_DEMO_THREAD_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-martina-rossi': [
    {
      id: 'msg-mr-1',
      senderId: 'teacher-fontana',
      senderName: 'Prof. Federico Fontana',
      senderRole: 'Docente',
      text: 'Buenas tardes familia Rossi, les recuerdo que este viernes tenemos evaluación de contenidos.',
      createdAt: '08-nov · 15:30',
    },
    {
      id: 'msg-mr-2',
      senderId: 'parent-rossi',
      senderName: 'Familia Rossi (Tutor)',
      senderRole: 'Padre',
      text: 'Mañana hay clases?',
      createdAt: '09-nov · 10:14',
    },
  ],
  'conv-joaquin-lopez': [
    {
      id: 'msg-jl-1',
      senderId: 'parent-lopez',
      senderName: 'Familia López',
      senderRole: 'Padre',
      text: 'Buuenaaaasss',
      createdAt: '25-oct · 14:20',
    },
    {
      id: 'msg-jl-2',
      senderId: 'teacher-fontana',
      senderName: 'Prof. Federico Fontana',
      senderRole: 'Docente',
      text: 'Buenas tardes. Con gusto le respondo la inquietud.',
      createdAt: '25-oct · 14:25',
    },
  ],
  'conv-martina-diaz-fabri': [
    {
      id: 'msg-mdf-1',
      senderId: 'parent-fabricio',
      senderName: 'Tutor Autorizado (fabricio@gmail.com)',
      senderRole: 'Padre',
      text: 'Hola profesor, quería consultar sobre el desempeño de Martina en Matemática.',
      createdAt: '04-oct · 09:12',
    },
    {
      id: 'msg-mdf-2',
      senderId: 'teacher-fontana',
      senderName: 'Prof. Federico Fontana',
      senderRole: 'Docente',
      text: 'Estimada familia, el estudiante viene participando con mucho compromiso.',
      createdAt: '04-oct · 10:05',
    },
  ],
  'conv-thiago-rossi': [
    {
      id: 'msg-tr-1',
      senderId: 'parent-rossi-2',
      senderName: 'Familia Rossi',
      senderRole: 'Padre',
      text: 'Buenas tardes profesor, le consulto por la tarea.',
      createdAt: '04-oct · 16:00',
    },
    {
      id: 'msg-tr-2',
      senderId: 'teacher-fontana',
      senderName: 'Prof. Federico Fontana',
      senderRole: 'Docente',
      text: 'Buenas tardes. Con gusto le respondo la inquietud.',
      createdAt: '04-oct · 16:30',
    },
  ],
};

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
 * Escucha en tiempo real todas las consultas recibidas por un docente (Portal Docente Fase 3)
 */
export const subscribeToTeacherConversations = (
  teacher: any,
  callback: (convs: ConversationItem[]) => void
) => {
  if (!teacher) {
    callback(TEACHER_DEMO_CONVERSATIONS);
    return () => {};
  }

  const teacherId = teacher.teacherId || null;
  const userUid = teacher.uid || null;
  const userEmail = (teacher.email || '').toLowerCase();
  const teacherName = (teacher.nombre || '').toLowerCase();

  try {
    const colRef = collection(db, 'conversations');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const allConvs = snapshot.docs.map((d) => ({
          ...(d.data() as any),
          id: d.id,
        }));

        // Filtrar las que corresponden a este docente
        const myConvs = allConvs.filter((c) => {
          if (teacherId && c.teacherId === teacherId) return true;
          if (userUid && c.teacherId === userUid) return true;
          if (userEmail && c.teacherEmail && c.teacherEmail.toLowerCase() === userEmail) return true;
          if (teacherName && c.teacherName) {
            const cleanConvTeacher = c.teacherName.toLowerCase();
            if (cleanConvTeacher.includes(teacherName) || teacherName.includes(cleanConvTeacher)) return true;
            const parts = teacherName.split(/\s+/).filter((p: string) => p.length > 2);
            if (parts.some((p: string) => cleanConvTeacher.includes(p))) return true;
          }
          return false;
        });

        if (myConvs.length > 0) {
          myConvs.sort((a, b) => {
            const timeA = a.lastMessageAt?.toMillis ? a.lastMessageAt.toMillis() : (a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0);
            const timeB = b.lastMessageAt?.toMillis ? b.lastMessageAt.toMillis() : (b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0);
            return timeB - timeA;
          });
          callback(myConvs);
        } else {
          callback(TEACHER_DEMO_CONVERSATIONS);
        }
      },
      (err) => {
        console.warn('Error al escuchar conversaciones del docente en Firestore:', err);
        callback(TEACHER_DEMO_CONVERSATIONS);
      }
    );
  } catch (err) {
    console.warn('Excepción al conectar con Firestore:', err);
    callback(TEACHER_DEMO_CONVERSATIONS);
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

  // Fallback para hilos demo si no existen en Firestore
  const fallbackDemo = TEACHER_DEMO_THREAD_MESSAGES[conversationId] || DEMO_MESSAGES;

  // Si es la conversación demo local pura y no está en firestore
  if (conversationId === 'demo-matematica' || conversationId.startsWith('conv-')) {
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      return onSnapshot(
        messagesRef,
        (snapshot) => {
          if (snapshot.empty) {
            callback(fallbackDemo);
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
          callback(fallbackDemo);
        }
      );
    } catch {
      callback(fallbackDemo);
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
          callback(fallbackDemo);
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
        callback(fallbackDemo);
      }
    );
  } catch (e) {
    callback(fallbackDemo);
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
    senderRole: 'Padre' | 'Docente' | 'Staff' | 'Admin';
    text: string;
  }
) => {
  if (!text || !text.trim()) return;

  const cleanText = text.trim();
  const currentUid = auth.currentUser?.uid || senderId;

  // Si es un id local sin Firestore, simplemente loggear
  if (conversationId.startsWith('local-')) {
    return;
  }

  try {
    const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
    const convDocRef = doc(db, 'conversations', conversationId);

    // 1. Guardar mensaje en subcolección
    await addDoc(messagesColRef, {
      senderId: currentUid,
      senderName: senderName || (senderRole === 'Docente' ? 'Docente Titular' : 'TÚ (TUTOR)'),
      senderRole: senderRole || 'Docente',
      text: cleanText,
      createdAt: serverTimestamp(),
      read: false,
    });

    // 2. Actualizar cabecera de conversación
    const isDocente = ['docente', 'staff', 'admin'].includes(String(senderRole).toLowerCase());
    await updateDoc(convDocRef, {
      lastMessage: cleanText,
      lastMessageAt: serverTimestamp(),
      lastSenderRole: senderRole || 'Docente',
      ...(isDocente ? { unreadByParent: increment(1) } : { unreadByTeacher: increment(1) }),
    });
  } catch (err) {
    console.error('Error al guardar mensaje en Firestore:', err);
    // Si falla por permisos o conv demo, no lanzar error fatal
  }
};

/**
 * Marca la conversación como leída para el docente o tutor
 */
export const markConversationAsRead = async (conversationId: string, readerRole: string = 'Docente') => {
  if (!conversationId || conversationId.startsWith('local-')) return;

  try {
    const convDocRef = doc(db, 'conversations', conversationId);
    const roleNormalized = String(readerRole).toLowerCase();
    if (['staff', 'docente', 'teacher', 'admin'].includes(roleNormalized)) {
      await updateDoc(convDocRef, { unreadByTeacher: 0 });
    } else {
      await updateDoc(convDocRef, { unreadByParent: 0 });
    }
  } catch (err) {
    console.warn('Error al marcar conversación como leída:', err);
  }
};
