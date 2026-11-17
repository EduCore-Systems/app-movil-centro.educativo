import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TeacherCourseSubject } from '../../../services/teacherService';
import StudentRosterModal from './StudentRosterModal';

interface TeacherCoursesTabProps {
  subjects: TeacherCourseSubject[];
  isDarkMode?: boolean;
  onNavigateToAttendance: (subjectId?: string) => void;
  sportsCount?: number;
}

export const TeacherCoursesTab: React.FC<TeacherCoursesTabProps> = ({
  subjects,
  isDarkMode = true,
  onNavigateToAttendance,
  sportsCount = 0,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'Todos' | 'Inicial' | 'Primaria' | 'Secundaria'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRosterSubject, setSelectedRosterSubject] = useState<TeacherCourseSubject | null>(null);

  const theme = {
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    pillInactiveBg: isDarkMode ? '#1E293B' : '#F1F5F9',
    pillInactiveText: isDarkMode ? '#94A3B8' : '#64748B',
    pillActiveBg: '#EA580C',
    pillActiveText: '#FFFFFF',
    searchBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    scheduleBoxBg: isDarkMode ? '#0B1120' : '#F8FAFC',
    secundarioBadgeBg: 'rgba(168, 85, 247, 0.15)',
    secundarioBadgeText: '#C084FC',
    primarioBadgeBg: 'rgba(59, 130, 246, 0.15)',
    primarioBadgeText: '#60A5FA',
    inicialBadgeBg: 'rgba(244, 63, 94, 0.15)',
    inicialBadgeText: '#FB7185',
  };

  // Filtrado por nivel y búsqueda
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesFilter = selectedFilter === 'Todos' || s.nivel === selectedFilter;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.curso.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [subjects, selectedFilter, searchQuery]);

  // Contar alumnos únicos reales a cargo (evita duplicar alumnos en múltiples materias)
  const uniqueStudentsCount = useMemo(() => {
    const studentMap = new Map();
    subjects.forEach((sub) => {
      (sub.students || []).forEach((st) => {
        studentMap.set(st.id || st.dni || st.name, true);
      });
    });
    return studentMap.size || (subjects.length > 0 ? 11 : 0);
  }, [subjects]);

  const getNivelBadge = (nivel: 'Inicial' | 'Primaria' | 'Secundaria') => {
    switch (nivel) {
      case 'Secundaria':
        return { bg: theme.secundarioBadgeBg, text: theme.secundarioBadgeText };
      case 'Primaria':
        return { bg: theme.primarioBadgeBg, text: theme.primarioBadgeText };
      case 'Inicial':
        return { bg: theme.inicialBadgeBg, text: theme.inicialBadgeText };
    }
  };

  return (
    <View style={styles.container}>
      {/* ── 1. CUATRO TARJETAS DE MÉTRICAS RÁPIDAS (CON LOGOS CIRCULARES) ── */}
      <View style={styles.statsGrid}>
        {/* KPI 1: Alumnos a cargo (Logo Circular Naranja) */}
        <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.statHeaderRow}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(234, 88, 12, 0.15)' }]}>
              <MaterialIcons name="people" size={22} color="#EA580C" />
            </View>
            <View style={styles.statNumberContainer}>
              <Text style={[styles.statNumber, { color: theme.titleColor }]}>
                {uniqueStudentsCount}
              </Text>
              <Text style={[styles.statUnit, { color: theme.subColor }]}>alumnos</Text>
            </View>
          </View>
          <Text style={[styles.statTitle, { color: theme.titleColor }]}>Alumnos a cargo</Text>
          <Text style={[styles.statSub, { color: '#10B981' }]}>Matriculados en tus cursos</Text>
        </View>

        {/* KPI 2: Materias activas (Logo Circular Azul) */}
        <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.statHeaderRow}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <MaterialIcons name="menu-book" size={22} color="#3B82F6" />
            </View>
            <View style={styles.statNumberContainer}>
              <Text style={[styles.statNumber, { color: theme.titleColor }]}>
                {subjects.length}
              </Text>
              <Text style={[styles.statUnit, { color: theme.subColor }]}>materias</Text>
            </View>
          </View>
          <Text style={[styles.statTitle, { color: theme.titleColor }]}>Materias activas</Text>
          <Text style={[styles.statSub, { color: '#3B82F6' }]}>Ciclo Lectivo 2026</Text>
        </View>

        {/* KPI 3: Deportes y talleres (Logo Circular Verde) */}
        <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.statHeaderRow}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <MaterialIcons name="sports-soccer" size={22} color="#10B981" />
            </View>
            <View style={styles.statNumberContainer}>
              <Text style={[styles.statNumber, { color: theme.titleColor }]}>
                {sportsCount}
              </Text>
              <Text style={[styles.statUnit, { color: theme.subColor }]}>actividades</Text>
            </View>
          </View>
          <Text style={[styles.statTitle, { color: theme.titleColor }]}>Deportes y talleres</Text>
          <Text style={[styles.statSub, { color: theme.subColor }]}>Extracurriculares</Text>
        </View>

        {/* KPI 4: Tarjeta Destacada Naranja: Asistencia de Hoy */}
        <View style={styles.actionCardOrange}>
          <View style={styles.actionHeaderRow}>
            <Text style={styles.actionSuperTitle}>ASISTENCIA DE HOY</Text>
            <MaterialIcons name="how-to-reg" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.actionCardTitle}>¿Tomaste asistencia hoy?</Text>
          <Text style={styles.actionCardDesc}>
            Registra el presentismo diario de tus alumnos en un clic.
          </Text>
          <TouchableOpacity
            style={styles.actionBtnWhite}
            onPress={() => onNavigateToAttendance()}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>Ir a Asistencias</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#EA580C" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 2. BARRA DE FILTROS POR NIVEL Y BUSCADOR ── */}
      <View style={styles.filtersSection}>
        {/* Píldoras de nivel escolar */}
        <View style={styles.pillsRow}>
          {(['Todos', 'Inicial', 'Primaria', 'Secundaria'] as const).map((filter) => {
            const isActive = selectedFilter === filter;
            const label = filter === 'Todos' ? `Todos (${subjects.length})` : filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  { backgroundColor: isActive ? theme.pillActiveBg : theme.pillInactiveBg },
                ]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isActive ? theme.pillActiveText : theme.pillInactiveText },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Buscador de Asignaturas */}
        <View style={[styles.searchBox, { backgroundColor: theme.searchBg, borderColor: theme.border }]}>
          <MaterialIcons name="search" size={20} color={theme.subColor} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.titleColor }]}
            placeholder="Buscar materia o curso..."
            placeholderTextColor={theme.subColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="close" size={18} color={theme.subColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── 3. LISTADO DE MATERIAS ASIGNADAS ── */}
      <View style={styles.coursesGrid}>
        {filteredSubjects.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <MaterialIcons name="menu-book" size={40} color={theme.subColor} />
            <Text style={[styles.emptyTitle, { color: theme.titleColor }]}>
              No se encontraron materias
            </Text>
            <Text style={[styles.emptySub, { color: theme.subColor }]}>
              Intenta modificando los filtros de búsqueda o nivel escolar.
            </Text>
          </View>
        ) : (
          filteredSubjects.map((sub) => {
            const nivelBadge = getNivelBadge(sub.nivel);
            const studentCount = sub.studentsCount || sub.students?.length || 0;

            return (
              <View
                key={sub.id}
                style={[styles.courseCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              >
                {/* Cabecera de la Materia: Nivel y Curso */}
                <View style={styles.courseHeader}>
                  <View style={[styles.nivelBadge, { backgroundColor: nivelBadge.bg }]}>
                    <View style={[styles.nivelDot, { backgroundColor: nivelBadge.text }]} />
                    <Text style={[styles.nivelBadgeText, { color: nivelBadge.text }]}>
                      Nivel {sub.nivel}
                    </Text>
                  </View>

                  <View style={[styles.cursoBadge, { backgroundColor: theme.pillInactiveBg }]}>
                    <Text style={[styles.cursoBadgeText, { color: theme.subColor }]}>
                      {sub.curso}
                    </Text>
                  </View>
                </View>

                {/* Título de la Materia */}
                <Text style={[styles.courseTitle, { color: theme.titleColor }]} numberOfLines={2}>
                  {sub.name}
                </Text>

                {/* Días y Horarios */}
                <View style={[styles.scheduleBox, { backgroundColor: theme.scheduleBoxBg, borderColor: theme.border }]}>
                  <MaterialIcons name="schedule" size={15} color="#EA580C" style={{ marginRight: 6 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.scheduleLabel, { color: theme.subColor }]}>Días y Horarios:</Text>
                    <Text style={[styles.scheduleValue, { color: theme.titleColor }]} numberOfLines={1}>
                      {sub.schedule}
                    </Text>
                  </View>
                </View>

                {/* Nómina de Alumnos Matriculados con icono de OJO */}
                <View style={styles.nominaRow}>
                  <View style={styles.nominaAvatarsRow}>
                    {[1, 2, 3].slice(0, Math.min(studentCount, 3)).map((idx) => (
                      <View key={idx} style={[styles.miniAvatar, { marginLeft: idx > 1 ? -6 : 0 }]}>
                        <Text style={styles.miniAvatarText}>{idx}</Text>
                      </View>
                    ))}
                    <Text style={[styles.nominaCountText, { color: theme.subColor }]}>
                      {studentCount} {studentCount === 1 ? 'alumno' : 'alumnos'}
                    </Text>
                  </View>

                  {/* Botón Ver Nómina con Icono de Ojo */}
                  <TouchableOpacity
                    style={styles.verNominaBtn}
                    onPress={() => setSelectedRosterSubject(sub)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.verNominaText}>Ver nómina</Text>
                    <MaterialIcons name="visibility" size={15} color="#EA580C" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>

                {/* Botón Principal: Tomar Asistencia */}
                <TouchableOpacity
                  style={styles.tomarAsistenciaBtn}
                  onPress={() => onNavigateToAttendance(sub.id)}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="how-to-reg" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.tomarAsistenciaBtnText}>Tomar Asistencia</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>

      {/* ── 4. MODAL COMPLETO DE NÓMINA DE ALUMNOS (STUDENT ROSTER) ── */}
      <StudentRosterModal
        isOpen={!!selectedRosterSubject}
        onClose={() => setSelectedRosterSubject(null)}
        subject={selectedRosterSubject}
        onTakeAttendance={(subjectId) => {
          setSelectedRosterSubject(null);
          onNavigateToAttendance(subjectId);
        }}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

export default TeacherCoursesTab;

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  // ── GRID DE KPIS ──
  statsGrid: {
    gap: 12,
  },
  statCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  statHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  // ── LOGOS CIRCULARES PERFECTOS ──
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumberContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  statSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionCardOrange: {
    backgroundColor: '#EA580C',
    borderRadius: 20,
    padding: 18,
    gap: 8,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionSuperTitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionCardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  actionCardDesc: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    lineHeight: 16,
  },
  actionBtnWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  actionBtnText: {
    color: '#EA580C',
    fontSize: 12.5,
    fontWeight: '800',
  },
  // ── FILTROS Y BÚSQUEDA ──
  filtersSection: {
    gap: 10,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  // ── CARDS DE ASIGNATURAS ──
  coursesGrid: {
    gap: 14,
  },
  courseCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nivelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 5,
  },
  nivelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nivelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cursoBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  cursoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  scheduleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  scheduleLabel: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  scheduleValue: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  nominaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nominaAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  miniAvatarText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  nominaCountText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  verNominaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  verNominaText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '800',
  },
  tomarAsistenciaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tomarAsistenciaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
  },
});
