import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export type WeekDay = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

export interface ScheduleActivity {
  id: string;
  time: string;
  title: string;
  detail: string;
  type: 'Materia' | 'Taller';
}

export const WEEKLY_SCHEDULE: Record<WeekDay, ScheduleActivity[]> = {
  Lunes: [
    {
      id: 'lun-1',
      time: '08:00 - 09:30',
      title: 'Matemática I',
      detail: 'Prof. Alejandro Varela · Aula 1° Año A',
      type: 'Materia',
    },
    {
      id: 'lun-2',
      time: '09:45 - 11:15',
      title: 'Historia',
      detail: 'Prof. Carmen Delgado · Aula 1° Año A',
      type: 'Materia',
    },
    {
      id: 'lun-3',
      time: '17:00 - 18:30',
      title: 'Fútbol Intercolegial',
      detail: 'Cancha Principal · Cancha Principal',
      type: 'Taller',
    },
  ],
  Martes: [
    {
      id: 'mar-1',
      time: '08:00 - 09:30',
      title: 'Lengua y Literatura',
      detail: 'Prof. Carmen Delgado · Aula 1° Año A',
      type: 'Materia',
    },
    {
      id: 'mar-2',
      time: '09:45 - 11:15',
      title: 'Inglés Técnico',
      detail: 'Prof. Andrea Varela · Aula 1° Año A',
      type: 'Materia',
    },
    {
      id: 'mar-3',
      time: '16:30 - 18:00',
      title: 'Taller de Ajedrez',
      detail: 'Biblioteca Escolar · Sede Central',
      type: 'Taller',
    },
  ],
  Miércoles: [
    {
      id: 'mie-1',
      time: '08:00 - 09:30',
      title: 'Matemática I',
      detail: 'Prof. Alejandro Varela · Aula 1° Año A',
      type: 'Materia',
    },
    {
      id: 'mie-2',
      time: '09:45 - 11:15',
      title: 'Química General',
      detail: 'Prof. Alejandro Varela · Aula 1° Año A',
      type: 'Materia',
    },
    {
      id: 'mie-3',
      time: '17:00 - 18:30',
      title: 'Fútbol Intercolegial',
      detail: 'Cancha Principal · Cancha Principal',
      type: 'Taller',
    },
  ],
  Jueves: [
    {
      id: 'jue-1',
      time: '08:00 - 09:30',
      title: 'Lengua y Literatura',
      detail: 'Prof. Carmen Delgado · Aula 1° Año A',
      type: 'Materia',
    },
    {
      id: 'jue-2',
      time: '09:45 - 11:15',
      title: 'Historia',
      detail: 'Prof. Carmen Delgado · Aula 1° Año A',
      type: 'Materia',
    },
    {
      id: 'jue-3',
      time: '16:30 - 18:00',
      title: 'Taller de Ajedrez',
      detail: 'Biblioteca Escolar · Sede Central',
      type: 'Taller',
    },
  ],
  Viernes: [
    {
      id: 'vie-1',
      time: '08:00 - 09:30',
      title: 'Química General',
      detail: 'Prof. Alejandro Varela · Aula 1° Año A',
      type: 'Materia',
    },
    {
      id: 'vie-2',
      time: '09:45 - 11:15',
      title: 'Inglés Técnico',
      detail: 'Prof. Andrea Varela · Aula 1° Año A',
      type: 'Materia',
    },
  ],
};

interface StudentScheduleTabProps {
  isDarkMode?: boolean;
}

export const StudentScheduleTab: React.FC<StudentScheduleTabProps> = ({
  isDarkMode = true,
}) => {
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Lunes');

  const days: WeekDay[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const activities = WEEKLY_SCHEDULE[selectedDay] || [];

  const theme = {
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    pillInactiveBg: isDarkMode ? '#1E293B' : '#E2E8F0',
    pillInactiveText: isDarkMode ? '#94A3B8' : '#64748B',
    pillActiveBg: '#EA580C',
    pillActiveText: '#FFFFFF',
    materiaBorder: isDarkMode ? '#39261E' : '#FED7AA',
    tallerBorder: isDarkMode ? '#17362B' : '#A7F3D0',
  };

  return (
    <View style={styles.container}>
      {/* ── 1. TARJETA CABECERA CRONOGRAMA CON SELECTOR DE DÍAS ── */}
      <View style={[styles.cronogramaHeaderCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.cronogramaHeaderTexts}>
          <Text style={[styles.cronogramaTitle, { color: theme.titleColor }]}>
            Cronograma Semanal de Clases
          </Text>
          <Text style={[styles.cronogramaSubtitle, { color: theme.subColor }]}>
            Horarios lectivos coordinados para el ciclo lectivo en curso · Turno Mañana y Talleres.
          </Text>
        </View>

        {/* Selector de días horizontal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScroll}
        >
          {days.map((day) => {
            const isActive = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayPill,
                  {
                    backgroundColor: isActive ? theme.pillActiveBg : theme.pillInactiveBg,
                  },
                ]}
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dayPillText,
                    {
                      color: isActive ? theme.pillActiveText : theme.pillInactiveText,
                      fontWeight: isActive ? '800' : '600',
                    },
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── 2. SECCIÓN ACTIVIDADES DEL DÍA SELECCIONADO ── */}
      <View style={styles.activitiesSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.activitiesTitle, { color: theme.titleColor }]}>
            Actividades para el {selectedDay}
          </Text>
          <Text style={[styles.activitiesCount, { color: theme.subColor }]}>
            {activities.length} actividades
          </Text>
        </View>

        {/* Tarjetas de actividades */}
        <View style={styles.activityCardsList}>
          {activities.map((act) => {
            const isMateria = act.type === 'Materia';
            const cardBorder = isMateria ? theme.materiaBorder : theme.tallerBorder;

            return (
              <View
                key={act.id}
                style={[
                  styles.activityCard,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: cardBorder,
                  },
                ]}
              >
                <View style={styles.activityCardContent}>
                  <Text style={styles.activityTime}>{act.time}</Text>
                  <Text style={[styles.activityTitle, { color: theme.titleColor }]}>
                    {act.title}
                  </Text>
                  <Text style={[styles.activityDetail, { color: theme.subColor }]}>
                    {act.detail}
                  </Text>
                </View>

                {/* Badge Materia o Taller */}
                <View
                  style={[
                    styles.typeBadge,
                    isMateria ? styles.typeBadgeMateria : styles.typeBadgeTaller,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      isMateria ? styles.typeTextMateria : styles.typeTextTaller,
                    ]}
                  >
                    {act.type}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default StudentScheduleTab;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  cronogramaHeaderCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  cronogramaHeaderTexts: {
    gap: 4,
  },
  cronogramaTitle: {
    fontSize: 18.5,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  cronogramaSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  daysScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  dayPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  dayPillText: {
    fontSize: 13,
  },
  activitiesSection: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  activitiesTitle: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  activitiesCount: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  activityCardsList: {
    gap: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  activityCardContent: {
    flex: 1,
    gap: 3,
    marginRight: 12,
  },
  activityTime: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  activityDetail: {
    fontSize: 12,
    marginTop: 1,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  typeBadgeMateria: {
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
  },
  typeBadgeTaller: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  typeBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  typeTextMateria: {
    color: '#EA580C',
  },
  typeTextTaller: {
    color: '#10B981',
  },
});
