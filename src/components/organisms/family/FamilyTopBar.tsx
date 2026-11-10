import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ThemeToggle from '../../atoms/ThemeToggle';

interface FamilyTopBarProps {
  isDarkMode: boolean;
  onOpenSidebar: () => void;
  onToggleTheme: () => void;
  tutorName?: string;
}

export const FamilyTopBar: React.FC<FamilyTopBarProps> = ({
  isDarkMode,
  onOpenSidebar,
  onToggleTheme,
  tutorName = 'Familia Díaz',
}) => {
  const initial = (tutorName || 'F').charAt(0).toUpperCase();

  const theme = {
    topBarBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    topBarBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    subText: isDarkMode ? '#94A3B8' : '#64748B',
    badgeBg: isDarkMode ? '#064E3B40' : '#ECFDF5',
    badgeBorder: isDarkMode ? '#05966950' : '#A7F3D0',
    badgeText: isDarkMode ? '#6EE7B7' : '#047857',
    divider: isDarkMode ? '#334155' : '#CBD5E1',
  };

  return (
    <View style={[styles.topBar, { backgroundColor: theme.topBarBg, borderBottomColor: theme.topBarBorder }]}>
      {/* Izquierda: Menú Hamburguesa + Título Portal Familiar */}
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onOpenSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.brandBox}>
          <MaterialIcons name="family-restroom" size={20} color="#EA580C" style={{ marginRight: 5 }} />
          <Text style={[styles.brandText, { color: theme.textPrimary }]} numberOfLines={1}>
            Portal Familiar
          </Text>
        </View>
      </View>

      {/* Derecha: Badge Ciclo 26 Activo + ThemeToggle + Divider + Avatar + Nombre */}
      <View style={styles.rightSection}>
        {/* Pastilla Ciclo Activo abreviada a "Ciclo 26 Activo" para evitar superposición */}
        <View style={[styles.cycleBadge, { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder }]}>
          <View style={styles.pulseDot} />
          <Text style={[styles.cycleText, { color: theme.badgeText }]}>Ciclo 26 Activo</Text>
        </View>

        {/* Alternador de Tema */}
        <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />

        {/* Divisor vertical sutil */}
        <View style={[styles.dividerVertical, { backgroundColor: theme.divider }]} />

        {/* Avatar del Tutor + Nombre */}
        <View style={styles.tutorContainer}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={[styles.tutorNameText, { color: theme.subText }]} numberOfLines={1}>
            {tutorName}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default FamilyTopBar;

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 4,
  },
  menuButton: {
    padding: 4,
    marginRight: 4,
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 15,
    fontWeight: '800',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  cycleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 20,
    borderWidth: 1,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  cycleText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  dividerVertical: {
    width: 1,
    height: 18,
    marginHorizontal: 1,
  },
  tutorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  avatarBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  tutorNameText: {
    fontSize: 11.5,
    fontWeight: '700',
    maxWidth: 85,
  },
});
