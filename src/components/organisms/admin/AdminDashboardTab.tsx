import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StudentCard, { Student } from '../../molecules/StudentCard';
import StaffCard, { Staff } from '../../molecules/StaffCard';
import SolicitudCard from '../../molecules/SolicitudCard';
import EmptyState from '../../molecules/EmptyState';
import PillSelector, { PillOption } from '../../molecules/PillSelector';

interface AdminDashboardTabProps {
  isDarkMode: boolean;
  students: Student[];
  staffList: Staff[];
  solicitudesList: Student[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onAprobarSolicitud: (solicitud: Student) => void;
  onRechazarSolicitud: (solicitud: Student) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  isDarkMode,
  students,
  staffList,
  solicitudesList,
  loading,
  refreshing,
  onRefresh,
  onAprobarSolicitud,
  onRechazarSolicitud,
}) => {
  const [activeTab, setActiveTab] = useState<'estudiantes' | 'personal' | 'solicitudes'>('estudiantes');
  const [selectedLevel, setSelectedLevel] = useState('todos');
  const [search, setSearch] = useState('');
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

  const theme = {
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    cardBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    inputBg: isDarkMode ? '#111C35' : '#F1F5F9',
    inputBorder: isDarkMode ? '#1E293B' : '#CBD5E1',
    modalBg: isDarkMode ? '#0F172A' : '#FFFFFF',
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !search ||
        (s.nombre && s.nombre.toLowerCase().includes(search.toLowerCase())) ||
        (s.dni && s.dni.includes(search)) ||
        (s.emailPadre && s.emailPadre.toLowerCase().includes(search.toLowerCase())) ||
        (s.studentID_login && s.studentID_login.toLowerCase().includes(search.toLowerCase()));

      const matchLevel =
        selectedLevel === 'todos' ||
        (s.nivel && s.nivel.toLowerCase() === selectedLevel);

      return matchSearch && matchLevel;
    });
  }, [students, search, selectedLevel]);

  const filteredStaff = useMemo(() => {
    return staffList.filter((st) => {
      return (
        !search ||
        st.nombre.toLowerCase().includes(search.toLowerCase()) ||
        st.email.toLowerCase().includes(search.toLowerCase()) ||
        (st.dni && st.dni.includes(search)) ||
        st.role.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [staffList, search]);

  const filteredSolicitudes = useMemo(() => {
    return solicitudesList.filter((sol) => {
      const matchSearch =
        !search ||
        (sol.nombre && sol.nombre.toLowerCase().includes(search.toLowerCase())) ||
        (sol.tutorNombre && sol.tutorNombre.toLowerCase().includes(search.toLowerCase())) ||
        (sol.dni && sol.dni.includes(search)) ||
        (sol.emailPadre && sol.emailPadre.toLowerCase().includes(search.toLowerCase()));

      const matchLevel =
        selectedLevel === 'todos' ||
        (sol.nivel && sol.nivel.toLowerCase() === selectedLevel);

      return matchSearch && matchLevel;
    });
  }, [solicitudesList, search, selectedLevel]);

  const levelLabel = useMemo(() => {
    switch (selectedLevel) {
      case 'inicial':
        return 'Nivel Inicial';
      case 'primaria':
        return 'Primaria';
      case 'secundaria':
        return 'Secundaria';
      default:
        return 'Todos los niveles';
    }
  }, [selectedLevel]);

  const tabOptions: PillOption<'estudiantes' | 'personal' | 'solicitudes'>[] = [
    { id: 'estudiantes', label: 'Estudiantes', count: students.length },
    { id: 'personal', label: 'Personal', count: staffList.length },
    { id: 'solicitudes', label: 'Solicitudes', count: solicitudesList.length },
  ];

  return (
    <View style={styles.container}>
      {/* ── ENCABEZADO DEL DASHBOARD ── */}
      <View style={styles.headerSection}>
        <Text style={[styles.mainHeading, { color: theme.textPrimary }]}>Dashboard de Usuarios</Text>
        <Text style={[styles.mainSubheading, { color: theme.textSecondary }]}>
          Gestión de tutores, estudiantes y activación de credenciales.
        </Text>
      </View>

      {/* ── FILTROS (BÚSQUEDA Y NIVEL) ── */}
      <View style={[styles.filterCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder={
              activeTab === 'personal'
                ? 'Buscar por personal o correo...'
                : activeTab === 'solicitudes'
                ? 'Buscar por solicitud o tutor...'
                : 'Buscar por alumno, email o ID...'
            }
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {activeTab !== 'personal' && (
          <View style={styles.levelSelectorRow}>
            <Text style={[styles.levelSelectorLabel, { color: theme.textSecondary }]}>Nivel Educativo:</Text>
            <TouchableOpacity
              style={[styles.levelSelectorBtn, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
              onPress={() => setIsLevelModalOpen(true)}
            >
              <Text style={[styles.levelSelectorBtnText, { color: theme.textPrimary }]}>{levelLabel}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── SELECTOR DE PESTAÑAS (MOLÉCULA PILLSELECTOR) ── */}
      <PillSelector
        options={tabOptions}
        selectedId={activeTab}
        onSelect={setActiveTab}
        isDarkMode={isDarkMode}
      />

      {/* ── LISTADO SEGÚN PESTAÑA ── */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Cargando datos institucionales...</Text>
        </View>
      ) : activeTab === 'estudiantes' ? (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <StudentCard item={item} isDarkMode={isDarkMode} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No se encontraron alumnos"
              subtitle="Prueba con otros criterios de búsqueda o añade nuevos usuarios."
              isDarkMode={isDarkMode}
            />
          }
        />
      ) : activeTab === 'personal' ? (
        <FlatList
          data={filteredStaff}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <StaffCard item={item} isDarkMode={isDarkMode} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No se encontró personal"
              subtitle="Prueba con otros criterios de búsqueda o añade nuevo personal."
              isDarkMode={isDarkMode}
            />
          }
        />
      ) : (
        <FlatList
          data={filteredSolicitudes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SolicitudCard
              item={item}
              isDarkMode={isDarkMode}
              onAprobar={onAprobarSolicitud}
              onRechazar={onRechazarSolicitud}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No hay solicitudes pendientes"
              subtitle="Todas las preinscripciones han sido procesadas."
              isDarkMode={isDarkMode}
            />
          }
        />
      )}

      {/* ── MODAL SELECTOR DE NIVEL EDUCATIVO ── */}
      <Modal visible={isLevelModalOpen} transparent animationType="fade" onRequestClose={() => setIsLevelModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsLevelModalOpen(false)}>
          <View style={[styles.levelModalCard, { backgroundColor: theme.modalBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.levelModalTitle, { color: theme.textPrimary }]}>Seleccionar Nivel Educativo</Text>
            {[
              { id: 'todos', label: 'Todos los niveles' },
              { id: 'inicial', label: 'Nivel Inicial' },
              { id: 'primaria', label: 'Primaria' },
              { id: 'secundaria', label: 'Secundaria' },
            ].map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.levelModalItem, selectedLevel === item.id && styles.levelModalItemActive]}
                onPress={() => {
                  setSelectedLevel(item.id);
                  setIsLevelModalOpen(false);
                }}
              >
                <Text style={[styles.levelModalItemText, selectedLevel === item.id ? { color: '#EA580C', fontWeight: 'bold' } : { color: theme.textPrimary }]}>
                  {item.label}
                </Text>
                {selectedLevel === item.id && <Ionicons name="checkmark" size={18} color="#EA580C" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerSection: {
    paddingVertical: 14,
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '800',
  },
  mainSubheading: {
    fontSize: 13,
    marginTop: 4,
  },
  filterCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  levelSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelSelectorLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  levelSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  levelSelectorBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelModalCard: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  levelModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  levelModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B20',
  },
  levelModalItemActive: {
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  levelModalItemText: {
    fontSize: 14,
  },
});

export default AdminDashboardTab;
