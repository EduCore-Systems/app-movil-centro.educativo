import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Text,
} from 'react-native';
import TeacherTopBar from './TeacherTopBar';
import TeacherSidebar from './TeacherSidebar';
import TeacherNavTabs, { TeacherTab } from '../../molecules/teacher/TeacherNavTabs';
import TeacherCoursesTab from './TeacherCoursesTab';
import { TeacherAttendanceTab } from './TeacherAttendanceTab';
import { TeacherMessagesTab } from './TeacherMessagesTab';
import { TeacherScheduleTab } from './TeacherScheduleTab';
import {
  TeacherCourseSubject,
  TeacherProfileData,
  DEFAULT_TEACHER,
  getTeacherAcademicData,
} from '../../../services/teacherService';
import { useAuth } from '../../../context/AuthContext';

interface TeacherPanelProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({
  isDarkMode = true,
  onToggleTheme,
}) => {
  const { user, logout } = useAuth();
  const [teacher, setTeacher] = useState<TeacherProfileData>({
    ...DEFAULT_TEACHER,
    nombre: user?.nombre || DEFAULT_TEACHER.nombre,
    email: user?.email || DEFAULT_TEACHER.email,
  });
  const [subjects, setSubjects] = useState<TeacherCourseSubject[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [sportsCount, setSportsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TeacherTab>('cursos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined);

  const mainScrollRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const academicData = await getTeacherAcademicData(user);
        if (isMounted) {
          setSubjects(academicData.subjects);
          setSports(academicData.sports || []);
          setSportsCount(academicData.sportsCount);
          if (user?.nombre) {
            setTeacher(prev => ({
              ...prev,
              nombre: user.nombre || prev.nombre,
              email: user.email || prev.email,
              role: user.role || prev.role,
            }));
          }
        }
      } catch (err) {
        console.warn('Error cargando materias de docente:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCourses();
    return () => { isMounted = false; };
  }, [user]);

  const theme = {
    bg: isDarkMode ? '#0A0F1D' : '#F8FAFC',
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
  };

  const handleSelectTab = (tab: TeacherTab) => {
    setActiveTab(tab);
    mainScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNavigateToAttendance = (subjectId?: string) => {
    if (subjectId) setSelectedSubjectId(subjectId);
    setActiveTab('asistencia');
    mainScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* ── TOPBAR FIJO DEL DOCENTE ── */}
      <TeacherTopBar
        isDarkMode={isDarkMode}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onToggleTheme={onToggleTheme || (() => {})}
        teacherName={teacher.nombre}
      />

      <ScrollView
        ref={mainScrollRef}
        style={styles.contentScroll}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ── NAVEGADOR DE PESTAÑAS DOCENTE ── */}
        <TeacherNavTabs
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isDarkMode={isDarkMode}
        />

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#EA580C" />
            <Text style={[styles.loadingText, { color: theme.subColor }]}>
              Cargando cursos y materias...
            </Text>
          </View>
        ) : (
          <>
            {/* PESTAÑA 1: Mis Cursos y Materias (Fase 1) */}
            {activeTab === 'cursos' && (
              <TeacherCoursesTab
                subjects={subjects}
                sportsCount={sportsCount}
                isDarkMode={isDarkMode}
                onNavigateToAttendance={handleNavigateToAttendance}
              />
            )}

            {/* PESTAÑA 2: Tomar Asistencia (Fase 2) */}
            {activeTab === 'asistencia' && (
              <TeacherAttendanceTab
                subjects={subjects}
                selectedSubjectId={selectedSubjectId}
                isDarkMode={isDarkMode}
                user={user}
              />
            )}

            {/* PESTAÑA 3: Mensajes con Familias (Fase 3) */}
            {activeTab === 'mensajes' && (
              <TeacherMessagesTab
                user={user}
                subjects={subjects}
                isDarkMode={isDarkMode}
              />
            )}

            {/* PESTAÑA 4: Mi Cronograma Semanal (Fase 4) */}
            {activeTab === 'horario' && (
              <TeacherScheduleTab
                subjects={subjects}
                sports={sports}
                isDarkMode={isDarkMode}
              />
            )}

            {/* PESTAÑA 5: Deportes y Talleres (Fase 5) */}
            {activeTab === 'talleres' && (
              <View style={[styles.placeholderCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <Text style={[styles.placeholderTitle, { color: theme.titleColor }]}>
                  Deportes y Talleres Extracurriculares
                </Text>
                <Text style={[styles.placeholderSub, { color: theme.subColor }]}>
                  Fase 5: Espacios formativos, entrenamientos y talleres a tu cargo.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ── SIDEBAR DEL DOCENTE ── */}
      <TeacherSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onLogout={logout}
        teacher={teacher}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
};

export default TeacherPanel;

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
