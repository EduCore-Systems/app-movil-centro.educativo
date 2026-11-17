import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface TeacherSportItem {
  id: string;
  name: string;
  description?: string;
  schedule?: string;
  schedules?: { dayOfWeek: string; startTime: string; endTime: string }[];
  teacherName?: string;
  teacherEmail?: string;
}

interface TeacherSportsTabProps {
  sports?: TeacherSportItem[];
  isDarkMode?: boolean;
}

export const TeacherSportsTab: React.FC<TeacherSportsTabProps> = ({
  sports = [],
  isDarkMode = true,
}) => {
  const theme = {
    bg: isDarkMode ? '#0A0F1D' : '#F8FAFC',
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    accent: '#EA580C',
    emerald: '#10B981',
    emeraldBg: isDarkMode ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
    emeraldBorder: isDarkMode ? 'rgba(16, 185, 129, 0.35)' : '#A7F3D0',
    emeraldText: isDarkMode ? '#34D399' : '#059669',
    innerBoxBg: isDarkMode ? '#1E293B' : '#F8FAFC',
  };

  return (
    <View style={styles.container}>
      {/* ── 1. CABECERA INSTITUCIONAL ── */}
      <View style={[styles.headerCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.titleColor }]}>
            Deportes y Talleres Extracurriculares
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.subColor }]}>
            Espacios formativos, entrenamientos y talleres a tu cargo.
          </Text>
        </View>

        {/* Insignia de conteo verde */}
        <View style={[styles.activeCountBadge, { backgroundColor: theme.emeraldBg, borderColor: theme.emeraldBorder }]}>
          <Text style={[styles.activeCountText, { color: theme.emeraldText }]}>
            {sports.length} {sports.length === 1 ? 'actividad activa' : 'actividades activas'}
          </Text>
        </View>
      </View>

      {/* ── 2. ESTADO VACÍO (RÉPLICA EXACTA DE LA CAPTURA WEB) ── */}
      {sports.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={[styles.emptyIconBox, { backgroundColor: theme.emeraldBg }]}>
            <MaterialIcons name="sports-soccer" size={28} color={theme.emerald} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.titleColor }]}>
            Sin talleres o deportes asignados
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.subColor }]}>
            Actualmente tu perfil no registra actividades deportivas o talleres extracurriculares a cargo.
          </Text>
        </View>
      ) : (
        /* ── 3. LISTA DE ACTIVIDADES Y TALLERES (CUANDO HAY ASIGNACIONES) ── */
        <View style={styles.sportsList}>
          {sports.map((sp) => (
            <View
              key={sp.id}
              style={[
                styles.sportCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              {/* Encabezado de la tarjeta */}
              <View style={styles.cardHeaderRow}>
                <View style={[styles.tagPill, { backgroundColor: theme.emeraldBg }]}>
                  <Text style={[styles.tagPillText, { color: theme.emeraldText }]}>
                    Taller Institucional
                  </Text>
                </View>
                <MaterialIcons name="verified" size={20} color={theme.emerald} />
              </View>

              {/* Nombre de la actividad */}
              <Text style={[styles.sportTitle, { color: theme.titleColor }]}>
                {sp.name}
              </Text>

              {/* Descripción */}
              <Text style={[styles.sportDescription, { color: theme.subColor }]}>
                {sp.description ||
                  'Actividad formativa y deportiva orientada al desarrollo integral de los estudiantes.'}
              </Text>

              {/* Caja de detalles de horario y ubicación */}
              <View
                style={[
                  styles.detailsBox,
                  { backgroundColor: theme.innerBoxBg, borderColor: theme.border },
                ]}
              >
                <View style={styles.detailRow}>
                  <MaterialIcons name="schedule" size={16} color={theme.emerald} />
                  <Text style={[styles.detailText, { color: theme.titleColor }]}>
                    {sp.schedules && sp.schedules.length > 0
                      ? sp.schedules
                          .map((s) => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`)
                          .join(' · ')
                      : sp.schedule || 'Horario a coordinar'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialIcons name="stadium" size={16} color={theme.subColor} />
                  <Text style={[styles.detailText, { color: theme.subColor }]}>
                    Instalaciones del Campus Escolar
                  </Text>
                </View>
              </View>

              {/* Pie de tarjeta: Ciclo lectivo y Estado */}
              <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                <Text style={[styles.cicloText, { color: theme.subColor }]}>
                  Ciclo Lectivo 2026
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: theme.emeraldBg, borderColor: theme.emeraldBorder },
                  ]}
                >
                  <Text style={[styles.statusPillText, { color: theme.emeraldText }]}>
                    En Dictado
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default TeacherSportsTab;

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
  activeCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
  },
  sportsList: {
    gap: 14,
  },
  sportCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sportTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sportDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  detailsBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  cicloText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
