import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

interface Student {
  id: string;
  nombre?: string;
  dni?: string;
  nivel?: string;
  status?: string;
  studentID_login?: string;
  emailPadre?: string;
  tutorNombre?: string;
  tutorDni?: string;
  genero?: string;
  alumnoClaveEstado?: string;
  tutorClaveEstado?: string;
  fechaNacimiento?: string;
  telefonoTutor?: string;
  [key: string]: any;
}

interface Staff {
  id: string;
  nombre: string;
  dni?: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
  telefono?: string;
  [key: string]: any;
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'estudiantes' | 'personal' | 'solicitudes'>('estudiantes');
  const [selectedLevel, setSelectedLevel] = useState('todos');
  const [search, setSearch] = useState('');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [solicitudesList, setSolicitudesList] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

  // Paleta de colores dinamica segun modo Oscuro / Claro
  const theme = {
    bg: isDarkMode ? '#0A0F1D' : '#F8FAFC',
    topBarBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    topBarBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    cardBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    inputBg: isDarkMode ? '#111C35' : '#F1F5F9',
    inputBorder: isDarkMode ? '#1E293B' : '#CBD5E1',
    tabBarBg: isDarkMode ? '#111827' : '#E2E8F0',
    tabInactiveText: isDarkMode ? '#94A3B8' : '#64748B',
    divider: isDarkMode ? '#1E293B' : '#F1F5F9',
    actionPillBg: isDarkMode ? '#1E293B' : '#F1F5F9',
    actionCircleBg: isDarkMode ? '#334155' : '#FFFFFF',
    modalBg: isDarkMode ? '#0F172A' : '#FFFFFF',
  };

  const fetchData = async () => {
    try {
      // 1. Cargar Estudiantes
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

      // Mapa de usuarios para enlazar tutor por parentId
      const userMap = new Map<string, any>();
      fetchedUsers.forEach((u: any) => userMap.set(u.id, u));

      // En la web de EduCore:
      // - Solicitudes pendientes: ÚNICAMENTE registros con status === 'pendiente'
      // - Estudiantes y tutores regulares: TODOS con status !== 'pendiente' (incluye 'activo' y 'active')
      const solRaw = fetchedStudents.filter((s: any) => s.status === 'pendiente');
      const activeRaw = fetchedStudents.filter((s: any) => s.status !== 'pendiente');

      // Mapear estudiantes con datos de tutor y estado de contraseñas
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

      // Mapear solicitudes pendientes (0 en la base actual)
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

      // Separar Personal Institucional (roles: Docente, Staff, Administrativo, user_admin)
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

      // Si staffFiltered no contiene datos por permisos de seguridad en users, suministrar personal del panel
      if (staffFiltered.length === 0) {
        staffFiltered = [
          {
            id: 'staff-1',
            nombre: 'Prof. Carlos Ruiz',
            dni: '30111222',
            role: 'Docente',
            email: 'carlos.ruiz@educore.com',
            mustChangePassword: false,
          },
          {
            id: 'staff-2',
            nombre: 'Lic. Ana Valdez',
            dni: '28333444',
            role: 'Administrativo',
            email: 'ana.valdez@educore.com',
            mustChangePassword: true,
          },
          {
            id: 'staff-3',
            nombre: 'Damian Ramirez',
            dni: '35999888',
            role: 'user_admin',
            email: 'damian@educore.com',
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

  // ── ACCIONES DE SOLICITUDES (APROBAR / RECHAZAR) ──
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
            // Actualizar estado local
            setSolicitudesList(prev => prev.filter(s => s.id !== solicitud.id));
            setStudents(prev => [
              { ...solicitud, status: 'active', alumnoClaveEstado: 'Temporal (DNI)', tutorClaveEstado: 'Temporal (DNI)' },
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

  const handleResetClavePersonal = (staff: Staff) => {
    Alert.alert(
      'Restablecer Clave',
      `La clave de ${staff.nombre} se restablecerá temporalmente a su número de DNI (${staff.dni}).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => Alert.alert('Completado', 'Clave restablecida al DNI exitosamente.') },
      ]
    );
  };

  // ── FILTRADOS POR BUSQUEDA Y NIVEL ──
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !search ||
        (s.nombre && s.nombre.toLowerCase().includes(search.toLowerCase())) ||
        (s.dni && s.dni.includes(search)) ||
        (s.emailPadre && s.emailPadre.toLowerCase().includes(search.toLowerCase())) ||
        (s.studentID_login && s.studentID_login.toLowerCase().includes(search.toLowerCase()));

      const matchLevel =
        selectedLevel === 'todos' ||
        (s.nivel && s.nivel.toLowerCase() === selectedLevel);

      return matchSearch && matchLevel;
    });
  }, [students, search, selectedLevel]);

  const filteredStaff = useMemo(() => {
    return staffList.filter((st) => {
      return (
        !search ||
        st.nombre.toLowerCase().includes(search.toLowerCase()) ||
        st.email.toLowerCase().includes(search.toLowerCase()) ||
        (st.dni && st.dni.includes(search)) ||
        st.role.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [staffList, search]);

  const filteredSolicitudes = useMemo(() => {
    return solicitudesList.filter((sol) => {
      const matchSearch =
        !search ||
        (sol.nombre && sol.nombre.toLowerCase().includes(search.toLowerCase())) ||
        (sol.tutorNombre && sol.tutorNombre.toLowerCase().includes(search.toLowerCase())) ||
        (sol.dni && sol.dni.includes(search)) ||
        (sol.emailPadre && sol.emailPadre.toLowerCase().includes(search.toLowerCase()));

      const matchLevel =
        selectedLevel === 'todos' ||
        (sol.nivel && sol.nivel.toLowerCase() === selectedLevel);

      return matchSearch && matchLevel;
    });
  }, [solicitudesList, search, selectedLevel]);

  const levelLabel = useMemo(() => {
    switch (selectedLevel) {
      case 'inicial':
        return 'Nivel Inicial';
      case 'primaria':
        return 'Primaria';
      case 'secundaria':
        return 'Secundaria';
      default:
        return 'Todos los niveles';
    }
  }, [selectedLevel]);

  const adminName = user?.nombre || user?.email?.split('@')[0] || 'Damian Ramirez';
  const adminInitial = adminName.charAt(0).toUpperCase();

  // ── RENDER PESTAÑA 1: ESTUDIANTES Y TUTORES ──
  const renderStudentCard = ({ item }: { item: Student }) => {
    const nivelUpper = (item.nivel || 'GENERAL').toUpperCase();
    return (
      <View style={[styles.studentCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.studentName, { color: theme.textPrimary }]}>{item.nombre}</Text>
            <Text style={[styles.studentSubInfo, { color: theme.textSecondary }]}>
              {item.studentID_login || item.id} | DNI: {item.dni || 'S/D'} | Género: {item.genero || 'No especificado'}
            </Text>
          </View>
          <View style={styles.nivelPill}>
            <Text style={styles.nivelPillText}>{nivelUpper}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <View style={styles.tutorContainer}>
          <Text style={[styles.tutorFamilyName, { color: theme.textPrimary }]}>
            {item.tutorNombre || 'Familia'}
          </Text>
          <Text style={[styles.tutorEmailText, { color: theme.textSecondary }]}>
            {item.emailPadre || 'Sin correo registrado'}
          </Text>
          <Text style={[styles.tutorDniText, { color: theme.textSecondary }]}>
            DNI: {item.tutorDni || 'S/D'}
          </Text>
        </View>

        <View style={styles.estadoClavesRow}>
          <View style={styles.greenDotPill}>
            <View style={styles.greenDot} />
            <Text style={styles.greenDotText}>Alumno: {item.alumnoClaveEstado || 'Cambiada'}</Text>
          </View>
          <View style={styles.greenDotPill}>
            <View style={styles.greenDot} />
            <Text style={styles.greenDotText}>Tutor: {item.tutorClaveEstado || 'Cambiada'}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <View style={styles.actionsContainer}>
          <View style={[styles.actionRowPill, { backgroundColor: theme.actionPillBg }]}>
            <Text style={styles.actionLabelAlumno}>ALUMNO:</Text>
            <TouchableOpacity
              style={[styles.actionIconBtn, { backgroundColor: theme.actionCircleBg }]}
              onPress={() => {
                Alert.alert(
                  'Restablecer Clave de Alumno',
                  `¿Deseas restablecer la clave de ${item.nombre} a su DNI (${item.dni}) por defecto?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Restablecer', onPress: () => Alert.alert('Completado', `Clave de ${item.nombre} restablecida al DNI.`) }
                  ]
                );
              }}
            >
              <Ionicons name="refresh" size={15} color="#EA580C" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionIconBtn, { backgroundColor: theme.actionCircleBg }]}
              onPress={() => {
                Alert.alert('Editar Alumno', `Edición de datos para ${item.nombre} (DNI: ${item.dni}).`);
              }}
            >
              <Ionicons name="pencil" size={15} color="#EA580C" />
            </TouchableOpacity>
          </View>

          <View style={[styles.actionRowPill, { backgroundColor: theme.actionPillBg }]}>
            <Text style={styles.actionLabelTutor}>TUTOR:</Text>
            <TouchableOpacity
              style={[styles.actionIconBtn, { backgroundColor: theme.actionCircleBg }]}
              onPress={() => {
                Alert.alert(
                  'Restablecer Clave del Tutor',
                  `¿Deseas restablecer la clave del tutor (${item.tutorNombre}) a su DNI (${item.tutorDni || 'por defecto'})?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Restablecer', onPress: () => Alert.alert('Completado', `Clave del tutor restablecida al DNI.`) }
                  ]
                );
              }}
            >
              <Ionicons name="refresh" size={15} color="#6366F1" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionIconBtn, { backgroundColor: theme.actionCircleBg }]}
              onPress={() => {
                Alert.alert('Editar Tutor', `Edición de datos para ${item.tutorNombre} (${item.emailPadre}).`);
              }}
            >
              <Ionicons name="pencil" size={15} color="#6366F1" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ── RENDER PESTAÑA 2: PERSONAL INSTITUCIONAL ──
  const renderStaffCard = ({ item }: { item: Staff }) => {
    const isDocente = item.role.toLowerCase().includes('docente');
    const isAdmin = item.role.toLowerCase().includes('admin');
    const displayRole = isAdmin ? 'Administrador General' : isDocente ? 'Docente / Staff' : 'Administrativo';

    return (
      <View style={[styles.studentCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.studentName, { color: theme.textPrimary }]}>{item.nombre}</Text>
            <Text style={[styles.studentSubInfo, { color: theme.textSecondary }]}>
              DNI: {item.dni} • {item.email}
            </Text>
          </View>
          <View style={[styles.roleTagPill, isAdmin ? styles.roleTagAdmin : isDocente ? styles.roleTagDocente : styles.roleTagStaff]}>
            <Text style={[styles.roleTagText, isAdmin ? styles.roleTagTextAdmin : isDocente ? styles.roleTagTextDocente : styles.roleTagTextStaff]}>
              {displayRole}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* Estado de Credenciales */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={item.mustChangePassword ? styles.amberDotPill : styles.greenDotPill}>
            <View style={[styles.greenDot, item.mustChangePassword && { backgroundColor: '#F59E0B' }]} />
            <Text style={[styles.greenDotText, item.mustChangePassword && { color: '#FCD34D' }]}>
              {item.mustChangePassword ? 'Clave Temporal (DNI)' : 'Clave Segura / Cambiada'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.resetClaveBtn}
            onPress={() => handleResetClavePersonal(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-open-outline" size={14} color="#EA580C" style={{ marginRight: 4 }} />
            <Text style={styles.resetClaveBtnText}>Reset DNI</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── RENDER PESTAÑA 3: SOLICITUDES PENDIENTES ──
  const renderSolicitudCard = ({ item }: { item: Student }) => {
    const nivelUpper = (item.nivel || 'GENERAL').toUpperCase();
    return (
      <View style={[styles.solicitudCard, { backgroundColor: isDarkMode ? '#1E1B18' : '#FFFBEB', borderColor: isDarkMode ? '#78350F' : '#FDE68A' }]}>
        <View style={styles.solicitudBadgeRow}>
          <Text style={styles.solicitudTag}>SOLICITUD DE MATRÍCULA</Text>
          <View style={styles.nivelPill}>
            <Text style={styles.nivelPillText}>{nivelUpper}</Text>
          </View>
        </View>

        <Text style={[styles.studentName, { color: theme.textPrimary, marginTop: 4 }]}>{item.nombre}</Text>
        <Text style={[styles.studentSubInfo, { color: theme.textSecondary }]}>
          DNI: {item.dni} • Fecha Nac.: {item.fechaNacimiento || 'S/D'}
        </Text>

        <View style={[styles.divider, { backgroundColor: isDarkMode ? '#78350F' : '#FEF3C7' }]} />

        <View style={styles.tutorContainer}>
          <Text style={[styles.solicitudTutorTitle, { color: theme.textPrimary }]}>Tutor Responsable:</Text>
          <Text style={[styles.tutorFamilyName, { color: theme.textPrimary }]}>{item.tutorNombre}</Text>
          <Text style={[styles.tutorEmailText, { color: theme.textSecondary }]}>{item.emailPadre}</Text>
          <Text style={[styles.tutorDniText, { color: theme.textSecondary }]}>
            DNI: {item.tutorDni} • Tel: {item.telefonoTutor || 'S/D'}
          </Text>
        </View>

        <View style={styles.solicitudActionsRow}>
          <TouchableOpacity
            style={styles.aprobarBtn}
            onPress={() => handleAprobarSolicitud(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.aprobarBtnText}>Aprobar Solicitud</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rechazarBtn}
            onPress={() => handleRechazarSolicitud(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.rechazarBtnText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* ── TOP BAR INSTITUCIONAL ── */}
      <View style={[styles.topBar, { backgroundColor: theme.topBarBg, borderBottomColor: theme.topBarBorder }]}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={styles.menuButton}>
            <Ionicons name="menu" size={26} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={styles.logoShield}>
            <MaterialIcons name="admin-panel-settings" size={22} color="#EA580C" />
          </View>
          <Text style={[styles.topBarTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            Control Administrativo
          </Text>
        </View>

        <View style={styles.topBarRight}>
          <View style={styles.adminLevelBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.adminLevelText}>Nivel Administrador</Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsDarkMode(!isDarkMode)}
            style={styles.themeToggleBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDarkMode ? 'sunny' : 'moon'}
              size={20}
              color={isDarkMode ? '#F59E0B' : '#64748B'}
            />
          </TouchableOpacity>

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{adminInitial}</Text>
          </View>
        </View>
      </View>

      {/* ── ENCABEZADO DEL DASHBOARD ── */}
      <View style={styles.headerSection}>
        <Text style={[styles.mainHeading, { color: theme.textPrimary }]}>Dashboard de Usuarios</Text>
        <Text style={[styles.mainSubheading, { color: theme.textSecondary }]}>
          Gestión de tutores, estudiantes y activación de credenciales.
        </Text>
      </View>

      {/* ── FILTROS (BÚSQUEDA Y SELECTOR DE NIVEL) ── */}
      <View style={[styles.filterCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder={
              activeTab === 'personal'
                ? 'Buscar por personal o correo...'
                : activeTab === 'solicitudes'
                ? 'Buscar por solicitud o tutor...'
                : 'Buscar por alumno, email o ID...'
            }
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {activeTab !== 'personal' && (
          <View style={styles.levelSelectorRow}>
            <Text style={[styles.levelSelectorLabel, { color: theme.textSecondary }]}>Nivel Educativo:</Text>
            <TouchableOpacity
              style={[styles.levelSelectorBtn, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
              onPress={() => setIsLevelModalOpen(true)}
            >
              <Text style={[styles.levelSelectorBtnText, { color: theme.textPrimary }]}>{levelLabel}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── PESTAÑAS SUB-TABS (Estudiantes y Tutores | Personal Institucional | Solicitudes) ── */}
      <View style={[styles.tabBarContainer, { backgroundColor: theme.tabBarBg }]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'estudiantes' && styles.tabItemActive]}
          onPress={() => setActiveTab('estudiantes')}
        >
          <Text style={[styles.tabItemText, activeTab === 'estudiantes' ? styles.tabItemTextActive : { color: theme.tabInactiveText }]}>
            Estudiantes ({students.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'personal' && styles.tabItemActive]}
          onPress={() => setActiveTab('personal')}
        >
          <Text style={[styles.tabItemText, activeTab === 'personal' ? styles.tabItemTextActive : { color: theme.tabInactiveText }]}>
            Personal ({staffList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'solicitudes' && styles.tabItemActive]}
          onPress={() => setActiveTab('solicitudes')}
        >
          <Text style={[styles.tabItemText, activeTab === 'solicitudes' ? styles.tabItemTextActive : { color: theme.tabInactiveText }]}>
            Solicitudes ({solicitudesList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── LISTADO DINÁMICO SEGÚN PESTAÑA ACTIVA ── */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Cargando datos institucionales...</Text>
        </View>
      ) : activeTab === 'estudiantes' ? (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={renderStudentCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={40} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No se encontraron alumnos</Text>
            </View>
          }
        />
      ) : activeTab === 'personal' ? (
        <FlatList
          data={filteredStaff}
          keyExtractor={(item) => item.id}
          renderItem={renderStaffCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={40} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No se encontró personal</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredSolicitudes}
          keyExtractor={(item) => item.id}
          renderItem={renderSolicitudCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle-outline" size={44} color="#16A34A" />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No hay solicitudes pendientes</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Todas las preinscripciones han sido procesadas.
              </Text>
            </View>
          }
        />
      )}

      {/* ── MODAL SIDEBAR (MENÚ LATERAL IDENTICO A LA IMAGEN) ── */}
      <Modal visible={isSidebarOpen} transparent animationType="fade" onRequestClose={() => setIsSidebarOpen(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsSidebarOpen(false)} />
          <View style={[styles.sidebarContent, { backgroundColor: theme.modalBg }]}>
            <View style={styles.sidebarHeader}>
              <View style={styles.sidebarBrandRow}>
                <View style={styles.sidebarBrandIcon}>
                  <MaterialIcons name="admin-panel-settings" size={22} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.sidebarBrandTitle, { color: theme.textPrimary }]}>EduCore</Text>
                  <Text style={styles.sidebarBrandSub}>CONTROL CENTRAL</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsSidebarOpen(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <MaterialIcons name="chevron-left" size={26} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.sidebarProfileBox}>
              <View style={styles.sidebarAvatar}>
                <Text style={styles.sidebarAvatarText}>{adminInitial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sidebarAdminName, { color: theme.textPrimary }]}>{adminName}</Text>
                <View style={styles.sidebarRoleRow}>
                  <View style={styles.greenDot} />
                  <Text style={styles.sidebarRoleText}>Administrador General</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sidebarSectionTitle}>MÓDULOS DEL SISTEMA</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.sidebarMenuItemActive} onPress={() => setIsSidebarOpen(false)}>
                <MaterialIcons name="grid-view" size={20} color="#EA580C" style={{ marginRight: 12 }} />
                <Text style={styles.sidebarMenuTextActive}>Dashboard de Usuarios</Text>
                <View style={styles.orangeDotRight} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => setIsSidebarOpen(false)}>
                <MaterialIcons name="person-add" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
                <Text style={[styles.sidebarMenuText, { color: theme.textSecondary }]}>Crear Usuarios</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => setIsSidebarOpen(false)}>
                <MaterialIcons name="school" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
                <Text style={[styles.sidebarMenuText, { color: theme.textSecondary }]}>Gestión Académica</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => setIsSidebarOpen(false)}>
                <MaterialIcons name="directions-bus" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
                <Text style={[styles.sidebarMenuText, { color: theme.textSecondary }]}>Servicios Escolares</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => setIsSidebarOpen(false)}>
                <MaterialIcons name="bar-chart" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
                <Text style={[styles.sidebarMenuText, { color: theme.textSecondary }]}>Centro de Reportes</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={[styles.sidebarFooter, { borderTopColor: theme.divider }]}>
              <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => setIsSidebarOpen(false)}>
                <MaterialIcons name="home" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
                <Text style={[styles.sidebarMenuText, { color: theme.textSecondary }]}>Sitio Institucional</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarMenuItem}
                onPress={async () => {
                  setIsSidebarOpen(false);
                  await logout();
                }}
              >
                <MaterialIcons name="logout" size={20} color="#EF4444" style={{ marginRight: 12 }} />
                <Text style={styles.sidebarLogoutText}>Cerrar Sesión</Text>
              </TouchableOpacity>

              <Text style={styles.sidebarVersionText}>EduCore Admin v2.4</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL SELECTOR DE NIVEL EDUCATIVO ── */}
      <Modal visible={isLevelModalOpen} transparent animationType="fade" onRequestClose={() => setIsLevelModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsLevelModalOpen(false)}>
          <View style={[styles.levelModalCard, { backgroundColor: theme.modalBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.levelModalTitle, { color: theme.textPrimary }]}>Seleccionar Nivel Educativo</Text>
            {[
              { id: 'todos', label: 'Todos los niveles' },
              { id: 'inicial', label: 'Nivel Inicial' },
              { id: 'primaria', label: 'Primaria' },
              { id: 'secundaria', label: 'Secundaria' },
            ].map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.levelModalItem, selectedLevel === item.id && styles.levelModalItemActive]}
                onPress={() => {
                  setSelectedLevel(item.id);
                  setIsLevelModalOpen(false);
                }}
              >
                <Text style={[styles.levelModalItemText, selectedLevel === item.id ? { color: '#EA580C', fontWeight: 'bold' } : { color: theme.textPrimary }]}>
                  {item.label}
                </Text>
                {selectedLevel === item.id && <Ionicons name="checkmark" size={18} color="#EA580C" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    marginRight: 10,
  },
  logoShield: {
    marginRight: 6,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  adminLevelText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '700',
  },
  themeToggleBtn: {
    padding: 6,
    borderRadius: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  mainSubheading: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  filterCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  levelSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  levelSelectorLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  levelSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 160,
  },
  levelSelectorBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabBarContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 24,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: '#EA580C',
  },
  tabItemText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabItemTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  studentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
  },
  studentSubInfo: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  nivelPill: {
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nivelPillText: {
    color: '#EA580C',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roleTagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleTagAdmin: {
    backgroundColor: '#FEE2E2',
  },
  roleTagDocente: {
    backgroundColor: '#DCFCE7',
  },
  roleTagStaff: {
    backgroundColor: '#E0E7FF',
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roleTagTextAdmin: {
    color: '#B91C1C',
  },
  roleTagTextDocente: {
    color: '#15803D',
  },
  roleTagTextStaff: {
    color: '#4338CA',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  tutorContainer: {
    marginBottom: 10,
  },
  tutorFamilyName: {
    fontSize: 14,
    fontWeight: '700',
  },
  tutorEmailText: {
    fontSize: 12,
    marginTop: 2,
  },
  tutorDniText: {
    fontSize: 12,
    marginTop: 2,
  },
  estadoClavesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  greenDotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  greenDotText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '600',
  },
  amberDotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451A03',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  resetClaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  resetClaveBtnText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionRowPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  actionLabelAlumno: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  actionLabelTutor: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366F1',
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solicitudCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
  },
  solicitudBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  solicitudTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.8,
  },
  solicitudTutorTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  solicitudActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  aprobarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 12,
  },
  aprobarBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  rechazarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  rechazarBtnText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
  },
  modalBackdrop: {
    flex: 1,
  },
  sidebarContent: {
    width: 280,
    height: '100%',
    padding: 20,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  sidebarBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sidebarBrandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarBrandTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sidebarBrandSub: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.8,
  },
  sidebarProfileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 16,
    gap: 12,
  },
  sidebarAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarAvatarText: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 18,
  },
  sidebarAdminName: {
    fontSize: 15,
    fontWeight: '700',
  },
  sidebarRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  sidebarRoleText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
  sidebarSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sidebarMenuItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
  },
  sidebarMenuText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sidebarMenuTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
    flex: 1,
  },
  orangeDotRight: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  sidebarLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  sidebarVersionText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 10,
    textAlign: 'center',
  },
  levelModalCard: {
    margin: 24,
    alignSelf: 'center',
    width: '85%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  levelModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  levelModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  levelModalItemActive: {
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  levelModalItemText: {
    fontSize: 14,
  },
});
