import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  TransportRoute,
  StudentService,
  getTransportRoutes,
  createTransportRoute,
  updateTransportRoute,
  deleteTransportRoute,
  getServiceStudents,
  updateStudentTransport,
  confirmStudentTransport,
} from '../../../../services/additionalServices';
import TransportRouteCard from '../../../molecules/TransportRouteCard';
import StudentTransportCard from '../../../molecules/StudentTransportCard';
import EmptyState from '../../../molecules/EmptyState';

interface TransportManagerProps {
  isDarkMode?: boolean;
}

export const TransportManager: React.FC<TransportManagerProps> = ({ isDarkMode = false }) => {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [students, setStudents] = useState<StudentService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Search Filter
  const [studentSearch, setStudentSearch] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rData, sData] = await Promise.all([
        getTransportRoutes(),
        getServiceStudents(),
      ]);
      setRoutes(rData);
      setStudents(sData);
    } catch (err) {
      console.error('Error al cargar datos de transporte:', err);
      Alert.alert('Error', 'No se pudieron cargar los datos de transporte.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (route?: TransportRoute) => {
    setError('');
    if (route) {
      setEditingRoute(route);
      setName(route.name);
      setCost(String(route.cost));
    } else {
      setEditingRoute(null);
      setName('');
      setCost('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) {
      setError('El nombre del recorrido es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    try {
      const routeData = { name: name.trim(), cost: Number(cost) || 0 };
      if (editingRoute) {
        await updateTransportRoute(editingRoute.id, routeData);
      } else {
        await createTransportRoute(routeData);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al guardar el recorrido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, routeName: string) => {
    Alert.alert(
      'Eliminar Recorrido',
      `¿Estás seguro de que deseas eliminar "${routeName}"? Los alumnos asignados quedarán sin recorrido.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransportRoute(id);
              await loadData();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el recorrido.');
            }
          },
        },
      ]
    );
  };

  const handleAssignTransport = async (studentId: string, routeId: string) => {
    const selectedRoute = routes.find((r) => r.id === routeId);
    const routeName = selectedRoute ? selectedRoute.name : 'No utiliza transporte';
    const estado = routeId ? 'confirmado' : 'sin_servicio';

    // Optimistic update
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              transportRouteId: routeId || null,
              transporte_recorrido: routeName,
              transporte_estado: estado,
            }
          : s
      )
    );

    try {
      await updateStudentTransport(studentId, routeId || null, routeName, estado);
    } catch (err) {
      console.error('Error al asignar transporte:', err);
      Alert.alert('Error', 'No se pudo actualizar el transporte del alumno.');
      await loadData();
    }
  };

  const handleConfirmTransport = async (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, transporte_estado: 'confirmado' } : s))
    );

    try {
      await confirmStudentTransport(studentId);
    } catch (err) {
      console.error('Error al confirmar transporte:', err);
      Alert.alert('Error', 'No se pudo confirmar el transporte.');
      await loadData();
    }
  };

  const filteredStudents = students.filter((s) =>
    (s.nombre || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    modalBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    inputBg: isDarkMode ? '#1E293B' : '#F8FAFC',
  };

  return (
    <View style={styles.container}>
      {/* ── SECCIÓN 1: RECORRIDOS DE TRANSPORTE ── */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.titleColor }]}>Recorridos de Transporte</Text>
          <Text style={[styles.sectionSub, { color: theme.subColor }]}>
            {routes.length} {routes.length === 1 ? 'recorrido disponible' : 'recorridos disponibles'}
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()} activeOpacity={0.85}>
          <MaterialIcons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Nuevo Recorrido</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : routes.length === 0 ? (
        <EmptyState
          icon="directions-bus"
          title="No hay recorridos registrados"
          subtitle="Presioná '+ Nuevo Recorrido' para dar de alta la primera ruta."
          isDarkMode={isDarkMode}
        />
      ) : (
        <View style={{ marginTop: 10, marginBottom: 24 }}>
          {routes.map((route) => {
            const count = students.filter(
              (s) => s.transportRouteId === route.id || s.transporte_recorrido === route.name
            ).length;
            return (
              <TransportRouteCard
                key={route.id}
                route={route}
                passengerCount={count}
                onEdit={() => handleOpenModal(route)}
                onDelete={() => handleDelete(route.id, route.name)}
                isDarkMode={isDarkMode}
              />
            );
          })}
        </View>
      )}

      {/* ── SECCIÓN 2: ASIGNACIÓN DE ALUMNOS ── */}
      <View style={[styles.headerRow, { marginTop: 12 }]}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.titleColor }]}>Asignación de Alumnos</Text>
          <Text style={[styles.sectionSub, { color: theme.subColor }]}>
            {filteredStudents.length} {filteredStudents.length === 1 ? 'alumno' : 'alumnos'}
          </Text>
        </View>
      </View>

      {/* Input de Búsqueda */}
      <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <MaterialIcons name="search" size={20} color={theme.subColor} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.titleColor }]}
          placeholder="Buscar alumno..."
          placeholderTextColor={theme.subColor}
          value={studentSearch}
          onChangeText={setStudentSearch}
        />
        {studentSearch ? (
          <TouchableOpacity onPress={() => setStudentSearch('')}>
            <MaterialIcons name="close" size={18} color={theme.subColor} />
          </TouchableOpacity>
        ) : null}
      </View>

      {filteredStudents.length === 0 ? (
        <EmptyState
          icon="search-off"
          title="No se encontraron alumnos"
          subtitle="Probá con otro término de búsqueda."
          isDarkMode={isDarkMode}
        />
      ) : (
        <View style={{ marginTop: 10 }}>
          {filteredStudents.map((st) => (
            <StudentTransportCard
              key={st.id}
              student={st}
              routes={routes}
              onAssignRoute={handleAssignTransport}
              onConfirm={handleConfirmTransport}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      )}

      {/* Modal Alta / Edición de Recorrido */}
      <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="directions-bus" size={22} color="#EA580C" style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: theme.titleColor }]}>
                  {editingRoute ? 'Editar Recorrido' : 'Nuevo Recorrido'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <MaterialIcons name="close" size={24} color={theme.subColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: theme.subColor }]}>NOMBRE DEL RECORRIDO</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.titleColor }]}
                placeholder="Ej: Recorrido Norte"
                placeholderTextColor={theme.subColor}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.inputLabel, { color: theme.subColor, marginTop: 14 }]}>COSTO MENSUAL ($)</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.titleColor }]}
                placeholder="Ej: 40000"
                placeholderTextColor={theme.subColor}
                keyboardType="numeric"
                value={cost}
                onChangeText={setCost}
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {editingRoute ? 'Actualizar Recorrido' : 'Guardar Recorrido'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TransportManager;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  loaderBox: {
    padding: 30,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  modalBox: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#33415522',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
