import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Linking, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FamilyTab } from '../../molecules/family/FamilyNavTabs';

interface FamilySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: FamilyTab;
  onSelectTab: (tab: FamilyTab) => void;
  onLogout: () => void;
  tutorName?: string;
  childrenCount?: number;
  onOpenDocument?: (type: 'boletin' | 'certificado') => void;
  onSwitchToAdmin?: () => void;
  isDarkMode?: boolean;
}

export const FamilySidebar: React.FC<FamilySidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onLogout,
  tutorName = 'Familia Díaz',
  childrenCount = 2,
  onOpenDocument,
  onSwitchToAdmin,
  isDarkMode = false,
}) => {
  const initial = (tutorName || 'F').charAt(0).toUpperCase();

  const theme = {
    modalBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    divider: isDarkMode ? '#1E293B' : '#F1F5F9',
  };

  const navItems: { key: FamilyTab; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: 'resumen', label: 'Ficha del Estudiante', icon: 'badge' },
    { key: 'materias', label: 'Materias y Docentes', icon: 'menu-book' },
    { key: 'servicios', label: 'Servicios Escolares', icon: 'settings' },
    { key: 'chat', label: 'Consultas con Docentes', icon: 'chat' },
  ];

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sidebarContent, { backgroundColor: theme.modalBg }]}>
          {/* Header del Sidebar */}
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarBrandRow}>
              <View style={styles.sidebarBrandIcon}>
                <MaterialIcons name="family-restroom" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.sidebarBrandTitle, { color: theme.textPrimary }]}>EduCore</Text>
                <Text style={styles.sidebarBrandSub}>PORTAL FAMILIAR</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <MaterialIcons name="chevron-left" size={26} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Perfil del Tutor */}
          <View style={styles.sidebarProfileBox}>
            <View style={styles.sidebarAvatar}>
              <Text style={styles.sidebarAvatarText}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sidebarTutorName, { color: theme.textPrimary }]} numberOfLines={1}>
                {tutorName}
              </Text>
              <Text style={styles.sidebarRoleText}>
                {childrenCount} {childrenCount === 1 ? 'alumno vinculado' : 'alumnos vinculados'}
              </Text>
            </View>
          </View>

          {/* Menú de Navegación */}
          <Text style={styles.sidebarSectionTitle}>SECCIONES FAMILIARES</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={isActive ? styles.sidebarMenuItemActive : styles.sidebarMenuItem}
                  onPress={() => {
                    onSelectTab(item.key);
                    onClose();
                  }}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={isActive ? '#EA580C' : theme.textSecondary}
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={
                      isActive
                        ? styles.sidebarMenuTextActive
                        : [styles.sidebarMenuText, { color: theme.textSecondary }]
                    }
                  >
                    {item.label}
                  </Text>
                  {isActive && <View style={styles.orangeDotRight} />}
                </TouchableOpacity>
              );
            })}

            {/* Documentación Oficial Rápida */}
            <Text style={[styles.sidebarSectionTitle, { marginTop: 16 }]}>DOCUMENTACIÓN</Text>
            <TouchableOpacity
              style={styles.sidebarMenuItem}
              onPress={() => {
                onClose();
                onOpenDocument?.('boletin');
              }}
            >
              <MaterialIcons name="download" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <Text style={[styles.sidebarMenuText, { color: theme.textSecondary }]}>Boletín de Calificaciones</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarMenuItem}
              onPress={() => {
                onClose();
                onOpenDocument?.('certificado');
              }}
            >
              <MaterialIcons name="verified" size={20} color="#EA580C" style={{ marginRight: 12 }} />
              <Text style={[styles.sidebarMenuText, { color: '#EA580C', fontWeight: '700' }]}>Certificado Alumno Regular</Text>
            </TouchableOpacity>

            {/* Alternar a Panel Administrador si corresponde */}
            {onSwitchToAdmin && (
              <>
                <Text style={[styles.sidebarSectionTitle, { marginTop: 16 }]}>MODO DE CONTROL</Text>
                <TouchableOpacity
                  style={styles.sidebarMenuItem}
                  onPress={() => {
                    onClose();
                    onSwitchToAdmin();
                  }}
                >
                  <MaterialIcons name="admin-panel-settings" size={20} color="#EA580C" style={{ marginRight: 12 }} />
                  <Text style={[styles.sidebarMenuText, { color: '#EA580C', fontWeight: '700' }]}>
                    Ir a Panel Administrador
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          {/* Footer del Sidebar */}
          <View style={[styles.sidebarFooter, { borderTopColor: theme.divider }]}>
            <TouchableOpacity
              style={styles.sidebarMenuItem}
              onPress={() => {
                onClose();
                Linking.openURL('https://educore-systems-web.vercel.app').catch(() =>
                  Alert.alert('Error', 'No se pudo abrir el sitio institucional.')
                );
              }}
            >
              <MaterialIcons name="home" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <Text style={[styles.sidebarMenuText, { color: theme.textSecondary }]}>Sitio Institucional</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarMenuItem}
              onPress={() => {
                onClose();
                onLogout();
              }}
            >
              <MaterialIcons name="logout" size={20} color="#EF4444" style={{ marginRight: 12 }} />
              <Text style={styles.sidebarLogoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>

            <Text style={styles.sidebarVersionText}>EduCore Familias v2.4</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FamilySidebar;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
  },
  modalBackdrop: {
    flex: 1,
  },
  sidebarContent: {
    width: 280,
    height: '100%',
    padding: 20,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarBrandTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sidebarBrandSub: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.8,
  },
  sidebarProfileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 16,
    gap: 12,
  },
  sidebarAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  sidebarTutorName: {
    fontSize: 15,
    fontWeight: '800',
  },
  sidebarRoleText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  sidebarSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  sidebarMenuItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
  },
  sidebarMenuText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  sidebarMenuTextActive: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
    flex: 1,
  },
  orangeDotRight: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  sidebarLogoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  sidebarVersionText: {
    color: '#64748B',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
});
