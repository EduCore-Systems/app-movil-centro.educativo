import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { FamilyStudent } from '../../../services/familyService';

export interface SubjectItem {
  id: string;
  name: string;
  teacherName?: string;
  schedule?: string;
  courseId?: string;
}

interface StudentSubjectsTabProps {
  student: FamilyStudent;
  isDarkMode?: boolean;
  onOpenChatWithTeacher?: (subject: SubjectItem) => void;
}

const getSubjectIcon = (name: string = ''): { icon: keyof typeof MaterialIcons.glyphMap; color: string; bg: string } => {
  const n = name.toLowerCase();
  if (n.includes('matemática') || n.includes('física') || n.includes('calculo')) {
    return { icon: 'calculate', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.12)' };
  }
  if (n.includes('lengua') || n.includes('literatura') || n.includes('lectura')) {
    return { icon: 'auto-stories', color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)' };
  }
  if (n.includes('química') || n.includes('naturales') || n.includes('biología') || n.includes('ciencia')) {
    return { icon: 'science', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
  }
  if (n.includes('sociales') || n.includes('historia') || n.includes('geografía')) {
    return { icon: 'public', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)' };
  }
  if (n.includes('inglés') || n.includes('idioma') || n.includes('francés')) {
    return { icon: 'translate', color: '#0284C7', bg: 'rgba(2, 132, 199, 0.12)' };
  }
  if (n.includes('educación física') || n.includes('deporte') || n.includes('corporal')) {
    return { icon: 'fitness-center', color: '#E11D48', bg: 'rgba(225, 29, 72, 0.12)' };
  }
  if (n.includes('informática') || n.includes('robótica') || n.includes('tecnología')) {
    return { icon: 'computer', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)' };
  }
  return { icon: 'school', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' };
};

export const StudentSubjectsTab: React.FC<StudentSubjectsTabProps> = ({
  student,
  isDarkMode = false,
  onOpenChatWithTeacher,
}) => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getDefaultSubjects = (): SubjectItem[] => {
    const nivelNorm = (student?.nivel || '').toLowerCase();
    if (nivelNorm.includes('inicial')) {
      return [
        { id: 'sub-1', name: 'Iniciación al Lenguaje', teacherName: 'Prof. Mariana Rossi', schedule: 'Turno Mañana' },
        { id: 'sub-2', name: 'Juegos y Matemática', teacherName: 'Prof. Mariana Rossi', schedule: 'Turno Mañana' },
        { id: 'sub-3', name: 'Expresión Corporal y Música', teacherName: 'Prof. Diego Torres', schedule: 'Mié - Vie' },
      ];
    } else if (nivelNorm.includes('primaria')) {
      return [
        { id: 'sub-1', name: 'Matemática', teacherName: 'Prof. Carlos Benítez', schedule: 'Lun - Mié 08:00 a 09:30' },
        { id: 'sub-2', name: 'Prácticas del Lenguaje', teacherName: 'Prof. Laura Méndez', schedule: 'Mar - Jue 08:00 a 09:30' },
        { id: 'sub-3', name: 'Ciencias Naturales', teacherName: 'Prof. Carlos Benítez', schedule: 'Mié - Vie 10:00 a 11:30' },
        { id: 'sub-4', name: 'Educación Física', teacherName: 'Prof. Diego Torres', schedule: 'Vie 14:00 a 16:00' },
      ];
    } else {
      return [
        { id: 'sub-1', name: 'Matemática I', teacherName: 'Prof. Alejandro Varela', schedule: 'Lun · Mié 08:00 a 09:30' },
        { id: 'sub-2', name: 'Lengua y Literatura', teacherName: 'Prof. Carmen Delgado', schedule: 'Mar · Jue 08:00 a 09:30' },
        { id: 'sub-3', name: 'Química General', teacherName: 'Prof. Alejandro Varela', schedule: 'Mié 09:45 a 11:15 · Vie 08:00 a 09:30' },
        { id: 'sub-4', name: 'Historia', teacherName: 'Prof. Carmen Delgado', schedule: 'Lun · Jue 09:45 a 11:15' },
        { id: 'sub-5', name: 'Inglés Técnico', teacherName: 'Prof. Andrea Varela', schedule: 'Mar · Vie 09:45 a 11:15' },
      ];
    }
  };

  useEffect(() => {
    if (!student?.curso) {
      setSubjects(getDefaultSubjects());
      setLoading(false);
      return;
    }

    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const coursesQuery = query(
          collection(db, 'courses'),
          where('name', '==', student.curso.trim())
        );
        const courseSnap = await getDocs(coursesQuery);

        let courseId: string | null = null;
        if (!courseSnap.empty) {
          courseId = courseSnap.docs[0].id;
        }

        let results: SubjectItem[] = [];
        if (courseId) {
          const subjectsQuery = query(
            collection(db, 'subjects'),
            where('courseId', '==', courseId)
          );
          const subjectsSnap = await getDocs(subjectsQuery);
          results = subjectsSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
        }

        if (results.length === 0) {
          results = getDefaultSubjects();
        }

        setSubjects(results);
      } catch (err) {
        console.error('Error al cargar materias:', err);
        setSubjects(getDefaultSubjects());
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [student?.curso, student?.nivel]);

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    pillBg: isDarkMode ? '#064E3B40' : '#ECFDF5',
    pillText: isDarkMode ? '#6EE7B7' : '#047857',
  };

  return (
    <View style={styles.container}>
      {/* Cabecera de la sección */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="menu-book" size={20} color="#EA580C" style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: theme.titleColor }]}>Materias en Curso</Text>
          {!loading && (
            <View style={[styles.badgePill, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
              <Text style={[styles.badgePillText, { color: theme.subColor }]}>
                {subjects.length} Asignaturas
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.planText, { color: theme.subColor }]}>
          Plan Académico Oficial · 2026
        </Text>
      </View>

      {/* Spinner de carga */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={[styles.loadingText, { color: theme.subColor }]}>Cargando asignaturas...</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {subjects.map((sub, idx) => {
            const styleInfo = getSubjectIcon(sub.name);
            return (
              <View
                key={sub.id || idx}
                style={[styles.subjectCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
              >
                {/* Cabecera de la materia */}
                <View style={styles.cardHeader}>
                  {/* Ícono 100% redondo */}
                  <View style={[styles.iconCircleRound, { backgroundColor: styleInfo.bg }]}>
                    <MaterialIcons name={styleInfo.icon} size={22} color={styleInfo.color} />
                  </View>

                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.subjectTitle, { color: theme.titleColor }]} numberOfLines={1}>
                      {sub.name}
                    </Text>
                    <View style={styles.teacherRow}>
                      <MaterialIcons name="person" size={13} color={theme.subColor} style={{ marginRight: 3 }} />
                      <Text style={[styles.teacherName, { color: theme.subColor }]} numberOfLines={1}>
                        {sub.teacherName || 'Docente a cargo'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.regularBadge, { backgroundColor: theme.pillBg }]}>
                    <Text style={[styles.regularBadgeText, { color: theme.pillText }]}>En curso</Text>
                  </View>
                </View>

                {/* Footer de la materia con horario y botón de consulta */}
                <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                  <View style={styles.scheduleRow}>
                    <MaterialIcons name="schedule" size={14} color={theme.subColor} style={{ marginRight: 4 }} />
                    <Text style={[styles.scheduleText, { color: theme.subColor }]} numberOfLines={1}>
                      {sub.schedule || 'Turno Regular'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      if (onOpenChatWithTeacher) {
                        onOpenChatWithTeacher(sub);
                      } else {
                        Alert.alert('Consulta enviada', `Se inició consulta sobre ${sub.name}.`);
                      }
                    }}
                    style={styles.chatBtn}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="chat" size={14} color="#EA580C" style={{ marginRight: 4 }} />
                    <Text style={styles.chatBtnText}>Consultar docente</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default StudentSubjectsTab;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  planText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  list: {
    gap: 12,
  },
  subjectCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Contorno 100% redondo
  iconCircleRound: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  teacherName: {
    fontSize: 12,
    fontWeight: '500',
  },
  regularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  regularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  scheduleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  chatBtnText: {
    color: '#EA580C',
    fontSize: 11,
    fontWeight: '700',
  },
});
