import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StudentProfileData } from '../../../services/studentService';

interface StudentProfileTabProps {
  student: StudentProfileData;
  isDarkMode?: boolean;
  onOpenAttendanceModal?: () => void;
}

export const StudentProfileTab: React.FC<StudentProfileTabProps> = ({
  student,
  isDarkMode = true,
  onOpenAttendanceModal,
}) => {
  const theme = {
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    pillCardBg: isDarkMode ? '#1E293B' : '#F8FAFC',
  };

  return (
    <View style={styles.container}>
      {/* ── TARJETA PRINCIPAL DEL ALUMNO (MR - MATEO ROSSI) ── */}
      <View style={[styles.studentCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.cardHeaderRow}>
          {/* Avatar MR con punto verde */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>MR</Text>
            </View>
            <View style={styles.avatarStatusGreen} />
          </View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.studentNameText, { color: theme.titleColor }]} numberOfLines={1}>
                {student.nombre}
              </Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVO</Text>
              </View>
            </View>

            <View style={styles.levelRow}>
              <MaterialIcons name="school" size={16} color="#EA580C" style={{ marginRight: 4 }} />
              <Text style={[styles.levelText, { color: theme.subColor }]}>
                {student.nivel} · <Text style={{ fontWeight: '800', color: theme.titleColor }}>{student.curso}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Metadatos (Legajo, DNI, Ciclo Lectivo) */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialIcons name="badge" size={14} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.metaLabelText}>Legajo: </Text>
            <Text style={[styles.metaValueText, { color: theme.titleColor }]}>
              {student.studentID_login}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <MaterialIcons name="fingerprint" size={14} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.metaLabelText}>DNI: </Text>
            <Text style={[styles.metaValueText, { color: theme.titleColor }]}>
              {student.dni}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <MaterialIcons name="verified" size={14} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={styles.metaLabelText}>Ciclo Lectivo: </Text>
            <Text style={[styles.metaValueText, { color: theme.titleColor }]}>2026</Text>
          </View>
        </View>

        {/* ── MÉTRICAS: ASISTENCIA, PROMEDIO Y CONDUCTA (3 PÍLDORAS) ── */}
        <View style={styles.metricsRow}>
          {/* Asistencia */}
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: theme.pillCardBg }]}
            onPress={onOpenAttendanceModal}
            activeOpacity={0.7}
          >
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>ASISTENCIA</Text>
              <MaterialIcons name="visibility" size={14} color="#64748B" />
            </View>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricMainNumber, { color: theme.titleColor }]}>96%</Text>
              <Text style={styles.metricStatusGreen}>Óptima</Text>
            </View>
          </TouchableOpacity>

          {/* Promedio */}
          <View style={[styles.metricCard, { backgroundColor: theme.pillCardBg }]}>
            <Text style={styles.metricTitle}>PROMEDIO</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricAverageOrange}>8.8</Text>
              <Text style={styles.metricSubTotal}> /10</Text>
            </View>
          </View>

          {/* Conducta */}
          <View style={[styles.metricCard, { backgroundColor: theme.pillCardBg }]}>
            <Text style={styles.metricTitle}>CONDUCTA</Text>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricConductText, { color: theme.titleColor }]}>Excelente</Text>
              <MaterialIcons name="check-circle" size={16} color="#10B981" style={{ marginLeft: 4 }} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default StudentProfileTab;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  studentCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarBox: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 22,
  },
  avatarStatusGreen: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  studentNameText: {
    fontSize: 20,
    fontWeight: '900',
  },
  activeBadge: {
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '800',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  levelText: {
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#334155',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabelText: {
    fontSize: 11,
    color: '#64748B',
  },
  metaValueText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricMainNumber: {
    fontSize: 18,
    fontWeight: '900',
    marginRight: 4,
  },
  metricStatusGreen: {
    color: '#10B981',
    fontSize: 11.5,
    fontWeight: '700',
  },
  metricAverageOrange: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EA580C',
  },
  metricSubTotal: {
    fontSize: 11,
    color: '#64748B',
  },
  metricConductText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
