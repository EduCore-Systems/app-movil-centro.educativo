import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ServicesSubTabs, { ServicesSubTab } from '../../molecules/ServicesSubTabs';
import TransportManager from './services/TransportManager';
import DiningManager from './services/DiningManager';

interface AdminServicesTabProps {
  isDarkMode?: boolean;
}

export const AdminServicesTab: React.FC<AdminServicesTabProps> = ({ isDarkMode = false }) => {
  const [activeSubTab, setActiveSubTab] = useState<ServicesSubTab>('transport');

  const theme = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabecera del Módulo */}
      <View style={styles.moduleHeader}>
        <Text style={[styles.moduleTitle, { color: theme.titleColor }]}>Servicios Institucionales</Text>
        <Text style={[styles.moduleSub, { color: theme.subColor }]}>
          Configuración de rutas de transporte y servicio de comedor.
        </Text>
      </View>

      {/* Selector de Sub-pestañas */}
      <ServicesSubTabs
        activeTab={activeSubTab}
        onSelectTab={setActiveSubTab}
        isDarkMode={isDarkMode}
      />

      {/* Contenido del Administrador Activo */}
      <View style={[styles.cardContainer, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        {activeSubTab === 'transport' && <TransportManager isDarkMode={isDarkMode} />}
        {activeSubTab === 'dining' && <DiningManager isDarkMode={isDarkMode} />}
      </View>
    </ScrollView>
  );
};

export default AdminServicesTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  moduleHeader: {
    alignItems: 'center',
    marginVertical: 14,
    paddingHorizontal: 8,
  },
  moduleTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  moduleSub: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  cardContainer: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
