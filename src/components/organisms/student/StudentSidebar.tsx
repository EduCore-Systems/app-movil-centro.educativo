import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StudentTab } from '../../molecules/student/StudentNavTabs';
import { StudentProfileData } from '../../../services/studentService';

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: StudentTab;
  onSelectTab: (tab: StudentTab) => void;
  onLogout: () => void;
  student: StudentProfileData;
  onOpenDocument?: (type: 'boletin' | 'certificado') => void;
  onToggleTheme: () => void;
  isDarkMode?: boolean;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onLogout,
  student,
  onOpenDocument,
  onToggleTheme,
  isDarkMode = true,
}) => {
  const theme = {
    modalBg: isDarkMode ? '#0B1120' : '#FFFFFF',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    divider: isDarkMode ? '#1E293B' : '#E2E8F0',
    sectionHeader: isDarkMode ? '#64748B' : '#94A3B8',
    activePillBg: '#EA580C',
  };

  const navMenuItems: {
    id: StudentTab;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  }[] = [
    { id: 'ficha', label: 'Mi Ficha Académica', icon: 'badge' },
    { id: 'materias', label: 'Mis Asignaturas', icon: 'menu-book' },
    { id: 'horario', label: 'Horario Semanal', icon: 'calendar-today' },
    { id: 'servicios', label: 'Servicios y Talleres', icon: 'sports-soccer' },
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
                <Text style={styles.sidebarBrandSub}>PORTAL DEL ALUMNO</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <MaterialIcons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* ── 2. TARJETA DE PERFIL DEL ALUMNO ── */}
          <View style={[styles.studentCardBox, { borderBottomColor: theme.divider }]}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>MR</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.studentName, { color: theme.textPrimary }]} numberOfLines={1}>
                {student.nombre}
              </Text>
              <Text style={styles.studentCourseText}>
                {student.curso} · {student.nivel}
              </Text>
              <View style={styles.legajoPill}>
                <Text style={styles.legajoPillText}>Legajo: {student.studentID_login || 'EST-2026-401'}</Text>
              </View>
            </View>
          </View>

          {/* ── 3. MENÚ DE NAVEGACIÓN PRINCIPAL ── */}
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

            {/* ── 4. SECCIÓN MIS CONSTANCIAS ── */}
            <Text style={[styles.sectionTitle, { color: theme.sectionHeader }]}>MIS CONSTANCIAS</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenDocument?.('boletin');
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="description" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <Text style={[styles.menuText, { color: theme.textSecondary }]}>Boletín Oficial</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenDocument?.('certificado');
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="verified" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <Text style={[styles.menuText, { color: theme.textSecondary }]}>Certificado Regular</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* ── 5. PIE INFERIOR: TEMA Y CERRAR SESIÓN ── */}
          <View style={[styles.sidebarFooter, { borderTopColor: theme.divider }]}>
            <TouchableOpacity
              style={styles.footerItem}
              onPress={onToggleTheme}
              activeOpacity={0.7}
            >
              <Text style={[styles.footerText, { color: theme.textPrimary }]}>Tema</Text>
              <MaterialIcons
                name={isDarkMode ? 'light-mode' : 'dark-mode'}
                size={20}
                color="#F59E0B"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerItem}
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

export default StudentSidebar;

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
  studentCardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  studentName: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  studentCourseText: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  legajoPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  legajoPillText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '700',
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
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 6,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  footerText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
  },
});
