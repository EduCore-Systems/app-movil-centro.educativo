import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type TeacherTab = 'cursos' | 'asistencia' | 'mensajes' | 'horario' | 'talleres';

interface TeacherNavTabsProps {
  activeTab: TeacherTab;
  onSelectTab: (tab: TeacherTab) => void;
  isDarkMode?: boolean;
}

export const TeacherNavTabs: React.FC<TeacherNavTabsProps> = ({
  activeTab,
  onSelectTab,
  isDarkMode = true,
}) => {
  const tabs: { key: TeacherTab; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: 'cursos', label: 'Mis Cursos y Materias', icon: 'menu-book' },
    { key: 'asistencia', label: 'Tomar Asistencia', icon: 'how-to-reg' },
    { key: 'mensajes', label: 'Mensajes con Familias', icon: 'chat' },
    { key: 'horario', label: 'Cronograma Semanal', icon: 'calendar-today' },
    { key: 'talleres', label: 'Deportes y Talleres', icon: 'sports-soccer' },
  ];

  const theme = {
    containerBg: isDarkMode ? '#0F172A' : '#F1F5F9',
    borderColor: isDarkMode ? '#1E293B' : '#E2E8F0',
    inactiveText: isDarkMode ? '#94A3B8' : '#64748B',
    activeText: '#FFFFFF',
    activeBg: '#EA580C',
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.containerBg, borderColor: theme.borderColor }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                isActive && { backgroundColor: theme.activeBg },
              ]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={tab.icon}
                size={16}
                color={isActive ? theme.activeText : theme.inactiveText}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? theme.activeText : theme.inactiveText },
                  isActive && styles.tabLabelActive,
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

export default TeacherNavTabs;

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 6,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});
