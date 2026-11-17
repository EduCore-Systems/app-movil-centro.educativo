import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  StudentService,
  getServiceStudents,
  updateStudentDining,
  confirmStudentDining,
} from '../../../../services/additionalServices';
import StudentDiningCard from '../../../molecules/StudentDiningCard';
import EmptyState from '../../../molecules/EmptyState';

interface DiningManagerProps {
  isDarkMode?: boolean;
}

export const DiningManager: React.FC<DiningManagerProps> = ({ isDarkMode = false }) => {
  const [students, setStudents] = useState<StudentService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getServiceStudents();
      setStudents(data);
    } catch (err) {
      console.error('Error al cargar alumnos para comedor:', err);
      Alert.alert('Error', 'No se pudieron cargar los alumnos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleDining = async (studentId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // Optimistic local update
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, diningRoomEnabled: newStatus } : s))
    );

    try {
      await updateStudentDining(studentId, newStatus);
    } catch (err) {
      console.error('Error al actualizar comedor:', err);
      Alert.alert('Error', 'Error de conexión al actualizar el comedor.');
      // Rollback
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, diningRoomEnabled: currentStatus } : s))
      );
    }
  };

  const handleConfirmDining = async (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, comedor_estado: 'confirmado' } : s))
    );

    try {
      await confirmStudentDining(studentId);
    } catch (err) {
      console.error('Error al confirmar comedor:', err);
      Alert.alert('Error', 'No se pudo confirmar el servicio de comedor.');
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
    inputBg: isDarkMode ? '#1E293B' : '#F8FAFC',
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionTitle, { color: theme.titleColor }]}>Servicio de Comedor</Text>
          <Text style={[styles.sectionSub, { color: theme.subColor }]}>
            Habilitá o deshabilitá el acceso al comedor para cada alumno.
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

      {/* Listado */}
      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon="search-off"
          title="No se encontraron alumnos"
          subtitle="Probá con otro término de búsqueda."
          isDarkMode={isDarkMode}
        />
      ) : (
        <View style={{ marginTop: 8 }}>
          {filteredStudents.map((st) => (
            <StudentDiningCard
              key={st.id}
              student={st}
              onToggleDining={handleToggleDining}
              onConfirm={handleConfirmDining}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default DiningManager;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    marginBottom: 12,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  loaderBox: {
    padding: 30,
    alignItems: 'center',
  },
});
