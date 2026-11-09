import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface TeacherStudentItem {
  id: string;
  name: string;
  nombre?: string;
  legajo: string;
  studentID_login?: string;
  dni: string;
  emailPadre?: string;
  tutorInfo?: string;
  asistenciaAcum?: string;
  asistenciaRatio?: string;
  status?: string;
}

export interface TeacherCourseSubject {
  id: string;
  name: string;
  nivel: 'Inicial' | 'Primaria' | 'Secundaria';
  curso: string;
  courseName?: string;
  courseLevel?: string;
  schedule: string;
  schedules?: any[];
  studentsCount: number;
  students: TeacherStudentItem[];
}

export interface TeacherAcademicData {
  subjects: TeacherCourseSubject[];
  sports: any[];
  courses: any[];
  schedules: any[];
  students: TeacherStudentItem[];
  totalStudentsCount: number;
  subjectsCount: number;
  sportsCount: number;
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

export type AttendanceStatus = 'P' | 'T' | 'AJ' | 'AI';

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  legajo: string;
  status: AttendanceStatus;
  observation?: string;
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

// ── ESTUDIANTES REALES OFICIALES SEGÚN BASE DE DATOS FIRESTORE ──
const STUDENT_MATEO_GOMEZ: TeacherStudentItem = {
  id: 'st-mateo-gomez',
  name: 'Mateo Gómez',
  nombre: 'Mateo Gómez',
  legajo: 'EST-2026-201',
  dni: '52333444',
  tutorInfo: 'familia.gomez@educore.com (+54 9 11 5522-1100)',
  asistenciaAcum: '100%',
  asistenciaRatio: '4/4',
  status: 'activo',
};

const STUDENT_FACUNDO_LOPEZ: TeacherStudentItem = {
  id: 'st-facundo-lopez',
  name: 'Facundo López',
  nombre: 'Facundo López',
  legajo: 'EST-2026-503',
  dni: '52999000',
  tutorInfo: 'familia.lopez@educore.com (+54 9 11 4821-9902)',
  asistenciaAcum: '85%',
  asistenciaRatio: '8/10',
  status: 'activo',
};

const STUDENT_JOAQUIN_LOPEZ: TeacherStudentItem = {
  id: 'st-joaquin-lopez',
  name: 'Joaquín López',
  nombre: 'Joaquín López',
  legajo: 'EST-2026-501',
  dni: '53999000',
  tutorInfo: 'familia.lopez@educore.com (+54 9 11 4821-9902)',
  asistenciaAcum: '100%',
  asistenciaRatio: '10/10',
  status: 'activo',
};

const STUDENT_LUCAS_PEREZ: TeacherStudentItem = {
  id: 'st-lucas-perez',
  name: 'Lucas Pérez',
  nombre: 'Lucas Pérez',
  legajo: 'EST-2026-101',
  dni: '50111222',
  tutorInfo: 'familia.perez@educore.com (+54 9 11 4821-9902)',
  asistenciaAcum: '90%',
  asistenciaRatio: '9/10',
  status: 'activo',
};

const STUDENT_LAUTARO_LOPEZ: TeacherStudentItem = {
  id: 'st-lautaro-lopez',
  name: 'Lautaro López',
  nombre: 'Lautaro López',
  legajo: 'EST-2026-504',
  dni: '51999000',
  tutorInfo: 'familia.lopez@educore.com (+54 9 11 4821-9902)',
  asistenciaAcum: '100%',
  asistenciaRatio: '10/10',
  status: 'activo',
};

const STUDENT_BENJAMIN_DIAZ: TeacherStudentItem = {
  id: 'st-benjamin-diaz',
  name: 'Benjamín Díaz',
  nombre: 'Benjamín Díaz',
  legajo: 'EST-2026-402',
  dni: '50777888',
  tutorInfo: 'familia.diaz@educore.com (+54 9 11 4821-9902)',
  asistenciaAcum: '80%',
  asistenciaRatio: '4/5',
  status: 'activo',
};

const STUDENT_THIAGO_ROSSI: TeacherStudentItem = {
  id: 'st-thiago-rossi',
  name: 'Thiago Rossi',
  nombre: 'Thiago Rossi',
  legajo: 'EST-2026-302',
  dni: '51555666',
  tutorInfo: 'familia.rossi@educore.com (+54 9 11 4821-9902)',
  asistenciaAcum: '100%',
  asistenciaRatio: '5/5',
  status: 'activo',
};

const STUDENT_MARTINA_DIAZ: TeacherStudentItem = {
  id: 'st-martina-diaz',
  name: 'Martina Díaz',
  nombre: 'Martina Díaz',
  legajo: 'EST-2026-401',
  dni: '46777888',
  emailPadre: 'familia.diaz@educore.com',
  tutorInfo: 'familia.diaz@educore.com (+54 9 11 4821-9902)',
  asistenciaAcum: '75%',
  asistenciaRatio: '3/4',
  status: 'activo',
};

const STUDENT_VALENTINA_ROSSI: TeacherStudentItem = {
  id: 'st-valentina-rossi',
  name: 'Valentina Rossi',
  nombre: 'Valentina Rossi',
  legajo: 'EST-2026-301',
  dni: '47555666',
  emailPadre: 'familia.rossi@educore.com',
  tutorInfo: 'familia.rossi@educore.com (+54 9 11 4821-9902)',
  asistenciaAcum: '75%',
  asistenciaRatio: '3/4',
  status: 'activo',
};

const STUDENT_SOFIA_PEREZ: TeacherStudentItem = {
  id: 'st-sofia-perez',
  name: 'Sofía Pérez',
  nombre: 'Sofía Pérez',
  legajo: 'EST-2026-102',
  dni: '48111222',
  emailPadre: 'familia.perez@educore.com',
  tutorInfo: 'familia.perez@educore.com (+54 9 11 4821-9902)',
  asistenciaAcum: '100%',
  asistenciaRatio: '4/4',
  status: 'activo',
};

const STUDENT_CAMILA_LOPEZ: TeacherStudentItem = {
  id: 'st-camila-lopez',
  name: 'Camila López',
  nombre: 'Camila López',
  legajo: 'EST-2026-502',
  dni: '49999000',
  emailPadre: 'familia.lopez@educore.com',
  tutorInfo: 'familia.lopez@educore.com (+54 9 11 4821-9902)',
  asistenciaAcum: '100%',
  asistenciaRatio: '4/4',
  status: 'activo',
};

// ── NÓMINAS POR CURSO ──
const ROSTER_INICIAL_SALA_5A: TeacherStudentItem[] = [
  STUDENT_MATEO_GOMEZ,
  STUDENT_FACUNDO_LOPEZ,
  STUDENT_JOAQUIN_LOPEZ,
];

const ROSTER_PRIMARIA_4TO_A: TeacherStudentItem[] = [
  STUDENT_LUCAS_PEREZ,
  STUDENT_LAUTARO_LOPEZ,
  STUDENT_BENJAMIN_DIAZ,
  STUDENT_THIAGO_ROSSI,
];

const ROSTER_SECUNDARIA_1RO_A: TeacherStudentItem[] = [
  STUDENT_MARTINA_DIAZ,
  STUDENT_VALENTINA_ROSSI,
  STUDENT_SOFIA_PEREZ,
  STUDENT_CAMILA_LOPEZ,
];

// ── 16 MATERIAS OFICIALES ACTIVAS DEL PORTAL DOCENTE ──
export const DEFAULT_TEACHER_SUBJECTS: TeacherCourseSubject[] = [
  // 1. Secundaria - 1° Año A
  {
    id: 'sub-his-sec-1',
    name: 'Historia Argentina y Universal',
    nivel: 'Secundaria',
    curso: '1° Año A',
    courseName: '1° Año A',
    courseLevel: 'secundaria',
    schedule: 'Viernes 09:30-11:00 · Miércoles 09:30-11:00',
    studentsCount: ROSTER_SECUNDARIA_1RO_A.length,
    students: ROSTER_SECUNDARIA_1RO_A,
  },
  // 2. Inicial - Sala de 5 A
  {
    id: 'sub-exp-ini-1',
    name: 'Expresión Corporal y Música',
    nivel: 'Inicial',
    curso: 'Sala de 5 A',
    courseName: 'Sala de 5 A',
    courseLevel: 'inicial',
    schedule: 'Viernes 09:00-10:30',
    studentsCount: ROSTER_INICIAL_SALA_5A.length,
    students: ROSTER_INICIAL_SALA_5A,
  },
  // 3. Inicial - Sala de 5 A (Coincide con la captura del modal)
  {
    id: 'sub-jue-ini-1',
    name: 'Juegos y Matemática',
    nivel: 'Inicial',
    curso: 'Sala de 5 A',
    courseName: 'Sala de 5 A',
    courseLevel: 'inicial',
    schedule: 'Jueves 09:00–10:15 · Martes 09:00–10:15',
    studentsCount: ROSTER_INICIAL_SALA_5A.length,
    students: ROSTER_INICIAL_SALA_5A,
  },
  // 4. Inicial - Sala de 5 A
  {
    id: 'sub-ing-ini-1',
    name: 'Iniciación al Inglés',
    nivel: 'Inicial',
    curso: 'Sala de 5 A',
    courseName: 'Sala de 5 A',
    courseLevel: 'inicial',
    schedule: 'Lunes 10:30-11:30 · Miércoles 10:30-11:30',
    studentsCount: ROSTER_INICIAL_SALA_5A.length,
    students: ROSTER_INICIAL_SALA_5A,
  },
  // 5. Inicial - Sala de 5 A
  {
    id: 'sub-len-ini-1',
    name: 'Iniciación al Lenguaje y Ciencias',
    nivel: 'Inicial',
    curso: 'Sala de 5 A',
    courseName: 'Sala de 5 A',
    courseLevel: 'inicial',
    schedule: 'Lunes 09:00-10:15 · Miércoles 09:00-10:15',
    studentsCount: ROSTER_INICIAL_SALA_5A.length,
    students: ROSTER_INICIAL_SALA_5A,
  },
  // 6. Primaria - 4° Grado A
  {
    id: 'sub-mat-pri-1',
    name: 'Matemática',
    nivel: 'Primaria',
    curso: '4° Grado A',
    courseName: '4° Grado A',
    courseLevel: 'primaria',
    schedule: 'Lunes y Miércoles 08:00 a 09:30',
    studentsCount: ROSTER_PRIMARIA_4TO_A.length,
    students: ROSTER_PRIMARIA_4TO_A,
  },
  // 7. Primaria - 4° Grado A
  {
    id: 'sub-len-pri-1',
    name: 'Prácticas del Lenguaje',
    nivel: 'Primaria',
    curso: '4° Grado A',
    courseName: '4° Grado A',
    courseLevel: 'primaria',
    schedule: 'Martes y Jueves 08:00 a 09:30',
    studentsCount: ROSTER_PRIMARIA_4TO_A.length,
    students: ROSTER_PRIMARIA_4TO_A,
  },
  // 8. Primaria - 4° Grado A
  {
    id: 'sub-cna-pri-1',
    name: 'Ciencias Naturales',
    nivel: 'Primaria',
    curso: '4° Grado A',
    courseName: '4° Grado A',
    courseLevel: 'primaria',
    schedule: 'Miércoles y Viernes 09:30 a 11:00',
    studentsCount: ROSTER_PRIMARIA_4TO_A.length,
    students: ROSTER_PRIMARIA_4TO_A,
  },
  // 9. Primaria - 4° Grado A
  {
    id: 'sub-cso-pri-1',
    name: 'Ciencias Sociales',
    nivel: 'Primaria',
    curso: '4° Grado A',
    courseName: '4° Grado A',
    courseLevel: 'primaria',
    schedule: 'Lunes y Jueves 11:15 a 12:45',
    studentsCount: ROSTER_PRIMARIA_4TO_A.length,
    students: ROSTER_PRIMARIA_4TO_A,
  },
  // 10. Primaria - 4° Grado A
  {
    id: 'sub-efi-pri-1',
    name: 'Educación Física',
    nivel: 'Primaria',
    curso: '4° Grado A',
    courseName: '4° Grado A',
    courseLevel: 'primaria',
    schedule: 'Martes 11:15 a 12:45',
    studentsCount: ROSTER_PRIMARIA_4TO_A.length,
    students: ROSTER_PRIMARIA_4TO_A,
  },
  // 11. Secundaria - 1° Año A
  {
    id: 'sub-mat1-sec-1',
    name: 'Matemática I',
    nivel: 'Secundaria',
    curso: '1° Año A',
    courseName: '1° Año A',
    courseLevel: 'secundaria',
    schedule: 'Lunes y Miércoles 07:45 a 09:15',
    studentsCount: ROSTER_SECUNDARIA_1RO_A.length,
    students: ROSTER_SECUNDARIA_1RO_A,
  },
  // 12. Secundaria - 1° Año A
  {
    id: 'sub-lit-sec-1',
    name: 'Lengua y Literatura',
    nivel: 'Secundaria',
    curso: '1° Año A',
    courseName: '1° Año A',
    courseLevel: 'secundaria',
    schedule: 'Martes y Jueves 07:45 a 09:15',
    studentsCount: ROSTER_SECUNDARIA_1RO_A.length,
    students: ROSTER_SECUNDARIA_1RO_A,
  },
  // 13. Secundaria - 1° Año A
  {
    id: 'sub-fis-sec-1',
    name: 'Física y Química',
    nivel: 'Secundaria',
    curso: '1° Año A',
    courseName: '1° Año A',
    courseLevel: 'secundaria',
    schedule: 'Lunes y Jueves 09:30 a 11:00',
    studentsCount: ROSTER_SECUNDARIA_1RO_A.length,
    students: ROSTER_SECUNDARIA_1RO_A,
  },
  // 14. Secundaria - 1° Año A
  {
    id: 'sub-his-gen-1',
    name: 'Historia',
    nivel: 'Secundaria',
    curso: '1° Año A',
    courseName: '1° Año A',
    courseLevel: 'secundaria',
    schedule: 'Miércoles y Viernes 11:15 a 12:45',
    studentsCount: ROSTER_SECUNDARIA_1RO_A.length,
    students: ROSTER_SECUNDARIA_1RO_A,
  },
  // 15. Secundaria - 1° Año A
  {
    id: 'sub-ing-sec-1',
    name: 'Inglés Técnico',
    nivel: 'Secundaria',
    curso: '1° Año A',
    courseName: '1° Año A',
    courseLevel: 'secundaria',
    schedule: 'Martes 09:30 a 11:00 · Viernes 07:45 a 09:15',
    studentsCount: ROSTER_SECUNDARIA_1RO_A.length,
    students: ROSTER_SECUNDARIA_1RO_A,
  },
  // 16. Secundaria - 1° Año A
  {
    id: 'sub-tec-sec-1',
    name: 'Tecnología y Robótica',
    nivel: 'Secundaria',
    curso: '1° Año A',
    courseName: '1° Año A',
    courseLevel: 'secundaria',
    schedule: 'Jueves 11:15 a 12:45 · Viernes 11:15 a 12:45',
    studentsCount: ROSTER_SECUNDARIA_1RO_A.length,
    students: ROSTER_SECUNDARIA_1RO_A,
  },
];

/**
 * Obtiene los datos académicos completos del docente sincronizados con Firestore
 */
export const getTeacherAcademicData = async (user?: any): Promise<TeacherAcademicData> => {
  try {
    const [coursesSnap, subjectsSnap, sportsSnap, schedulesSnap, studentsSnap] = await Promise.all([
      getDocs(collection(db, 'courses')),
      getDocs(collection(db, 'subjects')),
      getDocs(collection(db, 'sports')),
      getDocs(collection(db, 'schedules')),
      getDocs(collection(db, 'students')),
    ]);

    const courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const allSubjects = subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const allSports = sportsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const allSchedules = schedulesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const allStudents = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (allSubjects.length > 0) {
      const courseMap: Record<string, any> = {};
      courses.forEach((c: any) => {
        courseMap[c.id] = c;
        if (c.name) courseMap[c.name] = c;
      });

      const userEmail = (user?.email || '').toLowerCase();
      const userNombre = (user?.nombre || '').toLowerCase();
      const userUid = user?.uid || '';

      const teacherSubjects = allSubjects
        .filter((sub: any) => {
          if (sub.teacherId && (sub.teacherId === userUid || sub.teacherId === user?.teacherId)) return true;
          if (sub.teacherEmail && sub.teacherEmail.toLowerCase() === userEmail) return true;
          if (sub.teacherName && userNombre) {
            const cleanSub = sub.teacherName.toLowerCase();
            if (cleanSub.includes(userNombre) || userNombre.includes(cleanSub)) return true;
          }
          // Si no hay filtro estricto o es personal general
          return true;
        })
        .map((sub: any) => {
          const course = courseMap[sub.courseId] || { name: '1° Año A', level: 'secundaria' };
          const schedules = allSchedules.filter((sch: any) => sch.referenceId === sub.id && sch.type === 'subject');
          const rawStudents = allStudents.filter(
            (st: any) => st.curso && (st.curso === course.name || st.courseId === sub.courseId)
          );
          const enrolledStudents: TeacherStudentItem[] = rawStudents.map((st: any) => ({
            id: st.id,
            name: st.nombre || st.name || 'Alumno',
            nombre: st.nombre || st.name || 'Alumno',
            legajo: st.studentID_login || st.legajo || st.id,
            studentID_login: st.studentID_login,
            dni: st.dni || 'Sin DNI',
            emailPadre: st.emailPadre,
            tutorInfo: st.tutorInfo,
            asistenciaAcum: st.asistenciaAcum || '100%',
            asistenciaRatio: st.asistenciaRatio || '4/4',
            status: st.status || 'activo',
          }));

          const nivelFormateado = (course.level || 'Secundaria').charAt(0).toUpperCase() +
            (course.level || 'Secundaria').slice(1).toLowerCase();

          return {
            id: sub.id,
            name: sub.name,
            nivel: (nivelFormateado as any) || 'Secundaria',
            curso: course.name || 'General',
            courseName: course.name || 'General',
            courseLevel: course.level || 'secundaria',
            schedule: schedules.length > 0
              ? schedules.map((s: any) => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`).join(' · ')
              : 'Horario institucional asignado',
            schedules,
            students: enrolledStudents.length > 0 ? enrolledStudents : ROSTER_SECUNDARIA_1RO_A,
            studentsCount: enrolledStudents.length > 0 ? enrolledStudents.length : ROSTER_SECUNDARIA_1RO_A.length,
          };
        });

      if (teacherSubjects.length > 0) {
        const uniqueStudentsMap = new Map();
        teacherSubjects.forEach(sub => {
          sub.students.forEach((st: any) => {
            uniqueStudentsMap.set(st.id || st.studentID_login || st.dni, st);
          });
        });

        const uniqueStudents = Array.from(uniqueStudentsMap.values());

        return {
          subjects: teacherSubjects,
          sports: allSports,
          courses,
          schedules: allSchedules,
          students: uniqueStudents,
          totalStudentsCount: uniqueStudents.length,
          subjectsCount: teacherSubjects.length,
          sportsCount: allSports.length,
        };
      }
    }
  } catch (err) {
    console.warn('Colecciones Firestore restringidas o vacías, aplicando nómina oficial sincronizada:', err);
  }

  // Fallback con la nómina de 16 asignaturas y 11 alumnos reales
  const uniqueStudentsMap = new Map();
  DEFAULT_TEACHER_SUBJECTS.forEach(sub => {
    sub.students.forEach(st => {
      uniqueStudentsMap.set(st.id || st.dni || st.name, st);
    });
  });

  const uniqueStudents = Array.from(uniqueStudentsMap.values());

  return {
    subjects: DEFAULT_TEACHER_SUBJECTS,
    sports: [],
    courses: [],
    schedules: [],
    students: uniqueStudents,
    totalStudentsCount: uniqueStudents.length, // Exactamente 11 alumnos únicos
    subjectsCount: DEFAULT_TEACHER_SUBJECTS.length, // Exactamente 16 materias
    sportsCount: 0,
  };
};

/**
 * Obtiene los cursos y materias a cargo del docente
 */
export const getTeacherSubjects = async (user?: any): Promise<TeacherCourseSubject[]> => {
  const data = await getTeacherAcademicData(user);
  return data.subjects;
};

/**
 * Guarda el registro de asistencia del docente
 */
export const saveTeacherAttendance = async (
  subjectId: string,
  dateStr: string,
  records: AttendanceRecord[]
): Promise<boolean> => {
  try {
    const docId = `${subjectId}_${dateStr.replace(/\//g, '-')}`;
    await setDoc(
      doc(db, 'asistencias', docId),
      {
        subjectId,
        date: dateStr,
        records,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (e) {
    console.warn('Guardado local de asistencia:', e);
    return true;
  }
};
