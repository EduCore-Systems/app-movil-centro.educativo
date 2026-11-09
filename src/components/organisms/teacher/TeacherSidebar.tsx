import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TeacherTab } from '../../molecules/teacher/TeacherNavTabs';
import { TeacherProfileData } from '../../../services/teacherService';

interface TeacherSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TeacherTab;
  onSelectTab: (tab: TeacherTab) => void;
  onLogout: () => void;
  teacher: TeacherProfileData;
  isDarkMode?: boolean;
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onLogout,
  teacher,
  isDarkMode = true,
}) => {
  const theme = {
    modalBg: isDarkMode ? '#0B1120' : '#FFFFFF',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    divider: isDarkMode ? '#1E293B' : '#E2E8F0',
    sectionHeader: isDarkMode ? '#64748B' : '#94A3B8',
    activePillBg: '#EA580C',
    cardBoxBg: isDarkMode ? '#0F172A' : '#F8FAFC',
  };

  const getInitials = (name: string) => {
    const parts = name.replace(/^Prof\.?\s+/i, '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(teacher.nombre);

  const navMenuItems: {
    id: TeacherTab;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  }[] = [
    { id: 'cursos', label: 'Mis Cursos y Materias', icon: 'menu-book' },
    { id: 'asistencia', label: 'Tomar Asistencia', icon: 'how-to-reg' },
    { id: 'mensajes', label: 'Mensajes con Familias', icon: 'chat' },
    { id: 'horario', label: 'Mi Cronograma Semanal', icon: 'calendar-today' },
    { id: 'talleres', label: 'Deportes y Talleres', icon: 'sports-soccer' },
  ];

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.sidebarContent, { backgroundColor: theme.modalBg }]}>
          {/* ── 1. CABECERA CON LOGO Y CIERRE ── */}
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarBrandRow}>
              <View style={styles.sidebarBrandIcon}>
                <MaterialIcons name="school" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.sidebarBrandTitle, { color: theme.textPrimary }]}>EduCore</Text>
                <Text style={styles.sidebarBrandSub}>PORTAL STAFF</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <MaterialIcons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* ── 2. TARJETA DE PERFIL DOCENTE ── */}
          <View style={[styles.teacherCardBox, { backgroundColor: theme.cardBoxBg, borderColor: theme.divider }]}>
            <View style={styles.teacherAvatar}>
              <Text style={styles.teacherAvatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.teacherName, { color: theme.textPrimary }]} numberOfLines={1}>
                {teacher.nombre}
              </Text>
              <Text style={[styles.teacherTitleText, { color: theme.textSecondary }]} numberOfLines={1}>
                {teacher.titulo || 'Docente'}
              </Text>
            </View>
          </View>

          {/* ── 3. MENÚ PRINCIPAL DOCENTE ── */}
          <Text style={[styles.sectionTitle, { color: theme.sectionHeader }]}>MENÚ PRINCIPAL</Text>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {navMenuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    isActive && [styles.menuItemActive, { backgroundColor: theme.activePillBg }],
                  ]}
                  onPress={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={isActive ? '#FFFFFF' : theme.textSecondary}
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={[
                      styles.menuText,
                      { color: isActive ? '#FFFFFF' : theme.textSecondary },
                      isActive && styles.menuTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── 4. PIE INFERIOR: CICLO LECTIVO Y CERRAR SESIÓN ── */}
          <View style={[styles.sidebarFooter, { borderTopColor: theme.divider }]}>
            <View style={styles.cycleRow}>
              <MaterialIcons name="event" size={18} color="#10B981" style={{ marginRight: 8 }} />
              <Text style={[styles.cycleText, { color: theme.textSecondary }]}>Ciclo Lectivo 2026</Text>
              <View style={styles.activeDot} />
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                onClose();
                onLogout();
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="logout" size={20} color="#EF4444" style={{ marginRight: 10 }} />
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TeacherSidebar;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
  },
  modalBackdrop: {
    flex: 1,
  },
  sidebarContent: {
    width: 290,
    height: '100%',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  sidebarBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sidebarBrandIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarBrandTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  sidebarBrandSub: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.8,
  },
  teacherCardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  teacherAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '800',
  },
  teacherTitleText: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 4,
  },
  menuItemActive: {
    borderRadius: 14,
  },
  menuText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  menuTextActive: {
    fontWeight: '800',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    paddingTop: 14,
    gap: 10,
  },
  cycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cycleText: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
