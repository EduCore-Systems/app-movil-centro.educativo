import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentModule: 'dashboard' | 'create';
  onSelectModule: (module: 'dashboard' | 'create') => void;
  onLogout: () => void;
  adminName?: string;
  adminInitial?: string;
  isDarkMode?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  currentModule,
  onSelectModule,
  onLogout,
  adminName = 'Administrador',
  adminInitial = 'A',
  isDarkMode = false,
}) => {
  const theme = {
    modalBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    divider: isDarkMode ? '#1E293B' : '#F1F5F9',
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sidebarContent, { backgroundColor: theme.modalBg }]}>
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarBrandRow}>
              <View style={styles.sidebarBrandIcon}>
                <MaterialIcons name="admin-panel-settings" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.sidebarBrandTitle, { color: theme.textPrimary }]}>EduCore</Text>
                <Text style={styles.sidebarBrandSub}>CONTROL CENTRAL</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <MaterialIcons name="chevron-left" size={26} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.sidebarProfileBox}>
            <View style={styles.sidebarAvatar}>
              <Text style={styles.sidebarAvatarText}>{adminInitial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sidebarAdminName, { color: theme.textPrimary }]}>{adminName}</Text>
              <View style={styles.sidebarRoleRow}>
                <View style={styles.greenDot} />
                <Text style={styles.sidebarRoleText}>Administrador General</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sidebarSectionTitle}>MÓDULOS DEL SISTEMA</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={currentModule === 'dashboard' ? styles.sidebarMenuItemActive : styles.sidebarMenuItem}
              onPress={() => {
                onSelectModule('dashboard');
                onClose();
              }}
            >
              <MaterialIcons
                name="grid-view"
                size={20}
                color={currentModule === 'dashboard' ? '#EA580C' : theme.textSecondary}
                style={{ marginRight: 12 }}
              />
              <Text style={currentModule === 'dashboard' ? styles.sidebarMenuTextActive : [styles.sidebarMenuText, { color: theme.textSecondary }]}>
                Dashboard de Usuarios
              </Text>
              {currentModule === 'dashboard' && <View style={styles.orangeDotRight} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={currentModule === 'create' ? styles.sidebarMenuItemActive : styles.sidebarMenuItem}
              onPress={() => {
                onSelectModule('create');
                onClose();
              }}
            >
              <MaterialIcons
                name="person-add"
                size={20}
                color={currentModule === 'create' ? '#EA580C' : theme.textSecondary}
                style={{ marginRight: 12 }}
              />
              <Text style={currentModule === 'create' ? styles.sidebarMenuTextActive : [styles.sidebarMenuText, { color: theme.textSecondary }]}>
                Crear Usuarios
              </Text>
              {currentModule === 'create' && <View style={styles.orangeDotRight} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarMenuItem} onPress={onClose}>
              <MaterialIcons name="school" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <Text style={[styles.sidebarMenuText, { color: theme.textSecondary }]}>Gestión Académica</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarMenuItem} onPress={onClose}>
              <MaterialIcons name="directions-bus" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <Text style={[styles.sidebarMenuText, { color: theme.textSecondary }]}>Servicios Escolares</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarMenuItem} onPress={onClose}>
              <MaterialIcons name="bar-chart" size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <Text style={[styles.sidebarMenuText, { color: theme.textSecondary }]}>Centro de Reportes</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={[styles.sidebarFooter, { borderTopColor: theme.divider }]}>
            <TouchableOpacity style={styles.sidebarMenuItem} onPress={onClose}>
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

            <Text style={styles.sidebarVersionText}>EduCore Admin v2.4</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarAvatarText: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 18,
  },
  sidebarAdminName: {
    fontSize: 15,
    fontWeight: '700',
  },
  sidebarRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  sidebarRoleText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
  sidebarSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sidebarMenuItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
  },
  sidebarMenuText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sidebarMenuTextActive: {
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  sidebarVersionText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default AdminSidebar;
