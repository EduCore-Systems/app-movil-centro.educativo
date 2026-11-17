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
  Sport,
  TeacherOption,
  getSports,
  createSport,
  updateSport,
  deleteSport,
  getStaffTeachers,
} from '../../../../services/academicService';
import Badge from '../../../atoms/Badge';
import EmptyState from '../../../molecules/EmptyState';
import AcademicCard from '../../../molecules/AcademicCard';

interface SportsManagerProps {
  isDarkMode?: boolean;
}

export const SportsManager: React.FC<SportsManagerProps> = ({ isDarkMode = false }) => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sportData, tData] = await Promise.all([
        getSports(),
        getStaffTeachers(),
      ]);
      setSports(sportData);
      setTeachers(tData);
    } catch (err) {
      console.error('Error al cargar deportes:', err);
      Alert.alert('Error', 'No se pudieron cargar los deportes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (sport?: Sport) => {
    setError('');
    if (sport) {
      setEditingSport(sport);
      setName(sport.name);
      setTeacherId(sport.teacherId || '');
    } else {
      setEditingSport(null);
      setName('');
      setTeacherId('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) {
      setError('El nombre del deporte es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { name: name.trim(), teacherId };
      if (editingSport) {
        await updateSport(editingSport.id, payload);
      } else {
        await createSport(payload);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al guardar el deporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, sName: string) => {
    Alert.alert(
      'Eliminar Deporte',
      `¿Estás seguro de que deseas eliminar el deporte "${sName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSport(id);
              await loadData();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el deporte.');
            }
          },
        },
      ]
    );
  };

  const getTeacherName = (tId?: string) => {
    if (!tId) return 'Sin asignar';
    const t = teachers.find((x) => x.id === tId);
    return t ? t.nombre : 'Profesor Eliminado';
  };

  // Ordenamiento alfabético igual que en la web
  const sortedSports = [...sports].sort((a, b) => a.name.localeCompare(b.name));

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    modalBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    modalInputBg: isDarkMode ? '#1E293B' : '#F8FAFC',
    chipActive: '#EA580C',
    chipInactive: isDarkMode ? '#334155' : '#F1F5F9',
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.titleColor }]}>Deportes Registrados</Text>
          <Text style={[styles.sectionSub, { color: theme.subColor }]}>
            {sports.length} {sports.length === 1 ? 'deporte registrado' : 'deportes registrados'}
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()} activeOpacity={0.85}>
          <MaterialIcons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Nuevo Deporte</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Deportes */}
      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : sortedSports.length === 0 ? (
        <EmptyState
          icon="sports-soccer"
          title="No hay deportes registrados"
          subtitle="Presioná '+ Nuevo Deporte' para dar de alta disciplinas deportivas."
          isDarkMode={isDarkMode}
        />
      ) : (
        <View style={{ marginTop: 12 }}>
          {sortedSports.map((sp) => (
            <AcademicCard
              key={sp.id}
              title={sp.name}
              badges={<Badge type="profesor" value={getTeacherName(sp.teacherId)} isDarkMode={isDarkMode} />}
              onEdit={() => handleOpenModal(sp)}
              onDelete={() => handleDelete(sp.id, sp.name)}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      )}

      {/* Modal Alta / Edición */}
      <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="sports-soccer" size={22} color="#EA580C" style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: theme.titleColor }]}>
                  {editingSport ? 'Editar Deporte' : 'Nuevo Deporte'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <MaterialIcons name="close" size={24} color={theme.subColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: theme.subColor }]}>NOMBRE DEL DEPORTE</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.modalInputBg, borderColor: theme.border, color: theme.titleColor },
                ]}
                placeholder="Ej: Artes Marciales"
                placeholderTextColor={theme.subColor}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.inputLabel, { color: theme.subColor, marginTop: 14 }]}>
                ENTRENADOR / PROFESOR A CARGO
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      { backgroundColor: !teacherId ? '#10B981' : theme.chipInactive },
                    ]}
                    onPress={() => setTeacherId('')}
                  >
                    <Text style={[styles.chipText, { color: !teacherId ? '#FFFFFF' : theme.titleColor }]}>
                      Sin Asignar
                    </Text>
                  </TouchableOpacity>

                  {teachers.map((t) => {
                    const isSel = teacherId === t.id;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.chip,
                          { backgroundColor: isSel ? '#10B981' : theme.chipInactive },
                        ]}
                        onPress={() => setTeacherId(t.id)}
                      >
                        <Text style={[styles.chipText, { color: isSel ? '#FFFFFF' : theme.titleColor }]}>
                          {t.nombre}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

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
                    {editingSport ? 'Actualizar Deporte' : 'Guardar Deporte'}
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

export default SportsManager;

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
  loaderBox: {
    padding: 40,
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
    maxHeight: '85%',
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
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
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
    marginTop: 16,
    marginBottom: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
