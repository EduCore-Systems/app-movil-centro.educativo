import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../atoms/Badge';
import { Student } from './StudentCard';

interface SolicitudCardProps {
  item: Student;
  isDarkMode?: boolean;
  onAprobar: (item: Student) => void;
  onRechazar: (item: Student) => void;
}

export const SolicitudCard: React.FC<SolicitudCardProps> = ({
  item,
  isDarkMode = false,
  onAprobar,
  onRechazar,
}) => {
  const theme = {
    cardBg: isDarkMode ? '#1E1B18' : '#FFFBEB',
    borderColor: isDarkMode ? '#78350F' : '#FDE68A',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    divider: isDarkMode ? '#78350F' : '#FEF3C7',
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
      <View style={styles.badgeRow}>
        <Text style={styles.tag}>SOLICITUD DE MATRÍCULA</Text>
        <Badge type="nivel" value={item.nivel} isDarkMode={isDarkMode} />
      </View>

      <Text style={[styles.name, { color: theme.textPrimary }]}>{item.nombre}</Text>
      <Text style={[styles.subInfo, { color: theme.textSecondary }]}>
        DNI: {item.dni} • Fecha Nac.: {item.fechaNacimiento || 'S/D'}
      </Text>

      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      <View style={styles.tutorBox}>
        <Text style={[styles.tutorTitle, { color: theme.textPrimary }]}>Tutor Responsable:</Text>
        <Text style={[styles.tutorName, { color: theme.textPrimary }]}>{item.tutorNombre}</Text>
        <Text style={[styles.tutorText, { color: theme.textSecondary }]}>{item.emailPadre}</Text>
        <Text style={[styles.tutorText, { color: theme.textSecondary }]}>
          DNI: {item.tutorDni} • Tel: {item.telefonoTutor || 'S/D'}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.aprobarBtn}
          onPress={() => onAprobar(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.aprobarBtnText}>Aprobar Solicitud</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rechazarBtn}
          onPress={() => onRechazar(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle-outline" size={18} color="#EF4444" style={{ marginRight: 4 }} />
          <Text style={styles.rechazarBtnText}>Rechazar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  subInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  tutorBox: {
    marginBottom: 10,
  },
  tutorTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  tutorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  tutorText: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  aprobarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 12,
  },
  aprobarBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  rechazarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  rechazarBtnText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default SolicitudCard;
