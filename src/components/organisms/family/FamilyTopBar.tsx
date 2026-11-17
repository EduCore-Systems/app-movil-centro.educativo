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
    divider: isDarkMode ? '#334155' : '#CBD5E1',
  };

  return (
    <View style={[styles.topBar, { backgroundColor: theme.topBarBg, borderBottomColor: theme.topBarBorder }]}>
      {/* Izquierda: Menú Hamburguesa + Título Portal Familiar */}
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onOpenSidebar} style={styles.menuButton} activeOpacity={0.7}>
          <Ionicons name="menu" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.brandBox}>
          <MaterialIcons name="family-restroom" size={20} color="#EA580C" style={{ marginRight: 6 }} />
          <Text
            style={[styles.brandText, { color: theme.textPrimary }]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.15}
          >
            Portal Familiar
          </Text>
        </View>
      </View>

      {/* Derecha: ThemeToggle + Divisor + Avatar del Tutor con indicador activo */}
      <View style={styles.rightSection}>
        {/* Alternador de Tema */}
        <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />

        {/* Divisor vertical sutil */}
        <View style={[styles.dividerVertical, { backgroundColor: theme.divider }]} />

        {/* Avatar del Tutor con punto verde activo + Nombre */}
        <TouchableOpacity onPress={onOpenSidebar} style={styles.tutorContainer} activeOpacity={0.8}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText} maxFontSizeMultiplier={1.1}>
              {initial}
            </Text>
            {/* Punto indicador de sesión activa */}
            <View style={styles.activeDot} />
          </View>
          <Text
            style={[styles.tutorNameText, { color: theme.subText }]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.15}
          >
            {tutorName}
          </Text>
        </TouchableOpacity>
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
    flexShrink: 0,
  },
  menuButton: {
    padding: 4,
    marginRight: 6,
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  dividerVertical: {
    width: 1,
    height: 18,
    marginHorizontal: 2,
  },
  tutorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  activeDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  tutorNameText: {
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 90,
  },
});
