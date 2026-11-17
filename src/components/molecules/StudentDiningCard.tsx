import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StudentService } from '../../services/additionalServices';
import Badge from '../atoms/Badge';

interface StudentDiningCardProps {
  student: StudentService;
  onToggleDining: (studentId: string, currentStatus: boolean) => void;
  onConfirm: (studentId: string) => void;
  isDarkMode?: boolean;
}

export const StudentDiningCard: React.FC<StudentDiningCardProps> = ({
  student,
  onToggleDining,
  onConfirm,
  isDarkMode = false,
}) => {
  const isEnabled = !!student.diningRoomEnabled;
  const isPending = isEnabled && student.comedor_estado === 'pendiente_confirmacion';

  const theme = {
    cardBg: isEnabled
      ? isDarkMode
        ? '#064E3B15'
        : '#ECFDF550'
      : isDarkMode
      ? '#1E293B'
      : '#FFFFFF',
    border: isEnabled
      ? isDarkMode
        ? '#05966940'
        : '#A7F3D0'
      : isDarkMode
      ? '#334155'
      : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      {/* Top Row: Name and Level */}
      <View style={styles.topRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.studentName, { color: theme.titleColor }]} numberOfLines={1}>
            {student.nombre}
          </Text>
        </View>
        <Badge type="nivel" value={student.nivel} isDarkMode={isDarkMode} />
      </View>

      {/* Bottom Row: Status Badge & Switch */}
      <View style={styles.bottomRow}>
        <View style={styles.statusCol}>
          {isEnabled ? (
            isPending ? (
              <View style={styles.pendingRow}>
                <View style={styles.pendingBadge}>
                  <View style={styles.amberDot} />
                  <Text style={styles.pendingText}>Pendiente</Text>
                </View>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => onConfirm(student.id)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="check" size={14} color="#FFFFFF" />
                  <Text style={styles.confirmBtnText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.confirmedBadge}>
                <MaterialIcons name="restaurant" size={14} color="#059669" style={{ marginRight: 4 }} />
                <Text style={styles.confirmedText}>Confirmado</Text>
              </View>
            )
          ) : (
            <View style={styles.inactiveBadge}>
              <MaterialIcons name="block" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
              <Text style={styles.inactiveText}>Inactivo</Text>
            </View>
          )}
        </View>

        {/* Native Switch Toggle */}
        <Switch
          value={isEnabled}
          onValueChange={() => onToggleDining(student.id, isEnabled)}
          trackColor={{ false: isDarkMode ? '#334155' : '#CBD5E1', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
};

export default StudentDiningCard;

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusCol: {
    flex: 1,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  amberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
    marginRight: 5,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignSelf: 'flex-start',
  },
  confirmedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  inactiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  inactiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
});
