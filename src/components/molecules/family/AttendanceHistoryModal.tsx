import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AttendanceRecord } from '../../../services/attendanceService';

interface AttendanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  percentage: number;
  totalClasses: number;
  history: AttendanceRecord[];
  isDarkMode?: boolean;
}

export const AttendanceHistoryModal: React.FC<AttendanceHistoryModalProps> = ({
  isOpen,
  onClose,
  studentName,
  percentage,
  totalClasses,
  history,
  isDarkMode = false,
}) => {
  const theme = {
    modalBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    statCardBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    itemBorder: isDarkMode ? '#33415550' : '#F1F5F9',
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'presente':
        return { label: 'Presente', bg: 'rgba(16, 185, 129, 0.12)', text: '#059669', icon: 'check-circle' as const };
      case 'tarde':
        return { label: 'Tarde', bg: 'rgba(234, 88, 12, 0.12)', text: '#EA580C', icon: 'schedule' as const };
      case 'ausente_justificado':
        return { label: 'Justificado', bg: 'rgba(59, 130, 246, 0.12)', text: '#2563EB', icon: 'info' as const };
      default:
        return { label: 'Injustificado', bg: 'rgba(239, 68, 68, 0.12)', text: '#DC2626', icon: 'cancel' as const };
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalBox, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
              {/* Header con degradado / fondo naranja */}
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerCategory}>HISTORIAL DE ASISTENCIAS</Text>
                  <Text style={styles.headerTitle}>{studentName}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <MaterialIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Estadísticas Resumen */}
              <View style={styles.statsRow}>
                <View style={[styles.statItem, { backgroundColor: theme.statCardBg, borderColor: theme.border }]}>
                  <Text style={[styles.statLabel, { color: theme.subColor }]}>PRESENTISMO GENERAL</Text>
                  <Text style={[styles.statValue, { color: theme.titleColor }]}>{percentage}%</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: theme.statCardBg, borderColor: theme.border }]}>
                  <Text style={[styles.statLabel, { color: theme.subColor }]}>CLASES REGISTRADAS</Text>
                  <Text style={[styles.statValue, { color: theme.titleColor }]}>{totalClasses}</Text>
                </View>
              </View>

              {/* Lista Cronológica */}
              <Text style={[styles.listTitle, { color: theme.subColor }]}>REGISTROS DIARIOS</Text>
              <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                {history.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={[styles.emptyText, { color: theme.subColor }]}>
                      Sin asistencias registradas aún en el ciclo.
                    </Text>
                  </View>
                ) : (
                  history.map((item, idx) => {
                    const badge = getStatusBadge(item.status);
                    return (
                      <View
                        key={idx}
                        style={[styles.historyItem, { borderBottomColor: theme.itemBorder }]}
                      >
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={[styles.subjectName, { color: theme.titleColor }]}>
                            {item.subjectName}
                          </Text>
                          <Text style={[styles.dateText, { color: theme.subColor }]}>
                            {item.date} · {item.courseName}
                          </Text>
                          {Boolean(item.note) && (
                            <Text style={styles.noteText}>Nota: {item.note}</Text>
                          )}
                        </View>

                        <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                          <MaterialIcons name={badge.icon} size={14} color={badge.text} style={{ marginRight: 4 }} />
                          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AttendanceHistoryModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    backgroundColor: '#EA580C',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCategory: {
    color: '#FFEDD5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 10,
  },
  statItem: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  listTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
  },
  historyList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  noteText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#EA580C',
    marginTop: 2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
