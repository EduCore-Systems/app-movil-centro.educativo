import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type FamilyTab = 'resumen' | 'materias' | 'servicios' | 'chat';

interface FamilyNavTabsProps {
  activeTab: FamilyTab;
  onSelectTab: (tab: FamilyTab) => void;
  isDarkMode?: boolean;
}

export const FamilyNavTabs: React.FC<FamilyNavTabsProps> = ({
  activeTab,
  onSelectTab,
  isDarkMode = false,
}) => {
  const tabs: { key: FamilyTab; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: 'resumen', label: 'Ficha del Estudiante', icon: 'badge' },
    { key: 'materias', label: 'Materias y Docentes', icon: 'menu-book' },
    { key: 'servicios', label: 'Servicios Escolares', icon: 'settings' },
    { key: 'chat', label: 'Consultas con Docentes', icon: 'chat' },
  ];

  const theme = {
    barBg: isDarkMode ? '#1E293B50' : '#F1F5F9',
    barBorder: isDarkMode ? '#334155' : '#E2E8F0',
    inactiveText: isDarkMode ? '#94A3B8' : '#64748B',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.barBg, borderColor: theme.barBorder }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              style={[
                styles.tabPill,
                isActive && styles.tabPillActive,
              ]}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={tab.icon}
                size={18}
                color={isActive ? '#FFFFFF' : theme.inactiveText}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? '#FFFFFF' : theme.inactiveText },
                  isActive && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FamilyNavTabs;

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 6,
    marginBottom: 20,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  tabPillActive: {
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '800',
  },
});
