import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface AcademicCardProps {
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  isDarkMode?: boolean;
}

export const AcademicCard: React.FC<AcademicCardProps> = ({
  title,
  subtitle,
  badges,
  onEdit,
  onDelete,
  isDarkMode = false,
}) => {
  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    btnBg: isDarkMode ? '#334155' : '#F8FAFC',
    btnBorder: isDarkMode ? '#475569' : '#E2E8F0',
    iconEdit: isDarkMode ? '#93C5FD' : '#2563EB',
    iconDelete: '#EF4444',
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <View style={styles.contentCol}>
        <Text style={[styles.title, { color: theme.titleColor }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.subColor }]}>{subtitle}</Text>
        ) : null}
        {badges ? <View style={styles.badgesRow}>{badges}</View> : null}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={onEdit}
          style={[styles.actionBtn, { backgroundColor: theme.btnBg, borderColor: theme.btnBorder }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="edit" size={17} color={theme.iconEdit} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          style={[styles.actionBtn, { backgroundColor: theme.btnBg, borderColor: theme.btnBorder }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="delete" size={17} color={theme.iconDelete} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AcademicCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  contentCol: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
