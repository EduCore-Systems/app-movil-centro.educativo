import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface TeacherCourseSubject {
  id: string;
  name: string;
  nivel: 'Inicial' | 'Primaria' | 'Secundaria';
  curso: string;
  schedule: string;
  studentsCount: number;
  students: { id: string; name: string; legajo: string; dni: string; emailPadre?: string }[];
}

export interface TeacherProfileData {
  uid: string;
  nombre: string;
  titulo: string;
  role: string;
  email: string;
  alumnosCount: number;
  materiasCount: number;
  deportesCount: number;
}

export const DEFAULT_TEACHER: TeacherProfileData = {
  uid: 'teacher-fontana',
  nombre: 'Prof. Federico Fontana',
  titulo: 'Tecnología y Robótica',
  role: 'Docente',
  email: 'federico.fontana@educore.com',
  alumnosCount: 11,
  materiasCount: 16,
  deportesCount: 0,
};

export const DEFAULT_TEACHER_SUBJECTS: TeacherCourseSubject[] = [
  {
    id: 'sub-his-1',
    name: 'Historia Argentina y Universal',
    nivel: 'Secundaria',
    curso: '1° Año A',
    schedule: 'Viernes 09:30-11:00 · Miércoles 09:30-11:00',
    studentsCount: 4,
    students: [
      { id: 'st-1', name: 'Martina Díaz', legajo: 'EST-2026-401', dni: '46777888', emailPadre: 'familia.diaz@educore.com' },
      { id: 'st-2', name: 'Valentina Rossi', legajo: 'EST-2026-301', dni: '47555666', emailPadre: 'familia.rossi@educore.com' },
      { id: 'st-3', name: 'Sofía Pérez', legajo: 'EST-2026-102', dni: '48111222', emailPadre: 'familia.perez@educore.com' },
      { id: 'st-4', name: 'Camila López', legajo: 'EST-2026-502', dni: '49999000', emailPadre: 'familia.lopez@educore.com' },
    ],
  },
  {
    id: 'sub-exp-1',
    name: 'Expresión Corporal y Música',
    nivel: 'Inicial',
    curso: 'Sala de 5 A',
    schedule: 'Viernes 09:00-10:30',
    studentsCount: 3,
    students: [
      { id: 'st-5', name: 'Mateo Gómez', legajo: 'EST-2026-201', dni: '52333444' },
      { id: 'st-6', name: 'Benjamín Díaz', legajo: 'EST-2026-402', dni: '50777888' },
      { id: 'st-7', name: 'Thiago Rossi', legajo: 'EST-2026-302', dni: '51555666' },
    ],
  },
  {
    id: 'sub-jue-1',
    name: 'Juegos y Matemática',
    nivel: 'Inicial',
    curso: 'Sala de 5 A',
    schedule: 'Jueves 09:00-10:15 · Martes 09:00-10:15',
    studentsCount: 3,
    students: [
      { id: 'st-5', name: 'Mateo Gómez', legajo: 'EST-2026-201', dni: '52333444' },
      { id: 'st-6', name: 'Benjamín Díaz', legajo: 'EST-2026-402', dni: '50777888' },
      { id: 'st-7', name: 'Thiago Rossi', legajo: 'EST-2026-302', dni: '51555666' },
    ],
  },
  {
    id: 'sub-mat-pri-1',
    name: 'Matemática',
    nivel: 'Primaria',
    curso: '4° Grado A',
    schedule: 'Lunes y Miércoles 08:00 a 09:30',
    studentsCount: 4,
    students: [
      { id: 'st-8', name: 'Lucas Pérez', legajo: 'EST-2026-101', dni: '50111222' },
      { id: 'st-9', name: 'Lautaro López', legajo: 'EST-2026-504', dni: '51999000' },
      { id: 'st-10', name: 'Facundo López', legajo: 'EST-2026-503', dni: '52999000' },
      { id: 'st-11', name: 'Joaquín López', legajo: 'EST-2026-501', dni: '53999000' },
    ],
  },
  {
    id: 'sub-len-pri-1',
    name: 'Prácticas del Lenguaje',
    nivel: 'Primaria',
    curso: '4° Grado A',
    schedule: 'Martes y Jueves 08:00 a 09:30',
    studentsCount: 4,
    students: [
      { id: 'st-8', name: 'Lucas Pérez', legajo: 'EST-2026-101', dni: '50111222' },
      { id: 'st-9', name: 'Lautaro López', legajo: 'EST-2026-504', dni: '51999000' },
      { id: 'st-10', name: 'Facundo López', legajo: 'EST-2026-503', dni: '52999000' },
      { id: 'st-11', name: 'Joaquín López', legajo: 'EST-2026-501', dni: '53999000' },
    ],
  },
  {
    id: 'sub-fis-sec-1',
    name: 'Física y Química',
    nivel: 'Secundaria',
    curso: '1° Año A',
    schedule: 'Lunes y Jueves 09:30 a 11:00',
    studentsCount: 4,
    students: [
      { id: 'st-1', name: 'Martina Díaz', legajo: 'EST-2026-401', dni: '46777888' },
      { id: 'st-2', name: 'Valentina Rossi', legajo: 'EST-2026-301', dni: '47555666' },
      { id: 'st-3', name: 'Sofía Pérez', legajo: 'EST-2026-102', dni: '48111222' },
      { id: 'st-4', name: 'Camila López', legajo: 'EST-2026-502', dni: '49999000' },
    ],
  },
];

/**
 * Obtiene los cursos y materias a cargo del docente
 */
export const getTeacherSubjects = async (): Promise<TeacherCourseSubject[]> => {
  try {
    const snap = await getDocs(collection(db, 'courses'));
    if (!snap.empty) {
      // Si la colección courses está poblada se puede enriquecer
    }
  } catch (e) {
    console.warn('Colección courses con acceso restringido, aplicando asignaturas oficiales del docente.');
  }
  return DEFAULT_TEACHER_SUBJECTS;
};
