import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FamilyStudent } from '../../../services/familyService';

interface FamilyStudentCardProps {
  student: FamilyStudent;
  isSelected: boolean;
  onSelect: () => void;
  isDarkMode?: boolean;
}

export const FamilyStudentCard: React.FC<FamilyStudentCardProps> = ({
  student,
  isSelected,
  onSelect,
  isDarkMode = false,
}) => {
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
    avatarInactiveBg: isDarkMode ? '#0F172A' : '#F1F5F9',
    avatarInactiveText: isDarkMode ? '#CBD5E1' : '#475569',
  };

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: isSelected ? '#EA580C' : theme.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      activeOpacity={0.85}
    >
      {/* Avatar del Alumno con iniciales */}
      <View
        style={[
          styles.avatarBox,
          {
            backgroundColor: isSelected ? '#EA580C' : theme.avatarInactiveBg,
          },
        ]}
      >
        <Text
          style={[
            styles.avatarText,
            { color: isSelected ? '#FFFFFF' : theme.avatarInactiveText },
          ]}
        >
          {initials}
        </Text>
        {isSelected && <View style={styles.activeDot} />}
      </View>

      {/* Datos del Alumno */}
      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.studentName, { color: theme.titleColor }]}
            numberOfLines={1}
          >
            {student.nombre}
          </Text>
          {isSelected && (
            <View style={styles.selectedPill}>
              <Text style={styles.selectedPillText}>SELECCIONADO</Text>
            </View>
          )}
        </View>

        <Text style={[styles.courseText, { color: theme.subColor }]} numberOfLines={1}>
          {nivelCap} · {student.curso || 'Sin curso'}
        </Text>
      </View>

      {/* Icono de Selección / Flecha */}
      <View style={styles.rightAction}>
        {isSelected ? (
          <MaterialIcons name="check-circle" size={24} color="#EA580C" />
        ) : (
          <MaterialIcons name="chevron-right" size={24} color={theme.subColor} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default FamilyStudentCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    minWidth: 260,
    maxWidth: 320,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  infoCol: {
    flex: 1,
    marginRight: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
  },
  selectedPill: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  selectedPillText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  courseText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  rightAction: {
    marginLeft: 2,
  },
});
