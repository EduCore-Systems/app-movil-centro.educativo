import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TeacherTopBarProps {
  isDarkMode?: boolean;
  onOpenSidebar: () => void;
  onToggleTheme: () => void;
  teacherName?: string;
}

export const TeacherTopBar: React.FC<TeacherTopBarProps> = ({
  isDarkMode = true,
  onOpenSidebar,
  onToggleTheme,
  teacherName = 'Prof. Federico Fontana',
}) => {
  const theme = {
    bg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    datePillBg: isDarkMode ? '#1E293B' : '#F1F5F9',
  };

  const getInitials = (name: string) => {
    const parts = name.replace(/^Prof\.?\s+/i, '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(teacherName);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
      {/* ── IZQUIERDA: MENÚ HAMBURGUESA Y TÍTULO PANEL DOCENTE ── */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={onOpenSidebar}
          style={styles.menuBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="menu" size={24} color={theme.titleColor} />
        </TouchableOpacity>

        <Text
          style={[styles.portalTitle, { color: theme.titleColor }]}
          numberOfLines={1}
          maxFontSizeMultiplier={1.15}
        >
          Panel Docente
        </Text>
      </View>

      {/* ── DERECHA: FECHA CORTA, SELECTOR DE TEMA Y AVATAR CON INICIALES ── */}
      <View style={styles.rightSection}>
        {/* Píldora de Fecha Corta (no invasiva) */}
        <View style={[styles.datePill, { backgroundColor: theme.datePillBg }]}>
          <MaterialIcons name="calendar-today" size={11} color="#EA580C" style={{ marginRight: 4 }} />
          <Text
            style={[styles.datePillText, { color: theme.subColor }]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.15}
          >
            9 nov 2026
          </Text>
        </View>

        {/* Selector de Modo Claro / Oscuro */}
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

        {/* Avatar Circular con Iniciales (sin nombre ni perfil para no sobrecargar) */}
        <TouchableOpacity
          onPress={onOpenSidebar}
          activeOpacity={0.8}
          style={styles.avatarCircle}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TeacherTopBar;

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
    marginRight: 6,
  },
  menuBtn: {
    padding: 6,
    marginRight: 8,
  },
  portalTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  datePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  themeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
