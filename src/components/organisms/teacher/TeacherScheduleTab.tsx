import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TeacherCourseSubject } from '../../../services/teacherService';

export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export interface ScheduleItem {
  id: string;
  title: string;
  subtitle: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: 'subject' | 'sport';
  level?: string;
}

interface TeacherScheduleTabProps {
  subjects?: TeacherCourseSubject[];
  sports?: any[];
  isDarkMode?: boolean;
}

export const TeacherScheduleTab: React.FC<TeacherScheduleTabProps> = ({
  subjects = [],
  sports = [],
  isDarkMode = true,
}) => {
  const [selectedDayMobile, setSelectedDayMobile] = useState('Lunes');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const theme = {
    bg: isDarkMode ? '#0A0F1D' : '#F8FAFC',
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    accent: '#EA580C',
    pillInactiveBg: isDarkMode ? '#1E293B' : '#F1F5F9',
    subjectCardBg: isDarkMode ? 'rgba(234, 88, 12, 0.08)' : 'rgba(254, 243, 199, 0.55)',
    subjectCardBorder: isDarkMode ? 'rgba(234, 88, 12, 0.35)' : '#FED7AA',
    sportCardBg: isDarkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(209, 250, 229, 0.55)',
    sportCardBorder: isDarkMode ? 'rgba(16, 185, 129, 0.35)' : '#A7F3D0',
    subjectBadgeBg: isDarkMode ? 'rgba(234, 88, 12, 0.22)' : 'rgba(234, 88, 12, 0.15)',
    subjectBadgeText: isDarkMode ? '#FB923C' : '#EA580C',
    sportBadgeBg: isDarkMode ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.15)',
    sportBadgeText: isDarkMode ? '#34D399' : '#059669',
  };

  // Consolidar todos los ítems de horario del docente
  const scheduleItems = useMemo<ScheduleItem[]>(() => {
    const items: ScheduleItem[] = [];

    // Materias
    subjects.forEach((sub) => {
      if (sub.schedules && sub.schedules.length > 0) {
        sub.schedules.forEach((sch: any) => {
          items.push({
            id: `${sub.id}-${sch.dayOfWeek}-${sch.startTime}`,
            title: sub.name,
            subtitle: sub.courseName || sub.curso || 'Curso General',
            dayOfWeek: sch.dayOfWeek,
            startTime: sch.startTime || '08:00',
            endTime: sch.endTime || '09:30',
            type: 'subject',
            level: sub.courseLevel,
          });
        });
      } else if (sub.schedule) {
        // Parser auxiliar si el horario viene como string compuesto
        const parts = sub.schedule.split('·').map(p => p.trim());
        parts.forEach((part, idx) => {
          for (const day of DAYS_OF_WEEK) {
            if (part.toLowerCase().includes(day.toLowerCase())) {
              const timeMatch = part.match(/(\d{1,2}:\d{2})\s*(?:a|-)\s*(\d{1,2}:\d{2})/);
              const startTime = timeMatch ? timeMatch[1].padStart(5, '0') : '08:00';
              const endTime = timeMatch ? timeMatch[2].padStart(5, '0') : '09:30';
              items.push({
                id: `${sub.id}-${day}-${startTime}-${idx}`,
                title: sub.name,
                subtitle: sub.courseName || sub.curso || 'Curso General',
                dayOfWeek: day,
                startTime,
                endTime,
                type: 'subject',
                level: sub.courseLevel,
              });
            }
          }
        });
      }
    });

    // Deportes y Talleres Extracurriculares
    sports.forEach((sp) => {
      if (sp.schedules && sp.schedules.length > 0) {
        sp.schedules.forEach((sch: any) => {
          items.push({
            id: `${sp.id}-${sch.dayOfWeek}-${sch.startTime}`,
            title: sp.name,
            subtitle: 'Taller Extracurricular',
            dayOfWeek: sch.dayOfWeek,
            startTime: sch.startTime || '17:00',
            endTime: sch.endTime || '18:30',
            type: 'sport',
            level: 'todos',
          });
        });
      } else if (sp.schedule) {
        const parts = sp.schedule.split('·').map((p: string) => p.trim());
        parts.forEach((part: string, idx: number) => {
          for (const day of DAYS_OF_WEEK) {
            if (part.toLowerCase().includes(day.toLowerCase())) {
              const timeMatch = part.match(/(\d{1,2}:\d{2})\s*(?:a|-)\s*(\d{1,2}:\d{2})/);
              const startTime = timeMatch ? timeMatch[1].padStart(5, '0') : '16:00';
              const endTime = timeMatch ? timeMatch[2].padStart(5, '0') : '17:30';
              items.push({
                id: `${sp.id}-${day}-${startTime}-${idx}`,
                title: sp.name,
                subtitle: 'Taller Extracurricular',
                dayOfWeek: day,
                startTime,
                endTime,
                type: 'sport',
                level: 'todos',
              });
            }
          }
        });
      }
    });

    // Ordenar cronológicamente por hora de inicio
    return items.sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
  }, [subjects, sports]);

  // Agrupar ítems por día de la semana
  const itemsByDay = useMemo(() => {
    const grouped: Record<string, ScheduleItem[]> = {};
    DAYS_OF_WEEK.forEach((day) => {
      grouped[day] = scheduleItems.filter(
        (i) => i.dayOfWeek?.toLowerCase() === day.toLowerCase()
      );
    });
    return grouped;
  }, [scheduleItems]);

  const activeDayItems = itemsByDay[selectedDayMobile] || [];

  return (
    <View style={styles.container}>
      {/* ── 1. CABECERA PRINCIPAL ── */}
      <View style={[styles.headerCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.titleColor }]}>
            Cronograma de Clases y Actividades
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.subColor }]}>
            Horarios lectivos coordinados para el ciclo lectivo en curso.
          </Text>
        </View>

        {/* Botón para alternar modo de vista (Diaria vs 5 Columnas) */}
        <TouchableOpacity
          style={[styles.viewModeToggle, { backgroundColor: theme.pillInactiveBg, borderColor: theme.border }]}
          onPress={() => setViewMode(prev => (prev === 'daily' ? 'weekly' : 'daily'))}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={viewMode === 'daily' ? 'view-week' : 'view-day'}
            size={16}
            color={theme.accent}
          />
          <Text style={[styles.viewModeToggleText, { color: theme.titleColor }]}>
            {viewMode === 'daily' ? 'Vista 5 Días' : 'Vista Diaria'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── 2. SELECTOR DE DÍAS (PILLS HORIZONTALES) ── */}
      <View style={styles.daysSelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScrollContent}
        >
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDayMobile === day;
            const count = (itemsByDay[day] || []).length;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayPill,
                  { backgroundColor: isSelected ? theme.accent : theme.pillInactiveBg },
                  isSelected && styles.dayPillActive,
                ]}
                onPress={() => {
                  setSelectedDayMobile(day);
                  if (viewMode === 'weekly') setViewMode('daily');
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dayPillText,
                    { color: isSelected ? '#FFFFFF' : theme.subColor },
                  ]}
                >
                  {day}
                </Text>
                <View
                  style={[
                    styles.dayCountBadge,
                    { backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(148, 163, 184, 0.15)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayCountText,
                      { color: isSelected ? '#FFFFFF' : theme.subColor },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── 3. VISTA A: LISTA DIARIA (OPTIMIZADA PARA MÓVIL) ── */}
      {viewMode === 'daily' && (
        <View style={[styles.dailySectionCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={[styles.dailySectionHeader, { borderBottomColor: theme.border }]}>
            <View style={styles.dailyHeaderLeft}>
              <MaterialIcons name="event" size={18} color={theme.accent} />
              <Text style={[styles.dailySectionTitle, { color: theme.titleColor }]}>
                Clases para el {selectedDayMobile}
              </Text>
            </View>
            <View style={[styles.bloquesBadge, { backgroundColor: isDarkMode ? 'rgba(234, 88, 12, 0.15)' : 'rgba(234, 88, 12, 0.1)' }]}>
              <Text style={[styles.bloquesBadgeText, { color: theme.accent }]}>
                {activeDayItems.length} {activeDayItems.length === 1 ? 'bloque' : 'bloques'}
              </Text>
            </View>
          </View>

          {activeDayItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={40} color={theme.subColor} style={{ opacity: 0.6 }} />
              <Text style={[styles.emptyTitle, { color: theme.titleColor }]}>
                Sin clases fijadas
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.subColor }]}>
                No tienes asignaciones fijas para el {selectedDayMobile}.
              </Text>
            </View>
          ) : (
            <View style={styles.dailyCardsList}>
              {activeDayItems.map((item) => {
                const isSport = item.type === 'sport';
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.scheduleCard,
                      {
                        backgroundColor: isSport ? theme.sportCardBg : theme.subjectCardBg,
                        borderColor: isSport ? theme.sportCardBorder : theme.subjectCardBorder,
                      },
                    ]}
                  >
                    {/* Fila superior: Rango horario y etiqueta de tipo */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.timeRow}>
                        <MaterialIcons
                          name="access-time"
                          size={14}
                          color={isSport ? theme.sportBadgeText : theme.subjectBadgeText}
                        />
                        <Text style={[styles.timeText, { color: theme.subColor }]}>
                          {item.startTime} - {item.endTime}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor: isSport ? theme.sportBadgeBg : theme.subjectBadgeBg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeBadgeText,
                            {
                              color: isSport ? theme.sportBadgeText : theme.subjectBadgeText,
                            },
                          ]}
                        >
                          {isSport ? 'Taller' : 'Materia'}
                        </Text>
                      </View>
                    </View>

                    {/* Título de la materia / actividad */}
                    <Text style={[styles.itemTitle, { color: theme.titleColor }]}>
                      {item.title}
                    </Text>

                    {/* Subtítulo: Curso o nivel */}
                    <View style={styles.subtitleRow}>
                      <MaterialIcons name="school" size={13} color={theme.subColor} />
                      <Text style={[styles.itemSubtitle, { color: theme.subColor }]}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ── 4. VISTA B: 5 COLUMNAS SEMANALES (RÉPLICA DE ESCRITORIO CON SCROLL HORIZONTAL) ── */}
      {viewMode === 'weekly' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.weeklyScrollContainer}
        >
          {DAYS_OF_WEEK.map((day) => {
            const dayItems = itemsByDay[day] || [];
            return (
              <View
                key={day}
                style={[
                  styles.weeklyColumn,
                  { backgroundColor: theme.cardBg, borderColor: theme.border },
                ]}
              >
                {/* Encabezado de columna del día */}
                <View style={[styles.columnHeader, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.columnDayTitle, { color: theme.titleColor }]}>
                    {day}
                  </Text>
                  <Text style={[styles.columnDayCount, { color: theme.subColor }]}>
                    {dayItems.length} {dayItems.length === 1 ? 'bloque' : 'bloques'}
                  </Text>
                </View>

                {/* Lista de bloques de ese día */}
                <View style={styles.columnBody}>
                  {dayItems.length === 0 ? (
                    <View style={styles.columnEmpty}>
                      <MaterialIcons name="event-busy" size={24} color={theme.subColor} style={{ opacity: 0.5 }} />
                      <Text style={[styles.columnEmptyText, { color: theme.subColor }]}>
                        Sin clases
                      </Text>
                    </View>
                  ) : (
                    dayItems.map((item) => {
                      const isSport = item.type === 'sport';
                      return (
                        <View
                          key={item.id}
                          style={[
                            styles.weeklyCard,
                            {
                              backgroundColor: isSport ? theme.sportCardBg : theme.subjectCardBg,
                              borderColor: isSport ? theme.sportCardBorder : theme.subjectCardBorder,
                            },
                          ]}
                        >
                          <View style={styles.cardHeaderRow}>
                            <Text style={[styles.weeklyTimeText, { color: theme.subColor }]}>
                              {item.startTime} - {item.endTime}
                            </Text>
                            <View
                              style={[
                                styles.typeBadgeSmall,
                                {
                                  backgroundColor: isSport ? theme.sportBadgeBg : theme.subjectBadgeBg,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.typeBadgeTextSmall,
                                  {
                                    color: isSport ? theme.sportBadgeText : theme.subjectBadgeText,
                                  },
                                ]}
                              >
                                {isSport ? 'Taller' : 'Materia'}
                              </Text>
                            </View>
                          </View>

                          <Text
                            style={[styles.weeklyItemTitle, { color: theme.titleColor }]}
                            numberOfLines={2}
                          >
                            {item.title}
                          </Text>

                          <Text
                            style={[styles.weeklyItemSubtitle, { color: theme.subColor }]}
                            numberOfLines={1}
                          >
                            {item.subtitle}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default TeacherScheduleTab;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  headerCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  headerInfo: {
    flex: 1,
    minWidth: 180,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '400',
  },
  viewModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  viewModeToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  daysSelectorContainer: {
    marginBottom: 16,
  },
  daysScrollContent: {
    gap: 8,
  },
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  dayPillActive: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dayCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  dayCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dailySectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dailySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
  },
  dailyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dailySectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  bloquesBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bloquesBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dailyCardsList: {
    gap: 12,
  },
  scheduleCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  weeklyScrollContainer: {
    gap: 12,
    paddingBottom: 8,
  },
  weeklyColumn: {
    width: 210,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  columnHeader: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  columnDayTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  columnDayCount: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  columnBody: {
    padding: 10,
    gap: 10,
    minHeight: 320,
  },
  columnEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  columnEmptyText: {
    fontSize: 11,
    fontWeight: '500',
  },
  weeklyCard: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  weeklyTimeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  typeBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  typeBadgeTextSmall: {
    fontSize: 9,
    fontWeight: '800',
  },
  weeklyItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  weeklyItemSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
});
