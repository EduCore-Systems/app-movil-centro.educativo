import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import EntitySearchPicker, { PickerItem } from '../../../molecules/EntitySearchPicker';
import Badge from '../../../atoms/Badge';

interface StudentIndividualReportProps {
  students: any[];
  courses: any[];
  subjects: any[];
  sports: any[];
  routes: any[];
  teachers: any[];
  isDarkMode?: boolean;
}

export const StudentIndividualReport: React.FC<StudentIndividualReportProps> = ({
  students,
  courses,
  subjects,
  sports,
  routes,
  teachers,
  isDarkMode = false,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const pickerItems: PickerItem[] = students.map((s) => ({
    id: s.id,
    title: s.nombre,
    subtitle: `DNI: ${s.dni || 'Sin DNI'} • Nivel: ${(s.nivel || '').toUpperCase()}`,
  }));

  const student = students.find((s) => s.id === selectedStudentId);

  // Helpers
  const getTeacherName = (tId: string) => {
    const t = teachers.find((x) => x.id === tId);
    return t ? t.nombre : 'Profesor Asignado';
  };

  const getRouteName = (routeVal: string) => {
    const r = routes.find((x) => x.id === routeVal || x.name === routeVal);
    return r ? r.name : routeVal;
  };

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    blockBg: isDarkMode ? '#0F172A80' : '#F8FAFC',
    blockBorder: isDarkMode ? '#334155' : '#E2E8F0',
    avatarBg: isDarkMode ? '#1E3A8A' : '#EFF6FF',
    avatarText: isDarkMode ? '#93C5FD' : '#2563EB',
  };

  // Filtrar materias asociadas al curso del alumno
  const studentSubjects = subjects.filter((sub) => {
    const c = courses.find((x) => x.id === sub.courseId);
    return c && (c.name === student?.curso || c.id === student?.curso);
  });

  return (
    <View style={styles.container}>
      {/* Selector de Alumno */}
      <EntitySearchPicker
        label="Seleccionar Alumno"
        placeholder="-- Buscar Alumno --"
        items={pickerItems}
        selectedId={selectedStudentId}
        onSelectItem={setSelectedStudentId}
        isDarkMode={isDarkMode}
      />

      {/* Ficha Consolidada */}
      {student && (
        <View style={[styles.profileCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          {/* Header del Alumno */}
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.avatarBg }]}>
              <Text style={[styles.avatarText, { color: theme.avatarText }]}>
                {student.nombre ? student.nombre.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.studentTitle, { color: theme.titleColor }]}>{student.nombre}</Text>
              <Text style={[styles.studentSub, { color: theme.subColor }]}>
                DNI: {student.dni || 'Sin DNI'}
              </Text>
              <View style={{ marginTop: 4 }}>
                <Badge type="nivel" value={student.nivel} isDarkMode={isDarkMode} />
              </View>
            </View>
          </View>

          {/* Bloque 1: Materias del Nivel */}
          <View style={[styles.infoBlock, { backgroundColor: theme.blockBg, borderColor: theme.blockBorder }]}>
            <View style={styles.blockTitleRow}>
              <MaterialIcons name="menu-book" size={18} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={[styles.blockTitle, { color: theme.titleColor }]}>Materias del Nivel</Text>
            </View>
            {studentSubjects.length === 0 ? (
              <Text style={[styles.emptyItemText, { color: theme.subColor }]}>
                {student.curso ? 'Sin materias registradas para su curso.' : 'El alumno no tiene curso asignado aún.'}
              </Text>
            ) : (
              studentSubjects.map((sub) => (
                <View key={sub.id} style={styles.subjectRow}>
                  <Text style={[styles.subjectName, { color: theme.titleColor }]}>{sub.name}</Text>
                  <Text style={[styles.subjectTeacher, { color: theme.subColor }]}>
                    {getTeacherName(sub.teacherId)}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Bloque 2: Actividades / Deportes */}
          <View style={[styles.infoBlock, { backgroundColor: theme.blockBg, borderColor: theme.blockBorder }]}>
            <View style={styles.blockTitleRow}>
              <MaterialIcons name="sports-soccer" size={18} color="#059669" style={{ marginRight: 6 }} />
              <Text style={[styles.blockTitle, { color: theme.titleColor }]}>Actividades / Deportes</Text>
            </View>
            {Array.isArray(student.deportes) && student.deportes.length > 0 ? (
              student.deportes.map((dId: string, idx: number) => {
                const sp = sports.find((s) => s.id === dId || s.name === dId);
                return (
                  <View key={idx} style={styles.sportRow}>
                    <View style={styles.greenDot} />
                    <Text style={[styles.sportName, { color: theme.titleColor }]}>
                      {sp ? sp.name : dId}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={[styles.emptyItemText, { color: theme.subColor }]}>
                Sin inscripción en actividades extracurriculares.
              </Text>
            )}
          </View>

          {/* Bloque 3: Transporte */}
          <View style={[styles.infoBlock, { backgroundColor: theme.blockBg, borderColor: theme.blockBorder }]}>
            <View style={styles.blockTitleRow}>
              <MaterialIcons name="directions-bus" size={18} color="#EA580C" style={{ marginRight: 6 }} />
              <Text style={[styles.blockTitle, { color: theme.titleColor }]}>Transporte</Text>
            </View>
            <Text style={[styles.serviceValue, { color: theme.titleColor }]}>
              {student.transportRouteId || (student.transporte_recorrido && student.transporte_recorrido !== 'none')
                ? getRouteName(student.transportRouteId || student.transporte_recorrido)
                : 'No utiliza transporte'}
            </Text>
          </View>

          {/* Bloque 4: Comedor */}
          <View style={[styles.infoBlock, { backgroundColor: theme.blockBg, borderColor: theme.blockBorder }]}>
            <View style={styles.blockTitleRow}>
              <MaterialIcons name="restaurant" size={18} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={[styles.blockTitle, { color: theme.titleColor }]}>Comedor</Text>
            </View>
            <View style={styles.diningStatusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: student.diningRoomEnabled ? '#10B981' : '#94A3B8' },
                ]}
              />
              <Text style={[styles.serviceValue, { color: theme.titleColor }]}>
                {student.diningRoomEnabled ? 'Habilitado' : 'No Habilitado'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default StudentIndividualReport;

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
  studentTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  studentSub: {
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
  subjectTeacher: {
    fontSize: 12,
    fontWeight: '500',
  },
  sportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginRight: 8,
  },
  sportName: {
    fontSize: 13,
    fontWeight: '700',
  },
  serviceValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  diningStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  emptyItemText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
