import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TeacherCourseSubject } from '../../../services/teacherService';

interface TeacherCoursesTabProps {
  subjects: TeacherCourseSubject[];
  isDarkMode?: boolean;
  onNavigateToAttendance: (subjectId?: string) => void;
}

export const TeacherCoursesTab: React.FC<TeacherCoursesTabProps> = ({
  subjects,
  isDarkMode = true,
  onNavigateToAttendance,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'Todos' | 'Inicial' | 'Primaria' | 'Secundaria'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

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
  const filteredSubjects = subjects.filter((s) => {
    const matchesFilter = selectedFilter === 'Todos' || s.nivel === selectedFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.curso.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalStudents = subjects.reduce((acc, s) => acc + s.studentsCount, 0);

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
      {/* ── 1. CUATRO TARJETAS DE MÉTRICAS RÁPIDAS ── */}
      <View style={styles.statsGrid}>
        {/* Alumnos a cargo */}
        <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.statHeaderRow}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(147, 51, 234, 0.12)' }]}>
              <MaterialIcons name="people" size={20} color="#A855F7" />
            </View>
            <Text style={[styles.statNumber, { color: theme.titleColor }]}>{totalStudents || 11}</Text>
          </View>
          <Text style={[styles.statTitle, { color: theme.titleColor }]}>Alumnos a cargo</Text>
          <Text style={[styles.statSub, { color: theme.subColor }]}>Matriculados en tus cursos</Text>
        </View>

        {/* Materias activas */}
        <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.statHeaderRow}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
              <MaterialIcons name="menu-book" size={20} color="#3B82F6" />
            </View>
            <Text style={[styles.statNumber, { color: theme.titleColor }]}>{subjects.length || 16}</Text>
          </View>
          <Text style={[styles.statTitle, { color: theme.titleColor }]}>Materias activas</Text>
          <Text style={[styles.statSub, { color: theme.subColor }]}>Ciclo Lectivo 2026</Text>
        </View>

        {/* Deportes y talleres */}
        <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.statHeaderRow}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <MaterialIcons name="sports-soccer" size={20} color="#10B981" />
            </View>
            <Text style={[styles.statNumber, { color: theme.titleColor }]}>0</Text>
          </View>
          <Text style={[styles.statTitle, { color: theme.titleColor }]}>Deportes y talleres</Text>
          <Text style={[styles.statSub, { color: theme.subColor }]}>Extracurriculares</Text>
        </View>

        {/* Tarjeta Destacada: Asistencia de Hoy */}
        <View style={styles.actionCardOrange}>
          <View style={styles.actionHeaderRow}>
            <Text style={styles.actionSuperTitle}>ASISTENCIA DE HOY</Text>
            <MaterialIcons name="how-to-reg" size={20} color="#FFFFFF" />
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

      {/* ── 2. FILTROS POR NIVEL Y BUSCADOR ── */}
      <View style={styles.filtersSection}>
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
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isActive ? theme.pillActiveText : theme.pillInactiveText,
                      fontWeight: isActive ? '800' : '600',
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Buscador de materias */}
        <View style={[styles.searchBox, { backgroundColor: theme.searchBg, borderColor: theme.border }]}>
          <MaterialIcons name="search" size={20} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.titleColor }]}
            placeholder="Buscar materia o curso..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── 3. LISTADO DE MATERIAS Y CURSOS ── */}
      <View style={styles.subjectsList}>
        {filteredSubjects.map((sub) => {
          const badgeStyle = getNivelBadge(sub.nivel);
          return (
            <View
              key={sub.id}
              style={[
                styles.courseCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              {/* Badges superiores: Nivel y Curso */}
              <View style={styles.cardBadgesRow}>
                <View style={[styles.nivelBadge, { backgroundColor: badgeStyle.bg }]}>
                  <Text style={[styles.nivelBadgeText, { color: badgeStyle.text }]}>
                    • Nivel {sub.nivel}
                  </Text>
                </View>

                <View style={[styles.cursoBadge, { backgroundColor: theme.pillInactiveBg }]}>
                  <Text style={[styles.cursoBadgeText, { color: theme.subColor }]}>
                    {sub.curso}
                  </Text>
                </View>
              </View>

              {/* Título de la Materia */}
              <Text style={[styles.courseTitle, { color: theme.titleColor }]}>
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

              {/* Alumnos en nómina */}
              <View style={styles.nominaRow}>
                <View style={styles.nominaAvatarsRow}>
                  {[1, 2, 3].map((idx) => (
                    <View key={idx} style={[styles.miniAvatar, { marginLeft: idx > 1 ? -6 : 0 }]}>
                      <Text style={styles.miniAvatarText}>{idx}</Text>
                    </View>
                  ))}
                  <Text style={[styles.nominaCountText, { color: theme.subColor }]}>
                    {sub.studentsCount} alumnos
                  </Text>
                </View>

                <Text style={styles.verNominaText}>Ver nómina →</Text>
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
        })}
      </View>
    </View>
  );
};

export default TeacherCoursesTab;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  statsGrid: {
    gap: 10,
  },
  statCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  statHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  statSub: {
    fontSize: 11.5,
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
  filtersSection: {
    gap: 10,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  filterPillText: {
    fontSize: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  subjectsList: {
    gap: 12,
  },
  courseCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nivelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  nivelBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  cursoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  cursoBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  scheduleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  scheduleLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  scheduleValue: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 1,
  },
  nominaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
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
    fontWeight: '800',
  },
  nominaCountText: {
    fontSize: 11.5,
    marginLeft: 8,
  },
  verNominaText: {
    fontSize: 11.5,
    color: '#EA580C',
    fontWeight: '700',
  },
  tomarAsistenciaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 11,
    borderRadius: 14,
  },
  tomarAsistenciaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
