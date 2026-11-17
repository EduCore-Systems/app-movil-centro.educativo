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
  Subject,
  Course,
  TeacherOption,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getCourses,
  getStaffTeachers,
} from '../../../../services/academicService';
import Badge from '../../../atoms/Badge';
import EmptyState from '../../../molecules/EmptyState';
import AcademicCard from '../../../molecules/AcademicCard';

interface SubjectsManagerProps {
  isDarkMode?: boolean;
}

export const SubjectsManager: React.FC<SubjectsManagerProps> = ({ isDarkMode = false }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subjData, cData, tData] = await Promise.all([
        getSubjects(),
        getCourses(),
        getStaffTeachers(),
      ]);
      setSubjects(subjData);
      setCourses(cData);
      setTeachers(tData);
    } catch (err) {
      console.error('Error al cargar materias:', err);
      Alert.alert('Error', 'No se pudieron cargar las materias.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (subject?: Subject) => {
    setError('');
    if (subject) {
      setEditingSubject(subject);
      setName(subject.name);
      setCourseId(subject.courseId);
      setTeacherId(subject.teacherId || '');
    } else {
      setEditingSubject(null);
      setName('');
      setCourseId(courses.length > 0 ? courses[0].id : '');
      setTeacherId('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) {
      setError('El nombre de la materia es obligatorio.');
      return;
    }
    if (!courseId) {
      setError('Debés asignar un curso a la materia.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { name: name.trim(), courseId, teacherId };
      if (editingSubject) {
        await updateSubject(editingSubject.id, payload);
      } else {
        await createSubject(payload);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al guardar la materia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, subName: string) => {
    Alert.alert(
      'Eliminar Materia',
      `¿Estás seguro de que deseas eliminar la materia "${subName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubject(id);
              await loadData();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar la materia.');
            }
          },
        },
      ]
    );
  };

  const getCourseName = (cId: string) => {
    const c = courses.find((x) => x.id === cId);
    return c ? c.name : 'Curso Eliminado';
  };

  const getTeacherName = (tId?: string) => {
    if (!tId) return 'Sin asignar';
    const t = teachers.find((x) => x.id === tId);
    return t ? t.nombre : 'Profesor Eliminado';
  };

  // Ordenamiento idéntico al web: agrupado por materia alfabéticamente y luego por curso
  const sortedSubjects = Object.entries(
    subjects.reduce((acc: Record<string, Subject[]>, sub) => {
      if (!acc[sub.name]) acc[sub.name] = [];
      acc[sub.name].push(sub);
      return acc;
    }, {})
  )
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .flatMap(([_, subs]) =>
      subs.sort((a, b) => getCourseName(a.courseId).localeCompare(getCourseName(b.courseId)))
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
          <Text style={[styles.sectionTitle, { color: theme.titleColor }]}>Materias Registradas</Text>
          <Text style={[styles.sectionSub, { color: theme.subColor }]}>
            {subjects.length} {subjects.length === 1 ? 'materia registrada' : 'materias registradas'}
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()} activeOpacity={0.85}>
          <MaterialIcons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Nueva Materia</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Materias */}
      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : sortedSubjects.length === 0 ? (
        <EmptyState
          icon="menu-book"
          title="No hay materias registradas"
          subtitle="Presioná '+ Nueva Materia' para dar de alta materias asignadas a cursos."
          isDarkMode={isDarkMode}
        />
      ) : (
        <View style={{ marginTop: 12 }}>
          {sortedSubjects.map((sub) => (
            <AcademicCard
              key={sub.id}
              title={sub.name}
              badges={
                <>
                  <Badge type="curso" value={getCourseName(sub.courseId)} isDarkMode={isDarkMode} />
                  <Badge type="profesor" value={getTeacherName(sub.teacherId)} isDarkMode={isDarkMode} />
                </>
              }
              onEdit={() => handleOpenModal(sub)}
              onDelete={() => handleDelete(sub.id, sub.name)}
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
                <MaterialIcons name="menu-book" size={22} color="#EA580C" style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: theme.titleColor }]}>
                  {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <MaterialIcons name="close" size={24} color={theme.subColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Nombre */}
              <Text style={[styles.inputLabel, { color: theme.subColor }]}>NOMBRE DE LA MATERIA</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.modalInputBg, borderColor: theme.border, color: theme.titleColor },
                ]}
                placeholder="Ej: Biología Celular"
                placeholderTextColor={theme.subColor}
                value={name}
                onChangeText={setName}
              />

              {/* Selector de Curso */}
              <Text style={[styles.inputLabel, { color: theme.subColor, marginTop: 14 }]}>CURSO ASIGNADO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={styles.chipRow}>
                  {courses.length === 0 ? (
                    <Text style={{ color: theme.subColor, fontSize: 12 }}>No hay cursos disponibles</Text>
                  ) : (
                    courses.map((c) => {
                      const isSel = courseId === c.id;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          style={[
                            styles.chip,
                            { backgroundColor: isSel ? '#2563EB' : theme.chipInactive },
                          ]}
                          onPress={() => setCourseId(c.id)}
                        >
                          <Text style={[styles.chipText, { color: isSel ? '#FFFFFF' : theme.titleColor }]}>
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </ScrollView>

              {/* Selector de Profesor */}
              <Text style={[styles.inputLabel, { color: theme.subColor }]}>PROFESOR A CARGO</Text>
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
                    {editingSubject ? 'Actualizar Materia' : 'Guardar Materia'}
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

export default SubjectsManager;

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
