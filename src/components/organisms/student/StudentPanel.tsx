import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import StudentTopBar from './StudentTopBar';
import StudentSidebar from './StudentSidebar';
import StudentNavTabs, { StudentTab } from '../../molecules/student/StudentNavTabs';
import StudentProfileTab from './StudentProfileTab';
import StudentSubjectsTab from './StudentSubjectsTab';
import StudentScheduleTab from './StudentScheduleTab';
import StudentServicesTab from './StudentServicesTab';
import FamilyDocumentModal from '../family/FamilyDocumentModal';
import AttendanceHistoryModal from '../../molecules/family/AttendanceHistoryModal';
import { getStudentAttendanceHistory, AttendanceRecord } from '../../../services/attendanceService';
import {
  getStudentProfile,
  subscribeStudentProfile,
  StudentProfileData,
} from '../../../services/studentService';
import { useAuth } from '../../../context/AuthContext';

interface StudentPanelProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const StudentPanel: React.FC<StudentPanelProps> = ({
  isDarkMode = true,
  onToggleTheme,
}) => {
  const { user, logout } = useAuth();
  const [student, setStudent] = useState<StudentProfileData>({
    id: user?.uid || '',
    nombre: user?.nombre || 'Estudiante',
    dni: user?.dni || '',
    studentID_login: user?.studentID_login || user?.legajo || '',
    curso: user?.curso || '1° Año A',
    nivel: user?.nivel || 'Secundaria',
    promedio: user?.promedio !== undefined ? user.promedio : 8.8,
    conducta: user?.conducta || 'Excelente',
    asistencia: user?.asistencia || '96% Óptima',
    asistencia_porcentaje: user?.asistencia_porcentaje || 96,
    deportes: user?.deportes || [],
    usa_comedor: Boolean(user?.usa_comedor),
    transporte_recorrido: user?.transporte_recorrido || 'Recorrido Norte (Av. Alvear - Sarmiento)',
    status: user?.status || 'activo',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StudentTab>('ficha');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modales oficiales
  const [docModal, setDocModal] = useState<{ isOpen: boolean; type: 'boletin' | 'certificado' }>({
    isOpen: false,
    type: 'boletin',
  });
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [totalClasses, setTotalClasses] = useState(25);
  const [refreshing, setRefreshing] = useState(false);

  const mainScrollRef = useRef<any>(null);

  // Suscripción en tiempo real al perfil del estudiante desde Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeStudentProfile(user, async (updatedData) => {
      setStudent(updatedData);
      setLoading(false);
      try {
        const attData = await getStudentAttendanceHistory(updatedData.id, updatedData.dni);
        setAttendanceRecords(attData.history || []);
        if (attData.totalClasses) setTotalClasses(attData.totalClasses);
      } catch (e) {
        console.warn('Error cargando historial de asistencia:', e);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getStudentProfile(user);
      setStudent(data);
      const attData = await getStudentAttendanceHistory(data.id, data.dni);
      setAttendanceRecords(attData.history || []);
      if (attData.totalClasses) setTotalClasses(attData.totalClasses);
    } catch (e) {
      console.warn('Error refrescando perfil de estudiante:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const theme = {
    bg: isDarkMode ? '#0A0F1D' : '#F8FAFC',
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
  };

  const handleSelectTab = (tab: StudentTab) => {
    setActiveTab(tab);
    mainScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const firstName = (student.nombre || 'Estudiante').split(' ')[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* ── TOPBAR DEL ESTUDIANTE ── */}
      <StudentTopBar
        isDarkMode={isDarkMode}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onToggleTheme={onToggleTheme || (() => {})}
        studentName={student.nombre}
      />

      <ScrollView
        ref={mainScrollRef}
        style={styles.contentScroll}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#EA580C"
            colors={['#EA580C']}
          />
        }
      >
        {/* ── HERO SALUDO Y BOTONES CONSTANCIAS (PERSISTENTES ARRIBA) ── */}
        <View style={styles.heroSection}>
          <View style={styles.heroLeft}>
            <View style={styles.greetingRow}>
              <Text style={[styles.greetingTitle, { color: theme.titleColor }]}>
                Hola, {firstName} 👋
              </Text>
              <View style={styles.matriculaPill}>
                <View style={styles.greenPulse} />
                <Text style={styles.matriculaPillText}>Matrícula Regular</Text>
              </View>
            </View>

            <Text style={[styles.schoolSubtitle, { color: theme.subColor }]}>
              Centro Educativo EduCore · {student.curso} ({student.nivel})
            </Text>
          </View>

          {/* Botones de Descarga Rápida */}
          <View style={styles.docButtonsRow}>
            <TouchableOpacity
              style={[styles.docBtnOutline, { borderColor: theme.border, backgroundColor: theme.cardBg }]}
              onPress={() => setDocModal({ isOpen: true, type: 'boletin' })}
              activeOpacity={0.8}
            >
              <MaterialIcons name="download" size={16} color={theme.subColor} style={{ marginRight: 6 }} />
              <Text style={[styles.docBtnOutlineText, { color: theme.titleColor }]}>Descargar Boletín</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.docBtnFilled}
              onPress={() => setDocModal({ isOpen: true, type: 'certificado' })}
              activeOpacity={0.8}
            >
              <MaterialIcons name="verified" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.docBtnFilledText}>Certificado Regular</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── NAVEGADOR DE PESTAÑAS ── */}
        <StudentNavTabs
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isDarkMode={isDarkMode}
        />

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#EA580C" />
            <Text style={[styles.loadingText, { color: theme.subColor }]}>
              Cargando perfil académico...
            </Text>
          </View>
        ) : (
          <>
            {/* PESTAÑA 1: Mi Ficha Académica */}
            {activeTab === 'ficha' && (
              <StudentProfileTab
                student={student}
                isDarkMode={isDarkMode}
                onOpenAttendanceModal={() => setIsAttendanceModalOpen(true)}
              />
            )}

            {/* PESTAÑA 2: Mis Asignaturas */}
            {activeTab === 'materias' && (
              <StudentSubjectsTab isDarkMode={isDarkMode} />
            )}

            {/* PESTAÑA 3: Horario Semanal */}
            {activeTab === 'horario' && (
              <StudentScheduleTab isDarkMode={isDarkMode} />
            )}

            {/* PESTAÑA 4: Servicios y Talleres */}
            {activeTab === 'servicios' && (
              <StudentServicesTab
                student={student}
                isDarkMode={isDarkMode}
              />
            )}
          </>
        )}
      </ScrollView>

      {/* ── SIDEBAR DEL ESTUDIANTE ── */}
      <StudentSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onLogout={logout}
        student={student}
        onOpenDocument={(type) => setDocModal({ isOpen: true, type })}
        onToggleTheme={onToggleTheme || (() => {})}
        isDarkMode={isDarkMode}
      />

      {/* ── MODAL VISOR FORMAL DE DOCUMENTOS (REUTILIZACIÓN EXACTA DRY) ── */}
      <FamilyDocumentModal
        isOpen={docModal.isOpen}
        onClose={() => setDocModal((prev) => ({ ...prev, isOpen: false }))}
        type={docModal.type}
        student={student as any}
      />

      {/* ── MODAL DE ASISTENCIAS DETALLADAS ── */}
      <AttendanceHistoryModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        studentName={student.nombre}
        percentage={student.asistencia_porcentaje}
        totalClasses={totalClasses}
        history={attendanceRecords}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
};

export default StudentPanel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroSection: {
    gap: 12,
  },
  heroLeft: {
    gap: 4,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  matriculaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  matriculaPillText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  schoolSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  docButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  docBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
  },
  docBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
  },
  docBtnFilled: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  docBtnFilledText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
  },
  placeholderCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  placeholderSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
