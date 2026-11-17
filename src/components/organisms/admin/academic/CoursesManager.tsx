import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Course, getCourses, createCourse, updateCourse, deleteCourse } from '../../../../services/academicService';
import Badge from '../../../atoms/Badge';
import EmptyState from '../../../molecules/EmptyState';
import AcademicCard from '../../../molecules/AcademicCard';

interface CoursesManagerProps {
  isDarkMode?: boolean;
}

export const CoursesManager: React.FC<CoursesManagerProps> = ({ isDarkMode = false }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [level, setLevel] = useState<'inicial' | 'primaria' | 'secundaria'>('secundaria');
  const [grade, setGrade] = useState('1° Año');
  const [division, setDivision] = useState('A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCoursesData = async () => {
    setIsLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Error al cargar cursos:', err);
      Alert.alert('Error', 'No se pudieron cargar los cursos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesData();
  }, []);

  // Sincronizar grado cuando cambia el nivel
  useEffect(() => {
    if (level === 'inicial' && !grade.startsWith('Sala')) setGrade('Sala de 4');
    if (level === 'primaria' && !grade.includes('Grado')) setGrade('1° Grado');
    if (level === 'secundaria' && !grade.includes('Año')) setGrade('1° Año');
  }, [level]);

  const handleOpenModal = (course?: Course) => {
    setError('');
    if (course) {
      setEditingCourse(course);
      setLevel(course.level);
      const parts = course.name.split(' ');
      setDivision(parts.pop() || 'A');
      setGrade(parts.join(' ') || '1° Año');
    } else {
      setEditingCourse(null);
      setLevel('secundaria');
      setGrade('1° Año');
      setDivision('A');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setError('');
    const name = `${grade} ${division}`;

    setIsSubmitting(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, { name, level });
      } else {
        await createCourse({ name, level });
      }
      await fetchCoursesData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al guardar el curso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Eliminar Curso',
      `¿Estás seguro de que deseas eliminar el curso "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCourse(id);
              await fetchCoursesData();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el curso.');
            }
          },
        },
      ]
    );
  };

  const sortedCourses = [...courses].sort((a, b) => {
    const levelOrder: Record<string, number> = { inicial: 1, primaria: 2, secundaria: 3 };
    if (levelOrder[a.level] !== levelOrder[b.level]) {
      return (levelOrder[a.level] || 99) - (levelOrder[b.level] || 99);
    }
    return a.name.localeCompare(b.name);
  });

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

  const gradeOptions = {
    inicial: ['Sala de 3', 'Sala de 4', 'Sala de 5'],
    primaria: ['1° Grado', '2° Grado', '3° Grado', '4° Grado', '5° Grado', '6° Grado', '7° Grado'],
    secundaria: ['1° Año', '2° Año', '3° Año', '4° Año', '5° Año', '6° Año'],
  }[level];

  return (
    <View style={styles.container}>
      {/* Header con Título y Botón Naranja */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.titleColor }]}>Cursos Registrados</Text>
          <Text style={[styles.sectionSub, { color: theme.subColor }]}>
            {courses.length} {courses.length === 1 ? 'curso disponible' : 'cursos disponibles'}
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()} activeOpacity={0.85}>
          <MaterialIcons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Nuevo Curso</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Cursos */}
      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : sortedCourses.length === 0 ? (
        <EmptyState
          icon="class"
          title="No hay cursos registrados"
          subtitle="Presioná '+ Nuevo Curso' para dar de alta el primer curso escolar."
          isDarkMode={isDarkMode}
        />
      ) : (
        <View style={{ marginTop: 12 }}>
          {sortedCourses.map((c) => (
            <AcademicCard
              key={c.id}
              title={c.name}
              badges={<Badge type="nivel" value={c.level} isDarkMode={isDarkMode} />}
              onEdit={() => handleOpenModal(c)}
              onDelete={() => handleDelete(c.id, c.name)}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      )}

      {/* Modal de Alta / Edición */}
      <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="class" size={22} color="#EA580C" style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: theme.titleColor }]}>
                  {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <MaterialIcons name="close" size={24} color={theme.subColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Selector de Nivel */}
              <Text style={[styles.inputLabel, { color: theme.subColor }]}>NIVEL EDUCATIVO</Text>
              <View style={styles.chipRow}>
                {(['inicial', 'primaria', 'secundaria'] as const).map((lvl) => {
                  const isSel = level === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      style={[
                        styles.chip,
                        { backgroundColor: isSel ? '#EA580C' : theme.chipInactive },
                      ]}
                      onPress={() => setLevel(lvl)}
                    >
                      <Text style={[styles.chipText, { color: isSel ? '#FFFFFF' : theme.titleColor }]}>
                        {lvl.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selector de Grado / Año */}
              <Text style={[styles.inputLabel, { color: theme.subColor, marginTop: 16 }]}>AÑO / GRADO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={styles.chipRow}>
                  {gradeOptions.map((g) => {
                    const isSel = grade === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.chip,
                          { backgroundColor: isSel ? '#2563EB' : theme.chipInactive },
                        ]}
                        onPress={() => setGrade(g)}
                      >
                        <Text style={[styles.chipText, { color: isSel ? '#FFFFFF' : theme.titleColor }]}>{g}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Selector de División */}
              <Text style={[styles.inputLabel, { color: theme.subColor }]}>DIVISIÓN</Text>
              <View style={styles.chipRow}>
                {['A', 'B', 'C', 'D'].map((div) => {
                  const isSel = division === div;
                  return (
                    <TouchableOpacity
                      key={div}
                      style={[
                        styles.chipSmall,
                        { backgroundColor: isSel ? '#EA580C' : theme.chipInactive },
                      ]}
                      onPress={() => setDivision(div)}
                    >
                      <Text style={[styles.chipText, { color: isSel ? '#FFFFFF' : theme.titleColor }]}>{div}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Vista previa de nombre */}
              <View style={[styles.previewBox, { backgroundColor: theme.modalInputBg, borderColor: theme.border }]}>
                <Text style={[styles.previewLabel, { color: theme.subColor }]}>Nombre que se registrará:</Text>
                <Text style={[styles.previewValue, { color: theme.titleColor }]}>{grade} {division}</Text>
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
                    {editingCourse ? 'Actualizar Curso' : 'Guardar Curso'}
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

export default CoursesManager;

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
  chipSmall: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 42,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  previewValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
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
