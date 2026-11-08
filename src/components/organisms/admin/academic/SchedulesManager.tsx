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
  Schedule,
  Subject,
  Sport,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSubjects,
  getSports,
} from '../../../../services/academicService';
import Badge from '../../../atoms/Badge';
import EmptyState from '../../../molecules/EmptyState';
import AcademicCard from '../../../molecules/AcademicCard';

interface SchedulesManagerProps {
  isDarkMode?: boolean;
}

export const SchedulesManager: React.FC<SchedulesManagerProps> = ({ isDarkMode = false }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Form State
  const [type, setType] = useState<'subject' | 'sport'>('subject');
  const [referenceId, setReferenceId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Lunes');
  const [startTime, setStartTime] = useState('07:45');
  const [endTime, setEndTime] = useState('09:15');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [schedData, subjData, sportData] = await Promise.all([
        getSchedules(),
        getSubjects(),
        getSports(),
      ]);
      setSchedules(schedData);
      setSubjects(subjData);
      setSports(sportData);
    } catch (err) {
      console.error('Error al cargar cronograma:', err);
      Alert.alert('Error', 'No se pudieron cargar los horarios.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (sched?: Schedule) => {
    setError('');
    if (sched) {
      setEditingSchedule(sched);
      setType(sched.type);
      setReferenceId(sched.referenceId);
      setDayOfWeek(sched.dayOfWeek);
      setStartTime(sched.startTime);
      setEndTime(sched.endTime);
    } else {
      setEditingSchedule(null);
      setType('subject');
      setReferenceId(subjects.length > 0 ? subjects[0].id : '');
      setDayOfWeek('Lunes');
      setStartTime('07:45');
      setEndTime('09:15');
    }
    setIsModalOpen(true);
  };

  // Ajustar referenceId al cambiar el tipo
  useEffect(() => {
    if (!editingSchedule) {
      if (type === 'subject' && subjects.length > 0) setReferenceId(subjects[0].id);
      if (type === 'sport' && sports.length > 0) setReferenceId(sports[0].id);
    }
  }, [type, subjects, sports, editingSchedule]);

  const handleSubmit = async () => {
    setError('');
    if (!referenceId) {
      setError('Debés seleccionar una Materia o Deporte.');
      return;
    }
    if (startTime >= endTime) {
      setError('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { type, referenceId, dayOfWeek, startTime, endTime };
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, payload);
      } else {
        await createSchedule(payload);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al guardar el horario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, actName: string) => {
    Alert.alert(
      'Eliminar Horario',
      `¿Estás seguro de que deseas eliminar este horario de "${actName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSchedule(id);
              await loadData();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el horario.');
            }
          },
        },
      ]
    );
  };

  const getActivityName = (sched: Schedule) => {
    if (sched.type === 'subject') {
      const s = subjects.find((x) => x.id === sched.referenceId);
      return s ? s.name : 'Materia Eliminada';
    } else {
      const sp = sports.find((x) => x.id === sched.referenceId);
      return sp ? sp.name : 'Deporte Eliminado';
    }
  };

  // Ordenamiento cronológico: día de la semana y hora de inicio
  const sortedSchedules = [...schedules].sort(
    (a, b) =>
      daysOfWeek.indexOf(a.dayOfWeek) - daysOfWeek.indexOf(b.dayOfWeek) ||
      a.startTime.localeCompare(b.startTime)
  );

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
          <Text style={[styles.sectionTitle, { color: theme.titleColor }]}>Cronograma de Horarios</Text>
          <Text style={[styles.sectionSub, { color: theme.subColor }]}>
            {schedules.length} {schedules.length === 1 ? 'bloque configurado' : 'bloques configurados'}
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()} activeOpacity={0.85}>
          <MaterialIcons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Nuevo Horario</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Horarios */}
      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : sortedSchedules.length === 0 ? (
        <EmptyState
          icon="schedule"
          title="No hay horarios configurados"
          subtitle="Presioná '+ Nuevo Horario' para programar materias y actividades deportivas."
          isDarkMode={isDarkMode}
        />
      ) : (
        <View style={{ marginTop: 12 }}>
          {sortedSchedules.map((sc) => {
            const actName = getActivityName(sc);
            return (
              <AcademicCard
                key={sc.id}
                title={actName}
                subtitle={`${sc.dayOfWeek} • ${sc.startTime} - ${sc.endTime} hs`}
                badges={<Badge type="horario-tipo" value={sc.type} isDarkMode={isDarkMode} />}
                onEdit={() => handleOpenModal(sc)}
                onDelete={() => handleDelete(sc.id, actName)}
                isDarkMode={isDarkMode}
              />
            );
          })}
        </View>
      )}

      {/* Modal Alta / Edición */}
      <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="schedule" size={22} color="#EA580C" style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: theme.titleColor }]}>
                  {editingSchedule ? 'Editar Horario' : 'Nuevo Horario'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <MaterialIcons name="close" size={24} color={theme.subColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Tipo de Actividad */}
              <Text style={[styles.inputLabel, { color: theme.subColor }]}>TIPO DE ACTIVIDAD</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    { backgroundColor: type === 'subject' ? '#2563EB' : theme.chipInactive },
                  ]}
                  onPress={() => setType('subject')}
                >
                  <Text style={[styles.chipText, { color: type === 'subject' ? '#FFFFFF' : theme.titleColor }]}>
                    Materia (Académico)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chip,
                    { backgroundColor: type === 'sport' ? '#EA580C' : theme.chipInactive },
                  ]}
                  onPress={() => setType('sport')}
                >
                  <Text style={[styles.chipText, { color: type === 'sport' ? '#FFFFFF' : theme.titleColor }]}>
                    Deporte
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Actividad específica */}
              <Text style={[styles.inputLabel, { color: theme.subColor, marginTop: 14 }]}>
                SELECCIONAR {type === 'subject' ? 'MATERIA' : 'DEPORTE'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={styles.chipRow}>
                  {type === 'subject' ? (
                    subjects.length === 0 ? (
                      <Text style={{ color: theme.subColor, fontSize: 12 }}>No hay materias registradas</Text>
                    ) : (
                      subjects.map((s) => {
                        const isSel = referenceId === s.id;
                        return (
                          <TouchableOpacity
                            key={s.id}
                            style={[
                              styles.chip,
                              { backgroundColor: isSel ? '#2563EB' : theme.chipInactive },
                            ]}
                            onPress={() => setReferenceId(s.id)}
                          >
                            <Text style={[styles.chipText, { color: isSel ? '#FFFFFF' : theme.titleColor }]}>
                              {s.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })
                    )
                  ) : sports.length === 0 ? (
                    <Text style={{ color: theme.subColor, fontSize: 12 }}>No hay deportes registrados</Text>
                  ) : (
                    sports.map((sp) => {
                      const isSel = referenceId === sp.id;
                      return (
                        <TouchableOpacity
                          key={sp.id}
                          style={[
                            styles.chip,
                            { backgroundColor: isSel ? '#EA580C' : theme.chipInactive },
                          ]}
                          onPress={() => setReferenceId(sp.id)}
                        >
                          <Text style={[styles.chipText, { color: isSel ? '#FFFFFF' : theme.titleColor }]}>
                            {sp.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </ScrollView>

              {/* Día de la semana */}
              <Text style={[styles.inputLabel, { color: theme.subColor }]}>DÍA DE LA SEMANA</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={styles.chipRow}>
                  {daysOfWeek.map((d) => {
                    const isSel = dayOfWeek === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        style={[
                          styles.chip,
                          { backgroundColor: isSel ? '#EA580C' : theme.chipInactive },
                        ]}
                        onPress={() => setDayOfWeek(d)}
                      >
                        <Text style={[styles.chipText, { color: isSel ? '#FFFFFF' : theme.titleColor }]}>{d}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Horas de inicio y fin */}
              <View style={styles.timeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.subColor }]}>HORA INICIO</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { backgroundColor: theme.modalInputBg, borderColor: theme.border, color: theme.titleColor },
                    ]}
                    placeholder="07:45"
                    placeholderTextColor={theme.subColor}
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.inputLabel, { color: theme.subColor }]}>HORA FIN</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { backgroundColor: theme.modalInputBg, borderColor: theme.border, color: theme.titleColor },
                    ]}
                    placeholder="09:15"
                    placeholderTextColor={theme.subColor}
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </View>
              </View>

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
                    {editingSchedule ? 'Actualizar Horario' : 'Guardar Horario'}
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

export default SchedulesManager;

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
  timeRow: {
    flexDirection: 'row',
    marginTop: 6,
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
