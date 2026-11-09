import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface StudentTopBarProps {
  isDarkMode?: boolean;
  onOpenSidebar: () => void;
  onToggleTheme: () => void;
  studentName?: string;
}

export const StudentTopBar: React.FC<StudentTopBarProps> = ({
  isDarkMode = true,
  onOpenSidebar,
  onToggleTheme,
  studentName = 'Mateo Rossi',
}) => {
  const initial = (studentName || 'M').charAt(0).toUpperCase();

  const theme = {
    bg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    badgeBg: isDarkMode ? '#1E293B' : '#E2E8F0',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
      {/* ── IZQUIERDA: MENÚ HAMBURGUESA Y TÍTULO PORTAL ── */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={onOpenSidebar}
          style={styles.menuBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="menu" size={24} color={theme.titleColor} />
        </TouchableOpacity>

        <View style={styles.portalBrand}>
          <MaterialIcons name="school" size={20} color="#EA580C" style={{ marginRight: 6 }} />
          <Text style={[styles.portalTitle, { color: theme.titleColor }]} numberOfLines={1}>
            Portal del Alumno
          </Text>
          <View style={[styles.readOnlyBadge, { backgroundColor: theme.badgeBg }]}>
            <Text style={[styles.readOnlyText, { color: theme.subColor }]}>Solo Lectura</Text>
          </View>
        </View>
      </View>

      {/* ── DERECHA: CICLO LECTIVO, TEMA Y AVATAR ── */}
      <View style={styles.rightSection}>
        {/* Píldora Ciclo Activo */}
        <View style={styles.cycleBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.cycleText}>Ciclo 2026 Activo</Text>
        </View>

        {/* Toggle de Modo Claro / Oscuro */}
        <TouchableOpacity
          onPress={onToggleTheme}
          style={styles.themeBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isDarkMode ? 'light-mode' : 'dark-mode'}
            size={20}
            color={theme.titleColor}
          />
        </TouchableOpacity>

        {/* Avatar del Alumno */}
        <View style={styles.userProfile}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={[styles.userName, { color: theme.titleColor }]} numberOfLines={1}>
            {studentName}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default StudentTopBar;

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  menuBtn: {
    padding: 6,
    marginRight: 6,
  },
  portalBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  portalTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    marginRight: 6,
  },
  readOnlyBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  readOnlyText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cycleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  cycleText: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: '700',
  },
  themeBtn: {
    padding: 6,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  userName: {
    fontSize: 12.5,
    fontWeight: '700',
    maxWidth: 90,
  },
});
