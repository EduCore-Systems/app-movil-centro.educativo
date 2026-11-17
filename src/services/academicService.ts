import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Course {
  id: string;
  name: string;
  level: 'inicial' | 'primaria' | 'secundaria';
}

export interface Subject {
  id: string;
  name: string;
  courseId: string;
  teacherId?: string;
}

export interface Sport {
  id: string;
  name: string;
  teacherId?: string;
}

export interface Schedule {
  id: string;
  referenceId: string;
  type: 'subject' | 'sport';
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface TeacherOption {
  id: string;
  nombre: string;
  email?: string;
  role?: string;
}

// =======================
// CURSOS (Courses)
// =======================
export const getCourses = async (): Promise<Course[]> => {
  const snapshot = await getDocs(collection(db, 'courses'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Course));
};

export const createCourse = async (courseData: Omit<Course, 'id'>): Promise<Course> => {
  const docRef = await addDoc(collection(db, 'courses'), courseData);
  return { id: docRef.id, ...courseData };
};

export const updateCourse = async (id: string, courseData: Partial<Omit<Course, 'id'>>): Promise<void> => {
  const docRef = doc(db, 'courses', id);
  await updateDoc(docRef, courseData);
};

export const deleteCourse = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'courses', id));
};

// =======================
// MATERIAS (Subjects)
// =======================
export const getSubjects = async (): Promise<Subject[]> => {
  const snapshot = await getDocs(collection(db, 'subjects'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subject));
};

export const createSubject = async (subjectData: Omit<Subject, 'id'>): Promise<Subject> => {
  const docRef = await addDoc(collection(db, 'subjects'), subjectData);
  return { id: docRef.id, ...subjectData };
};

export const updateSubject = async (id: string, subjectData: Partial<Omit<Subject, 'id'>>): Promise<void> => {
  const docRef = doc(db, 'subjects', id);
  await updateDoc(docRef, subjectData);
};

export const deleteSubject = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'subjects', id));
};

// =======================
// DEPORTES (Sports)
// =======================
export const getSports = async (): Promise<Sport[]> => {
  const snapshot = await getDocs(collection(db, 'sports'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Sport));
};

export const createSport = async (sportData: Omit<Sport, 'id'>): Promise<Sport> => {
  const docRef = await addDoc(collection(db, 'sports'), sportData);
  return { id: docRef.id, ...sportData };
};

export const updateSport = async (id: string, sportData: Partial<Omit<Sport, 'id'>>): Promise<void> => {
  const docRef = doc(db, 'sports', id);
  await updateDoc(docRef, sportData);
};

export const deleteSport = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'sports', id));
};

// =======================
// HORARIOS (Schedules)
// =======================
export const getSchedules = async (): Promise<Schedule[]> => {
  const snapshot = await getDocs(collection(db, 'schedules'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Schedule));
};

export const createSchedule = async (scheduleData: Omit<Schedule, 'id'>): Promise<Schedule> => {
  const docRef = await addDoc(collection(db, 'schedules'), scheduleData);
  return { id: docRef.id, ...scheduleData };
};

export const updateSchedule = async (id: string, scheduleData: Partial<Omit<Schedule, 'id'>>): Promise<void> => {
  const docRef = doc(db, 'schedules', id);
  await updateDoc(docRef, scheduleData);
};

export const deleteSchedule = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'schedules', id));
};

// =======================
// PROFESORES / STAFF
// =======================
export const getStaffTeachers = async (): Promise<TeacherOption[]> => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as any))
      .filter((u: any) => {
        const r = (u.role || '').toLowerCase();
        return r.includes('staff') || r.includes('docente') || r.includes('profesor');
      })
      .map((u: any) => ({
        id: u.id,
        nombre: u.nombre || u.email?.split('@')[0] || 'Profesor',
        email: u.email,
        role: u.role || 'Docente',
      }));
  } catch (err) {
    console.warn('Error al obtener lista de profesores de users:', err);
    return [];
  }
};
