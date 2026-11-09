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
          <Ionicons name="menu" size={26} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.brandBox}>
          <MaterialIcons name="family-restroom" size={22} color="#EA580C" style={{ marginRight: 6 }} />
          <Text style={[styles.brandText, { color: theme.textPrimary }]} numberOfLines={1}>
            Portal Familiar
          </Text>
        </View>
      </View>

      {/* Derecha: Badge Ciclo 2026 + ThemeToggle + Divider + Avatar + Nombre */}
      <View style={styles.rightSection}>
        {/* Pastilla Ciclo Activo */}
        <View style={[styles.cycleBadge, { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder }]}>
          <View style={styles.pulseDot} />
          <Text style={[styles.cycleText, { color: theme.badgeText }]}>Ciclo 2026 Activo</Text>
        </View>

        {/* Alternador de Tema */}
        <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />

        {/* Divisor vertical */}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  menuButton: {
    padding: 6,
    marginRight: 4,
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 16,
    fontWeight: '800',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cycleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  cycleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  dividerVertical: {
    width: 1,
    height: 20,
    marginHorizontal: 2,
  },
  tutorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  tutorNameText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
