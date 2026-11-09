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
      {/* ── IZQUIERDA: MENÚ HAMBURGUESA Y PANEL DOCENTE ── */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={onOpenSidebar}
          style={styles.menuBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="menu" size={24} color={theme.titleColor} />
        </TouchableOpacity>

        <View style={styles.portalBrand}>
          <Text style={[styles.portalTitle, { color: theme.titleColor }]} numberOfLines={1}>
            Panel Docente
          </Text>
          <Text style={[styles.portalSubtitle, { color: theme.subColor }]} numberOfLines={1}>
            Gestión académica y seguimiento de alumnos
          </Text>
        </View>
      </View>

      {/* ── DERECHA: FECHA, TEMA Y AVATAR DOCENTE ── */}
      <View style={styles.rightSection}>
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

        {/* Campana de Notificaciones */}
        <TouchableOpacity style={styles.themeBtn} activeOpacity={0.7}>
          <MaterialIcons name="notifications-none" size={22} color={theme.titleColor} />
        </TouchableOpacity>

        {/* Avatar del Docente */}
        <View style={styles.userProfile}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfoCol}>
            <Text style={[styles.userName, { color: theme.titleColor }]} numberOfLines={1}>
              {teacherName}
            </Text>
            <View style={styles.staffRow}>
              <View style={styles.staffDot} />
              <Text style={styles.staffText}>Staff</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TeacherTopBar;

const styles = StyleSheet.create({
  container: {
    height: 64,
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
    marginRight: 8,
  },
  portalBrand: {
    flexShrink: 1,
    gap: 1,
  },
  portalTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  portalSubtitle: {
    fontSize: 10.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeBtn: {
    padding: 6,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 4,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13.5,
  },
  userInfoCol: {
    gap: 1,
  },
  userName: {
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 100,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  staffText: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '700',
  },
});
