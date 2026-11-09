import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Badge from '../atoms/Badge';
import ActionButton from '../atoms/ActionButton';

export interface Staff {
  id: string;
  nombre: string;
  dni?: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
  telefono?: string;
  [key: string]: any;
}

interface StaffCardProps {
  item: Staff;
  isDarkMode?: boolean;
}

export const StaffCard: React.FC<StaffCardProps> = ({ item, isDarkMode = false }) => {
  const theme = {
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    cardBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    divider: isDarkMode ? '#1E293B' : '#F1F5F9',
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{item.nombre}</Text>
          <Text style={[styles.subInfo, { color: theme.textSecondary }]}>
            DNI: {item.dni}
          </Text>
        </View>
        <Badge type="rol" value={item.role} isDarkMode={isDarkMode} />
      </View>

      <Text style={[styles.email, { color: theme.textSecondary }]}>{item.email}</Text>

      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      <View style={styles.bottomRow}>
        <Badge
          type="clave"
          value={item.mustChangePassword ? 'Temporal (DNI)' : 'Clave Segura'}
          isDarkMode={isDarkMode}
        />

        <View style={styles.actionsRow}>
          <ActionButton
            type="lock-reset"
            isDarkMode={isDarkMode}
            onPress={() => {
              Alert.alert(
                'Restablecer Clave',
                `La clave de ${item.nombre} se restablecerá temporalmente a su número de DNI (${item.dni}).`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Confirmar', onPress: () => Alert.alert('Completado', 'Clave restablecida al DNI exitosamente.') },
                ]
              );
            }}
          />
          <ActionButton
            type="edit"
            isDarkMode={isDarkMode}
            onPress={() => {
              Alert.alert('Editar Personal', `Edición de datos para ${item.nombre} (${item.email}).`);
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  subInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  email: {
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default StaffCard;
