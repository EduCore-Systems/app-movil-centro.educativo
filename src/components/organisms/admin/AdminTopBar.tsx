import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Badge from '../../atoms/Badge';
import ThemeToggle from '../../atoms/ThemeToggle';

interface AdminTopBarProps {
  isDarkMode: boolean;
  onOpenSidebar: () => void;
  onToggleTheme: () => void;
  adminInitial?: string;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  isDarkMode,
  onOpenSidebar,
  onToggleTheme,
  adminInitial = 'A',
}) => {
  const theme = {
    topBarBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    topBarBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
  };

  return (
    <View style={[styles.topBar, { backgroundColor: theme.topBarBg, borderBottomColor: theme.topBarBorder }]}>
      <View style={styles.topBarLeft}>
        <TouchableOpacity onPress={onOpenSidebar} style={styles.menuButton}>
          <Ionicons name="menu" size={26} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.logoShield}>
          <MaterialIcons name="admin-panel-settings" size={22} color="#EA580C" />
        </View>
        <Text style={[styles.topBarTitle, { color: theme.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
          Control Administrativo
        </Text>
      </View>

      <View style={styles.topBarRight}>
        <Badge type="admin-level" isDarkMode={isDarkMode} />
        <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{adminInitial}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  menuButton: {
    padding: 6,
    marginRight: 6,
  },
  logoShield: {
    marginRight: 8,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});

export default AdminTopBar;
