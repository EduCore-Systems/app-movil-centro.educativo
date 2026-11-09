import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Text,
} from 'react-native';
import StudentTopBar from './StudentTopBar';
import StudentSidebar from './StudentSidebar';
import StudentNavTabs, { StudentTab } from '../../molecules/student/StudentNavTabs';
import StudentProfileTab from './StudentProfileTab';
import FamilyDocumentModal from '../family/FamilyDocumentModal';
import AttendanceHistoryModal from '../../molecules/family/AttendanceHistoryModal';
import { getStudentAttendanceHistory, AttendanceRecord } from '../../../services/attendanceService';
import { getStudentProfile, StudentProfileData, DEFAULT_MATEO_ROSSI } from '../../../services/studentService';
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
  const [student, setStudent] = useState<StudentProfileData>(DEFAULT_MATEO_ROSSI);
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
  const [totalClasses, setTotalClasses] = useState(20);

  const mainScrollRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const data = await getStudentProfile(user);
        if (isMounted) setStudent(data);
        const attData = await getStudentAttendanceHistory(data.id, data.dni);
        if (isMounted) {
          setAttendanceRecords(attData.history || []);
          if (attData.totalClasses) setTotalClasses(attData.totalClasses);
        }
      } catch (err) {
        console.error('Error cargando estudiante:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStudent();
    return () => { isMounted = false; };
  }, [user]);

  const theme = {
    bg: isDarkMode ? '#0A0F1D' : '#F8FAFC',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
  };

  const handleSelectTab = (tab: StudentTab) => {
    setActiveTab(tab);
    mainScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

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
      >
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
                onOpenDocument={(type) => setDocModal({ isOpen: true, type })}
              />
            )}

            {/* PESTAÑA 2: Mis Asignaturas (Fase 2) */}
            {activeTab === 'materias' && (
              <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <Text style={[styles.placeholderTitle, { color: theme.titleColor }]}>
                  Mis Asignaturas en Curso
                </Text>
                <Text style={[styles.placeholderSub, { color: theme.subColor }]}>
                  Fase 2: Grilla temática con Matemática I, Lengua, Química, Historia e Inglés.
                </Text>
              </View>
            )}

            {/* PESTAÑA 3: Horario Semanal (Fase 3) */}
            {activeTab === 'horario' && (
              <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <Text style={[styles.placeholderTitle, { color: theme.titleColor }]}>
                  Horario Semanal
                </Text>
                <Text style={[styles.placeholderSub, { color: theme.subColor }]}>
                  Fase 3: Selector de Lunes a Viernes con cronograma oficial de clases y talleres.
                </Text>
              </View>
            )}

            {/* PESTAÑA 4: Servicios y Talleres (Fase 4) */}
            {activeTab === 'servicios' && (
              <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <Text style={[styles.placeholderTitle, { color: theme.titleColor }]}>
                  Servicios y Talleres
                </Text>
                <Text style={[styles.placeholderSub, { color: theme.subColor }]}>
                  Fase 4: Deportes extracurriculares con cupo 2/2 y logística en modo lectura.
                </Text>
              </View>
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
