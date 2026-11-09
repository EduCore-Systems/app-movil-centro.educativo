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
  isDarkMode = true,
}) => {
  const initial = (tutorName || 'F').charAt(0).toUpperCase();

  const theme = {
    modalBg: isDarkMode ? '#0B1120' : '#FFFFFF',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    divider: isDarkMode ? '#1E293B' : '#E2E8F0',
    sectionHeader: isDarkMode ? '#64748B' : '#94A3B8',
    activePillBg: isDarkMode ? 'rgba(234, 88, 12, 0.16)' : '#FFEDD5',
  };

  const navMenuItems: {
    id: string;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    action: () => void;
    isActive: boolean;
  }[] = [
    {
      id: 'resumen',
      label: 'Resumen Familiar',
      icon: 'grid-view',
      action: () => {
        onSelectTab('resumen');
        onClose();
      },
      isActive: activeTab === 'resumen',
    },
    {
      id: 'materias',
      label: 'Materias y Horarios',
      icon: 'menu-book',
      action: () => {
        onSelectTab('materias');
        onClose();
      },
      isActive: activeTab === 'materias',
    },
    {
      id: 'servicios',
      label: 'Servicios Escolares',
      icon: 'sports-soccer',
      action: () => {
        onSelectTab('servicios');
        onClose();
      },
      isActive: activeTab === 'servicios',
    },
    {
      id: 'documentacion',
      label: 'Documentación Oficial',
      icon: 'description',
      action: () => {
        onClose();
        onOpenDocument?.('boletin');
      },
      isActive: false,
    },
    {
      id: 'chat',
      label: 'Mensajes y Consultas',
      icon: 'chat',
      action: () => {
        onSelectTab('chat');
        onClose();
      },
      isActive: activeTab === 'chat',
    },
  ];

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.sidebarContent, { backgroundColor: theme.modalBg }]}>
          {/* ── 1. CABECERA DEL SIDEBAR ── */}
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarBrandRow}>
              <View style={styles.sidebarBrandIcon}>
                <MaterialIcons name="school" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.sidebarBrandTitle, { color: theme.textPrimary }]}>EduCore</Text>
                <Text style={styles.sidebarBrandSub}>PORTAL DE FAMILIAS</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtn}
            >
              <MaterialIcons name="chevron-left" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* ── 2. PERFIL DE LA FAMILIA ── */}
          <View style={[styles.sidebarProfileBox, { borderBottomColor: theme.divider }]}>
            <View style={styles.sidebarAvatar}>
              <Text style={styles.sidebarAvatarText}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sidebarTutorName, { color: theme.textPrimary }]} numberOfLines={1}>
                {tutorName}
              </Text>
              <Text style={styles.sidebarRoleText}>
                {childrenCount} {childrenCount === 1 ? 'estudiante a cargo' : 'estudiantes a cargo'}
              </Text>
            </View>
          </View>

          {/* ── 3. SECCIÓN GESTIÓN FAMILIAR ── */}
          <Text style={[styles.sidebarSectionTitle, { color: theme.sectionHeader }]}>
            GESTIÓN FAMILIAR
          </Text>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {navMenuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.sidebarMenuItem,
                  item.isActive && [styles.sidebarMenuItemActive, { backgroundColor: theme.activePillBg }],
                ]}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={item.icon}
                  size={20}
                  color={item.isActive ? '#EA580C' : theme.textSecondary}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    styles.sidebarMenuText,
                    item.isActive
                      ? styles.sidebarMenuTextActive
                      : { color: theme.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
                {item.isActive && <View style={styles.orangeDotRight} />}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── 4. PIE INFERIOR DEL SIDEBAR ── */}
          <View style={[styles.sidebarFooter, { borderTopColor: theme.divider }]}>
            <TouchableOpacity
              style={styles.sidebarFooterItem}
              onPress={() => {
                onClose();
                Linking.openURL('https://educore-systems-web.vercel.app').catch(() =>
                  Alert.alert('Error', 'No se pudo abrir el sitio institucional.')
                );
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="home" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <Text style={[styles.sidebarMenuText, { color: theme.textSecondary }]}>Sitio Institucional</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarFooterItem}
              onPress={() => {
                onClose();
                onLogout();
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="logout" size={20} color="#EF4444" style={{ marginRight: 12 }} />
              <Text style={styles.sidebarLogoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>

            <Text style={styles.sidebarVersionText}>EduCore v2.4 · Ciclo 2026</Text>
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
  closeBtn: {
    padding: 4,
  },
  sidebarProfileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  sidebarAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  sidebarTutorName: {
    fontSize: 15,
    fontWeight: '800',
  },
  sidebarRoleText: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  sidebarSectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 4,
  },
  sidebarMenuItemActive: {
    borderRadius: 14,
  },
  sidebarMenuText: {
    fontSize: 13.5,
    fontWeight: '600',
    flex: 1,
  },
  sidebarMenuTextActive: {
    fontSize: 13.5,
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
    paddingTop: 14,
    marginTop: 8,
  },
  sidebarFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    marginBottom: 2,
  },
  sidebarLogoutText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '700',
  },
  sidebarVersionText: {
    color: '#475569',
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '600',
  },
});
