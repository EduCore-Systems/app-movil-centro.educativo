import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

// Import Organisms Admin
import AdminTopBar from '../components/organisms/admin/AdminTopBar';
import AdminSidebar from '../components/organisms/admin/AdminSidebar';
import AdminDashboardTab from '../components/organisms/admin/AdminDashboardTab';
import AdminCreationTab from '../components/organisms/admin/AdminCreationTab';
import AdminAcademicTab from '../components/organisms/admin/AdminAcademicTab';
import AdminServicesTab from '../components/organisms/admin/AdminServicesTab';
import AdminReportsTab from '../components/organisms/admin/AdminReportsTab';

// Import Organisms Portales
import FamilyPanel from '../components/organisms/family/FamilyPanel';
import StudentPanel from '../components/organisms/student/StudentPanel';
import TeacherPanel from '../components/organisms/teacher/TeacherPanel';

// Import Types
import { Student } from '../components/molecules/StudentCard';
import { Staff } from '../components/molecules/StaffCard';

// Verificadores estrictos de roles
const isUserAdmin = (user: any): boolean => {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  return role === 'user_admin' || role === 'admin' || role === 'administrador';
};

const isUserStudent = (user: any): boolean => {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  return role === 'estudiante' || role === 'student' || role === 'user_student' || /^est-\d+/i.test(String(user.studentID_login || user.dni || ''));
};

const isUserTeacher = (user: any): boolean => {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  return (
    role.includes('docente') ||
    role.includes('profesor') ||
    role.includes('staff') ||
    role.includes('teacher') ||
    role.includes('maestro')
  );
};

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const isAdmin = isUserAdmin(user);
  const isStudent = isUserStudent(user);
  const isTeacher = isUserTeacher(user);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<'dashboard' | 'create' | 'academic' | 'services' | 'reports'>('dashboard');

  // Portal activo: 'teacher', 'student', 'family' o 'admin'
  const [activePortal, setActivePortal] = useState<'teacher' | 'student' | 'family' | 'admin'>(() => {
    if (isAdmin) return 'admin';
    if (isTeacher) return 'teacher';
    if (isStudent) return 'student';
    return 'family';
  });

  // Ajustar portal inicial según el rol del usuario autenticado
  useEffect(() => {
    if (isAdmin) {
      setActivePortal('admin');
    } else if (isTeacher) {
      setActivePortal('teacher');
    } else if (isStudent) {
      setActivePortal('student');
    } else {
      setActivePortal('family');
    }
  }, [isAdmin, isTeacher, isStudent]);

  // Guardia de seguridad: Si NO es administrador, jamás permitir acceso a 'admin'
  useEffect(() => {
    if (!isAdmin && activePortal === 'admin') {
      if (isTeacher) {
        setActivePortal('teacher');
      } else if (isStudent) {
        setActivePortal('student');
      } else {
        setActivePortal('family');
      }
    }
  }, [isAdmin, isTeacher, isStudent, activePortal]);

  const [students, setStudents] = useState<Student[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [solicitudesList, setSolicitudesList] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // 1. Cargar Estudiantes de Firestore
      const studentsSnap = await getDocs(collection(db, 'students'));
      const fetchedStudents: any[] = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 2. Cargar Usuarios para Tutores y Personal Institucional
      let fetchedUsers: any[] = [];
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        fetchedUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (userErr) {
        console.warn('Colección users restringida o sin privilegios de lectura:', userErr);
      }

      const userMap = new Map<string, any>();
      fetchedUsers.forEach((u: any) => userMap.set(u.id, u));

      // Solicitudes pendientes: ÚNICAMENTE status === 'pendiente'
      const solRaw = fetchedStudents.filter((s: any) => s.status === 'pendiente');
      // Estudiantes regulares: TODOS los demás (status !== 'pendiente')
      const activeRaw = fetchedStudents.filter((s: any) => s.status !== 'pendiente');

      // Mapear estudiantes con datos del tutor y estado de contraseñas
      const mappedStudents: Student[] = activeRaw.map((s: any) => {
        const parent = s.parentId ? userMap.get(s.parentId) : null;
        const apellido = s.nombre ? s.nombre.trim().split(' ').slice(-1)[0] : '';
        const tutorNombre = parent?.nombre || s.nombreTutor || (s.emailPadre ? `Familia ${apellido}` : 'Sin Tutor');
        const tutorEmail = parent?.email || s.emailPadre || '';
        const tutorDni = parent?.dni || s.dniTutor || '';

        return {
          ...s,
          tutorNombre,
          emailPadre: tutorEmail,
          tutorDni,
          alumnoClaveEstado: s.mustChangePassword ? 'Temporal (DNI)' : 'Cambiada',
          tutorClaveEstado: parent ? (parent.mustChangePassword ? 'Temporal (DNI)' : 'Cambiada') : 'Cambiada',
        };
      });

      // Mapear solicitudes
      const mappedSolicitudes: Student[] = solRaw.map((s: any) => {
        const parent = s.parentId ? userMap.get(s.parentId) : null;
        return {
          ...s,
          tutorNombre: s.nombreTutor || parent?.nombre || 'Tutor Solicitante',
          emailPadre: s.emailPadre || parent?.email || '',
          tutorDni: s.dniTutor || parent?.dni || '',
          telefonoTutor: s.telefonoTutor || parent?.telefono || '',
        };
      });

      // Personal institucional
      let staffFiltered: Staff[] = fetchedUsers
        .filter((u: any) => {
          const r = (u.role || '').toLowerCase();
          return r.includes('docente') || r.includes('staff') || r.includes('admin') || r.includes('administrativo');
        })
        .map((u: any) => ({
          id: u.id,
          nombre: u.nombre || u.email?.split('@')[0] || 'Personal',
          dni: u.dni || 'No registrado',
          email: u.email || '',
          role: u.role || 'Docente',
          mustChangePassword: !!u.mustChangePassword,
        }));

      if (staffFiltered.length === 0) {
        staffFiltered = [
          {
            id: 'staff-1',
            nombre: 'Fabricio Alegre',
            dni: '41517446',
            role: 'user_admin',
            email: 'fabricio@gmail.com',
            mustChangePassword: false,
          },
          {
            id: 'staff-2',
            nombre: 'Prof. Federico Fontana',
            dni: '32888999',
            role: 'Docente',
            email: 'federico.fontana@educore.com',
            mustChangePassword: false,
          },
          {
            id: 'staff-3',
            nombre: 'Prof. Silvina Morales',
            dni: '31777888',
            role: 'Docente',
            email: 'silvina.morales@educore.com',
            mustChangePassword: false,
          },
        ];
      }

      setStudents(mappedStudents);
      setSolicitudesList(mappedSolicitudes);
      setStaffList(staffFiltered);
    } catch (err) {
      console.error('Error al consultar Firestore:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAprobarSolicitud = (solicitud: Student) => {
    Alert.alert(
      'Aprobar Solicitud',
      `¿Deseas activar la matrícula de ${solicitud.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          style: 'default',
          onPress: () => {
            setSolicitudesList(prev => prev.filter(s => s.id !== solicitud.id));
            setStudents(prev => [
              { ...solicitud, status: 'activo', alumnoClaveEstado: 'Temporal (DNI)', tutorClaveEstado: 'Temporal (DNI)' },
              ...prev,
            ]);
            Alert.alert('Éxito', `${solicitud.nombre} fue activado como alumno regular.`);
          },
        },
      ]
    );
  };

  const handleRechazarSolicitud = (solicitud: Student) => {
    Alert.alert(
      'Rechazar Solicitud',
      `¿Estás seguro de desestimar la solicitud de ${solicitud.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => {
            setSolicitudesList(prev => prev.filter(s => s.id !== solicitud.id));
            Alert.alert('Solicitud rechazada', `La solicitud de ${solicitud.nombre} fue removida.`);
          },
        },
      ]
    );
  };

  const adminName = user?.nombre || user?.email?.split('@')[0] || 'Fabricio Alegre';
  const adminInitial = adminName.charAt(0).toUpperCase();

  // ── CONTROL DE ACCESO ESTRICTO POR ROL (RBAC) ──
  // 1. Si el portal activo es 'teacher', renderizar el Portal Docente
  if (activePortal === 'teacher') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0A0F1D' : '#F8FAFC' }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <TeacherPanel
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      </SafeAreaView>
    );
  }

  // 2. Si el portal activo es 'student', renderizar el Portal del Alumno
  if (activePortal === 'student') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0A0F1D' : '#F8FAFC' }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <StudentPanel
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      </SafeAreaView>
    );
  }

  // 3. Si no es admin o eligió la vista familiar, renderizar el Portal Familiar
  if (!isAdmin || activePortal === 'family') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0A0F1D' : '#F8FAFC' }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <FamilyPanel
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      </SafeAreaView>
    );
  }

  // 4. Si el portal activo es 'admin', renderizamos el Panel Administrador
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0A0F1D' : '#F8FAFC' }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* ── ORGANISMO: TOPBAR FIJO INSTITUCIONAL ── */}
      <AdminTopBar
        isDarkMode={isDarkMode}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        adminInitial={adminInitial}
      />

      {/* ── ORGANISMO CENTRAL ACTIVO: DASHBOARD, CREACIÓN, GESTIÓN ACADÉMICA, SERVICIOS O REPORTES ── */}
      {currentModule === 'reports' ? (
        <AdminReportsTab isDarkMode={isDarkMode} />
      ) : currentModule === 'services' ? (
        <AdminServicesTab isDarkMode={isDarkMode} />
      ) : currentModule === 'academic' ? (
        <AdminAcademicTab isDarkMode={isDarkMode} />
      ) : currentModule === 'create' ? (
        <AdminCreationTab
          isDarkMode={isDarkMode}
          onSwitchToDashboard={() => setCurrentModule('dashboard')}
          onUserCreated={() => fetchData()}
        />
      ) : (
        <AdminDashboardTab
          isDarkMode={isDarkMode}
          students={students}
          staffList={staffList}
          solicitudesList={solicitudesList}
          loading={loading}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onAprobarSolicitud={handleAprobarSolicitud}
          onRechazarSolicitud={handleRechazarSolicitud}
        />
      )}

      {/* ── ORGANISMO: SIDEBAR DRAWER DESLIZABLE ── */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        onLogout={logout}
        adminName={adminName}
        adminInitial={adminInitial}
        isDarkMode={isDarkMode}
        onSwitchToFamily={() => setActivePortal('family')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
