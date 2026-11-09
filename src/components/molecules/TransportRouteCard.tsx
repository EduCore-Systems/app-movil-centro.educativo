import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TransportRoute } from '../../services/additionalServices';

interface TransportRouteCardProps {
  route: TransportRoute;
  passengerCount: number;
  onEdit: () => void;
  onDelete: () => void;
  isDarkMode?: boolean;
}

export const TransportRouteCard: React.FC<TransportRouteCardProps> = ({
  route,
  passengerCount,
  onEdit,
  onDelete,
  isDarkMode = false,
}) => {
  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    btnBg: isDarkMode ? '#334155' : '#F8FAFC',
    btnBorder: isDarkMode ? '#475569' : '#E2E8F0',
    iconColor: isDarkMode ? '#94A3B8' : '#64748B',
    badgeBg: isDarkMode ? '#1E3A8A' : '#EFF6FF',
    badgeText: isDarkMode ? '#93C5FD' : '#2563EB',
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <View style={styles.contentCol}>
        <View style={styles.titleRow}>
          <MaterialIcons name="directions-bus" size={20} color={theme.iconColor} style={{ marginRight: 8 }} />
          <Text style={[styles.title, { color: theme.titleColor }]} numberOfLines={1}>
            {route.name}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.costText}>${route.cost}</Text>
          <View style={[styles.passengerBadge, { backgroundColor: theme.badgeBg }]}>
            <Text style={[styles.passengerText, { color: theme.badgeText }]}>
              {passengerCount} {passengerCount === 1 ? 'alumno' : 'alumnos'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={onEdit}
          style={[styles.actionBtn, { backgroundColor: theme.btnBg, borderColor: theme.btnBorder }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="edit" size={17} color={isDarkMode ? '#93C5FD' : '#2563EB'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          style={[styles.actionBtn, { backgroundColor: theme.btnBg, borderColor: theme.btnBorder }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="delete" size={17} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TransportRouteCard;

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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  costText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  passengerBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  passengerText: {
    fontSize: 11,
    fontWeight: '700',
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
