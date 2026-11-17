import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export type ServicesSubTab = 'transport' | 'dining';

interface ServicesSubTabsProps {
  activeTab: ServicesSubTab;
  onSelectTab: (tab: ServicesSubTab) => void;
  isDarkMode?: boolean;
}

export const ServicesSubTabs: React.FC<ServicesSubTabsProps> = ({
  activeTab,
  onSelectTab,
  isDarkMode = false,
}) => {
  const tabs: { key: ServicesSubTab; label: string }[] = [
    { key: 'transport', label: 'Transporte' },
    { key: 'dining', label: 'Comedor' },
  ];

  const theme = {
    containerBg: isDarkMode ? '#1E293B' : '#F1F5F9',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    activeBg: isDarkMode ? '#334155' : '#FFFFFF',
    activeText: isDarkMode ? '#FFFFFF' : '#0F172A',
    inactiveText: isDarkMode ? '#94A3B8' : '#64748B',
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: theme.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.capsule, { backgroundColor: theme.containerBg, borderColor: theme.border }]}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => onSelectTab(tab.key)}
                style={[styles.tabButton, isActive && [styles.tabButtonActive, { backgroundColor: theme.activeBg }]]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? theme.activeText : theme.inactiveText },
                    isActive && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default ServicesSubTabs;

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  capsule: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'center',
  },
  tabButton: {
    paddingHorizontal: 28,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabTextActive: {
    fontWeight: '800',
  },
});
