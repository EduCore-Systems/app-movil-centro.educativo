import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export interface SubjectItem {
  id: string;
  name: string;
  teacher: string;
  schedule: string;
  status: string;
  condition: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconBg: string;
  iconColor: string;
}

export const DEFAULT_OFFICIAL_SUBJECTS: SubjectItem[] = [
  {
    id: 'mat-1',
    name: 'Matemática I',
    teacher: 'Prof. Alejandro Varela',
    schedule: 'Lun · Mié 08:00 a 09:30',
    status: 'En curso',
    condition: 'Cursada Regular',
    icon: 'calculate',
    iconBg: 'rgba(234, 88, 12, 0.15)',
    iconColor: '#EA580C',
  },
  {
    id: 'len-1',
    name: 'Lengua y Literatura',
    teacher: 'Prof. Carmen Delgado',
    schedule: 'Mar · Jue 08:00 a 09:30',
    status: 'En curso',
    condition: 'Cursada Regular',
    icon: 'menu-book',
    iconBg: 'rgba(217, 119, 6, 0.15)',
    iconColor: '#F59E0B',
  },
  {
    id: 'qui-1',
    name: 'Química General',
    teacher: 'Prof. Alejandro Varela',
    schedule: 'Mié 09:45 a 11:15 · Vie 08:00 a 09:30',
    status: 'En curso',
    condition: 'Cursada Regular',
    icon: 'science',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#10B981',
  },
  {
    id: 'his-1',
    name: 'Historia',
    teacher: 'Prof. Carmen Delgado',
    schedule: 'Lun · Jue 09:45 a 11:15',
    status: 'En curso',
    condition: 'Cursada Regular',
    icon: 'public',
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818CF8',
  },
  {
    id: 'ing-1',
    name: 'Inglés Técnico',
    teacher: 'Prof. Andrea Varela',
    schedule: 'Mar · Vie 09:45 a 11:15',
    status: 'En curso',
    condition: 'Cursada Regular',
    icon: 'translate',
    iconBg: 'rgba(56, 189, 248, 0.15)',
    iconColor: '#38BDF8',
  },
];

interface StudentSubjectsTabProps {
  isDarkMode?: boolean;
}

export const StudentSubjectsTab: React.FC<StudentSubjectsTabProps> = ({
  isDarkMode = true,
}) => {
  const [subjects, setSubjects] = useState<SubjectItem[]>(DEFAULT_OFFICIAL_SUBJECTS);

  useEffect(() => {
    let isMounted = true;
    const fetchSubjects = async () => {
      try {
        const snap = await getDocs(collection(db, 'subjects'));
        if (!snap.empty && isMounted) {
          const fetched: SubjectItem[] = snap.docs.map((doc, idx) => {
            const data = doc.data();
            const fallback = DEFAULT_OFFICIAL_SUBJECTS[idx % DEFAULT_OFFICIAL_SUBJECTS.length];
            return {
              id: doc.id,
              name: data.nombre || data.name || fallback.name,
              teacher: data.docente || data.teacher || fallback.teacher,
              schedule: data.horario || data.schedule || fallback.schedule,
              status: 'En curso',
              condition: 'Cursada Regular',
              icon: fallback.icon,
              iconBg: fallback.iconBg,
              iconColor: fallback.iconColor,
            };
          });
          setSubjects(fetched.slice(0, 5));
        }
      } catch (e) {
        // Fallback a los 5 oficiales si Firestore está restringido
        if (isMounted) setSubjects(DEFAULT_OFFICIAL_SUBJECTS);
      }
    };

    fetchSubjects();
    return () => { isMounted = false; };
  }, []);

  const theme = {
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    divider: isDarkMode ? '#1E293B' : '#F1F5F9',
    countBadgeBg: isDarkMode ? '#1E293B' : '#E2E8F0',
  };

  return (
    <View style={styles.container}>
      {/* ── CABECERA DE LA SECCIÓN ── */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTitleRow}>
          <MaterialIcons name="menu-book" size={22} color="#EA580C" style={{ marginRight: 8 }} />
          <Text style={[styles.sectionTitle, { color: theme.titleColor }]}>
            Materias en Curso
          </Text>
          <View style={[styles.countBadge, { backgroundColor: theme.countBadgeBg }]}>
            <Text style={[styles.countBadgeText, { color: theme.subColor }]}>
              {subjects.length} Asignaturas
            </Text>
          </View>
        </View>

        <Text style={[styles.academicPlanText, { color: theme.subColor }]}>
          Plan Académico Oficial · Ciclo Lectivo 2026
        </Text>
      </View>

      {/* ── LISTADO DE TARJETAS DE MATERIAS ── */}
      <View style={styles.cardsContainer}>
        {subjects.map((item) => (
          <View
            key={item.id}
            style={[
              styles.subjectCard,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
          >
            {/* Fila Superior: Ícono, Nombre, Docente y Badge "En curso" */}
            <View style={styles.cardTopRow}>
              <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                <MaterialIcons name={item.icon} size={22} color={item.iconColor} />
              </View>

              <View style={styles.cardHeaderInfo}>
                <Text style={[styles.subjectName, { color: theme.titleColor }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.teacherRow}>
                  <MaterialIcons name="person" size={14} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={[styles.teacherName, { color: theme.subColor }]} numberOfLines={1}>
                    {item.teacher}
                  </Text>
                </View>
              </View>

              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{item.status}</Text>
              </View>
            </View>

            {/* Fila Inferior: Horario Semanal y Estado de Cursada Regular */}
            <View style={[styles.cardBottomRow, { borderTopColor: theme.divider }]}>
              <View style={styles.scheduleInfo}>
                <MaterialIcons name="schedule" size={14} color="#64748B" style={{ marginRight: 5 }} />
                <Text style={[styles.scheduleText, { color: theme.subColor }]} numberOfLines={1}>
                  {item.schedule}
                </Text>
              </View>

              <View style={styles.regularBadge}>
                <MaterialIcons name="verified" size={14} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={styles.regularBadgeText}>{item.condition}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default StudentSubjectsTab;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  headerContainer: {
    gap: 6,
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginRight: 10,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  academicPlanText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 12,
  },
  subjectCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderInfo: {
    flex: 1,
    gap: 3,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherName: {
    fontSize: 12.5,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusPillText: {
    color: '#10B981',
    fontSize: 11.5,
    fontWeight: '700',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  regularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regularBadgeText: {
    color: '#10B981',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
