import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FamilyStudent } from '../../../services/familyService';
import {
  getStudentAttendanceHistory,
  StudentAttendanceSummary,
} from '../../../services/attendanceService';
import AttendanceHistoryModal from '../../molecules/family/AttendanceHistoryModal';

interface StudentProfileTabProps {
  student: FamilyStudent;
  isDarkMode?: boolean;
}

export const StudentProfileTab: React.FC<StudentProfileTabProps> = ({
  student,
  isDarkMode = false,
}) => {
  const [attendance, setAttendance] = useState<StudentAttendanceSummary>({
    percentage: 75,
    statusLabel: 'Regular',
    presents: 15,
    totalClasses: 20,
    history: [],
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (!student) return;
    const fetchAtt = async () => {
      const summary = await getStudentAttendanceHistory(student.id, student.dni);
      setAttendance(summary);
    };
    fetchAtt();
  }, [student]);

  const initials = (student.nombre || 'AL')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const nivelCap = student.nivel
    ? student.nivel.charAt(0).toUpperCase() + student.nivel.slice(1).toLowerCase()
    : 'Secundaria';

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    statCardBg: isDarkMode ? '#0F172A50' : '#F8FAFC',
    statCardBorder: isDarkMode ? '#33415550' : '#F1F5F9',
  };

  return (
    <View style={styles.container}>
      {/* ── CARD PRINCIPAL: DATOS DEL ESTUDIANTE + KPIS ── */}
      <View style={[styles.mainCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        {/* Cabecera con Avatar Grande y Datos */}
        <View style={styles.headerRow}>
          <View style={styles.avatarBig}>
            <Text style={styles.avatarBigText}>{initials}</Text>
            <View style={styles.activeDot} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.studentTitle, { color: theme.titleColor }]} numberOfLines={1}>
                {student.nombre}
              </Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>ACTIVO</Text>
              </View>
            </View>

            {/* Nivel y Curso con bonete de graduación */}
            <View style={styles.levelRow}>
              <MaterialIcons name="school" size={16} color="#EA580C" style={{ marginRight: 4 }} />
              <Text style={[styles.levelText, { color: theme.titleColor }]}>
                {nivelCap} · <Text style={{ fontWeight: '800' }}>{student.curso || 'Sin curso'}</Text>
              </Text>
            </View>

            {/* Metadatos (Legajo, DNI, Ciclo) */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MaterialIcons name="badge" size={13} color={theme.subColor} style={{ marginRight: 3 }} />
                <Text style={[styles.metaText, { color: theme.subColor }]}>
                  Legajo: <Text style={{ fontWeight: '700', color: theme.titleColor }}>{student.studentID_login || `EST-2026-${student.id?.slice(0, 3)}`}</Text>
                </Text>
              </View>

              <View style={styles.metaItem}>
                <MaterialIcons name="fingerprint" size={13} color={theme.subColor} style={{ marginRight: 3 }} />
                <Text style={[styles.metaText, { color: theme.subColor }]}>
                  DNI: <Text style={{ fontWeight: '700', color: theme.titleColor }}>{student.dni || '-'}</Text>
                </Text>
              </View>

              <View style={styles.metaItem}>
                <MaterialIcons name="verified" size={13} color={theme.subColor} style={{ marginRight: 3 }} />
                <Text style={[styles.metaText, { color: theme.subColor }]}>
                  Ciclo: <Text style={{ fontWeight: '700', color: theme.titleColor }}>2026</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 3 TARJETAS DE KPIS: ASISTENCIA, PROMEDIO, CONDUCTA ── */}
        <View style={styles.kpiRow}>
          {/* KPI 1: Asistencia (Interactiva -> abre historial) */}
          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: theme.statCardBg, borderColor: theme.statCardBorder }]}
            onPress={() => setIsHistoryOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.kpiHeaderRow}>
              <Text style={[styles.kpiLabel, { color: theme.subColor }]} maxFontSizeMultiplier={1.1} numberOfLines={1}>
                ASISTENCIA
              </Text>
              <MaterialIcons name="visibility" size={13} color="#EA580C" />
            </View>
            <View style={styles.kpiValueRow}>
              <Text
                style={[styles.kpiNumber, { color: theme.titleColor }]}
                maxFontSizeMultiplier={1.15}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {attendance.percentage}%
              </Text>
              <Text
                style={[styles.kpiSub, { color: attendance.percentage >= 75 ? '#D97706' : '#DC2626' }]}
                maxFontSizeMultiplier={1.1}
                numberOfLines={1}
              >
                {attendance.statusLabel}
              </Text>
            </View>
          </TouchableOpacity>

          {/* KPI 2: Promedio */}
          <View style={[styles.kpiCard, { backgroundColor: theme.statCardBg, borderColor: theme.statCardBorder }]}>
            <Text style={[styles.kpiLabel, { color: theme.subColor }]} maxFontSizeMultiplier={1.1} numberOfLines={1}>
              PROMEDIO
            </Text>
            <View style={styles.kpiValueRow}>
              <Text
                style={[styles.kpiNumber, { color: '#EA580C' }]}
                maxFontSizeMultiplier={1.15}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                8.8
              </Text>
              <Text style={[styles.kpiSub, { color: theme.subColor }]} maxFontSizeMultiplier={1.1} numberOfLines={1}>
                /10
              </Text>
            </View>
          </View>

          {/* KPI 3: Conducta */}
          <View style={[styles.kpiCard, { backgroundColor: theme.statCardBg, borderColor: theme.statCardBorder }]}>
            <Text style={[styles.kpiLabel, { color: theme.subColor }]} maxFontSizeMultiplier={1.1} numberOfLines={1}>
              CONDUCTA
            </Text>
            <View style={styles.kpiValueRow}>
              <Text
                style={[styles.kpiTextVal, { color: theme.titleColor }]}
                maxFontSizeMultiplier={1.15}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                Excelente
              </Text>
              <MaterialIcons name="verified" size={14} color="#10B981" style={{ marginLeft: 2 }} />
            </View>
          </View>
        </View>
      </View>

      {/* Modal Historial de Asistencia */}
      <AttendanceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        studentName={student.nombre}
        percentage={attendance.percentage}
        totalClasses={attendance.totalClasses}
        history={attendance.history}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

export default StudentProfileTab;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  mainCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarBig: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 16,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarBigText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  activeDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  studentTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  statusPill: {
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EA580C40',
  },
  statusPillText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#33415530',
    paddingTop: 14,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  kpiValueRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  kpiNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  kpiSub: {
    fontSize: 10,
    fontWeight: '700',
  },
  kpiTextVal: {
    fontSize: 12,
    fontWeight: '800',
  },
});
