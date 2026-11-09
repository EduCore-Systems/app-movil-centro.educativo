import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import EntitySearchPicker, { PickerItem } from '../../../molecules/EntitySearchPicker';

interface TeacherIndividualReportProps {
  teachers: any[];
  courses: any[];
  subjects: any[];
  sports: any[];
  schedules: any[];
  isDarkMode?: boolean;
}

export const TeacherIndividualReport: React.FC<TeacherIndividualReportProps> = ({
  teachers,
  courses,
  subjects,
  sports,
  schedules,
  isDarkMode = false,
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  const pickerItems: PickerItem[] = teachers.map((t) => ({
    id: t.id,
    title: t.nombre,
    subtitle: `Rol: ${t.role || 'Docente'}`,
  }));

  const teacher = teachers.find((t) => t.id === selectedTeacherId);

  const getCourseName = (cId: string) => {
    const c = courses.find((x) => x.id === cId);
    return c ? c.name : 'Curso Asignado';
  };

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    blockBg: isDarkMode ? '#0F172A80' : '#F8FAFC',
    blockBorder: isDarkMode ? '#334155' : '#E2E8F0',
    avatarBg: isDarkMode ? '#4C1D95' : '#F3E8FF',
    avatarText: isDarkMode ? '#C4B5FD' : '#7C3AED',
  };

  // Materias y Deportes a cargo del docente
  const teacherSubjects = subjects.filter((s) => s.teacherId === selectedTeacherId);
  const teacherSports = sports.filter((s) => s.teacherId === selectedTeacherId);

  // Horarios de sus materias y deportes
  const mySchedules = schedules.filter((sch) => {
    if (sch.type === 'subject') return teacherSubjects.some((s) => s.id === sch.referenceId);
    if (sch.type === 'sport') return teacherSports.some((s) => s.id === sch.referenceId);
    return false;
  });

  return (
    <View style={styles.container}>
      {/* Selector de Docente */}
      <EntitySearchPicker
        label="Seleccionar Docente"
        placeholder="-- Buscar Docente --"
        items={pickerItems}
        selectedId={selectedTeacherId}
        onSelectItem={setSelectedTeacherId}
        isDarkMode={isDarkMode}
      />

      {/* Ficha Consolidada */}
      {teacher && (
        <View style={[styles.profileCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          {/* Header del Docente */}
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.avatarBg }]}>
              <Text style={[styles.avatarText, { color: theme.avatarText }]}>
                {teacher.nombre ? teacher.nombre.charAt(0).toUpperCase() : 'D'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.teacherTitle, { color: theme.titleColor }]}>{teacher.nombre}</Text>
              <Text style={[styles.teacherSub, { color: theme.subColor }]}>
                Rol: {teacher.role || 'Docente'}
              </Text>
            </View>
          </View>

          {/* Bloque 1: Cursos y Materias a cargo */}
          <View style={[styles.infoBlock, { backgroundColor: theme.blockBg, borderColor: theme.blockBorder }]}>
            <View style={styles.blockTitleRow}>
              <MaterialIcons name="assignment" size={18} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={[styles.blockTitle, { color: theme.titleColor }]}>
                Cursos y Materias a cargo
              </Text>
            </View>
            {teacherSubjects.length === 0 && teacherSports.length === 0 ? (
              <Text style={[styles.emptyItemText, { color: theme.subColor }]}>
                Ninguna materia o deporte asignado.
              </Text>
            ) : (
              <>
                {teacherSubjects.map((sub) => (
                  <View key={sub.id} style={styles.subjectRow}>
                    <Text style={[styles.subjectName, { color: theme.titleColor }]}>{sub.name}</Text>
                    <Text style={[styles.subjectCourse, { color: theme.subColor }]}>
                      en {getCourseName(sub.courseId)}
                    </Text>
                  </View>
                ))}
                {teacherSports.map((sp) => (
                  <View key={sp.id} style={styles.subjectRow}>
                    <Text style={[styles.subjectName, { color: '#059669' }]}>Deporte: {sp.name}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* Bloque 2: Cronograma (Horarios) */}
          <View style={[styles.infoBlock, { backgroundColor: theme.blockBg, borderColor: theme.blockBorder }]}>
            <View style={styles.blockTitleRow}>
              <MaterialIcons name="schedule" size={18} color="#EA580C" style={{ marginRight: 6 }} />
              <Text style={[styles.blockTitle, { color: theme.titleColor }]}>Cronograma (Horarios)</Text>
            </View>
            {mySchedules.length === 0 ? (
              <Text style={[styles.emptyItemText, { color: theme.subColor }]}>
                Sin horarios registrados.
              </Text>
            ) : (
              mySchedules
                .sort((a, b) => a.dayOfWeek.localeCompare(b.dayOfWeek))
                .map((sch) => (
                  <View key={sch.id} style={styles.scheduleRow}>
                    <Text style={[styles.scheduleDay, { color: theme.titleColor }]}>{sch.dayOfWeek}</Text>
                    <Text style={[styles.scheduleTime, { color: theme.subColor }]}>
                      {sch.startTime} - {sch.endTime} hs
                    </Text>
                  </View>
                ))
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default TeacherIndividualReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#33415520',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  teacherTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  teacherSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  infoBlock: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  blockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#33415515',
  },
  subjectName: {
    fontSize: 13,
    fontWeight: '700',
  },
  subjectCourse: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#33415515',
  },
  scheduleDay: {
    fontSize: 13,
    fontWeight: '700',
  },
  scheduleTime: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyItemText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
