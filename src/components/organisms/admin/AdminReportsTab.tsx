import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ReportTypePicker, { ReportType } from '../../molecules/ReportTypePicker';
import StudentIndividualReport from './reports/StudentIndividualReport';
import TeacherIndividualReport from './reports/TeacherIndividualReport';
import EmptyState from '../../molecules/EmptyState';
import { getCourses, getSubjects, getSports, getSchedules, getStaffTeachers } from '../../../services/academicService';
import { getServiceStudents, getTransportRoutes } from '../../../services/additionalServices';

interface AdminReportsTabProps {
  isDarkMode?: boolean;
}

export const AdminReportsTab: React.FC<AdminReportsTabProps> = ({ isDarkMode = false }) => {
  const [reportType, setReportType] = useState<ReportType>('student');
  const [isLoading, setIsLoading] = useState(true);

  // Data State
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stData, cData, subData, spData, schData, rData, tData] = await Promise.all([
        getServiceStudents(),
        getCourses(),
        getSubjects(),
        getSports(),
        getSchedules(),
        getTransportRoutes(),
        getStaffTeachers(),
      ]);

      setStudents(stData);
      setCourses(cData);
      setSubjects(subData);
      setSports(spData);
      setSchedules(schData);
      setRoutes(rData);
      setTeachers(tData);
    } catch (err) {
      console.error('Error al cargar datos del Centro de Reportes:', err);
      Alert.alert('Error', 'No se pudieron cruzar los datos del sistema.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const theme = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    badgeBg: isDarkMode ? '#334155' : '#F1F5F9',
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabecera del Módulo */}
      <View style={styles.moduleHeader}>
        <Text style={[styles.moduleTitle, { color: theme.titleColor }]}>Centro de Reportes</Text>
        <Text style={[styles.moduleSub, { color: theme.subColor }]}>
          Estadísticas pedagógicas, nóminas y reportes financieros.
        </Text>
      </View>

      {/* Card de Configuración y Selector de Reporte */}
      <View style={[styles.selectorCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.selectorHeaderRow}>
          <View style={styles.selectorIconBox}>
            <MaterialIcons name="analytics" size={22} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.selectorTitle, { color: theme.titleColor }]}>Generación de Reportes</Text>
            <Text style={[styles.selectorSub, { color: theme.subColor }]}>
              Seleccioná el tipo de reporte que deseás visualizar
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <ReportTypePicker
            selectedType={reportType}
            onSelectType={setReportType}
            isDarkMode={isDarkMode}
          />
        </View>
      </View>

      {/* Contenido del Reporte */}
      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={[styles.loaderText, { color: theme.subColor }]}>Cruzando datos del sistema...</Text>
        </View>
      ) : (
        <View style={{ marginTop: 16 }}>
          {reportType === 'student' && (
            <StudentIndividualReport
              students={students}
              courses={courses}
              subjects={subjects}
              sports={sports}
              routes={routes}
              teachers={teachers}
              isDarkMode={isDarkMode}
            />
          )}

          {reportType === 'teacher' && (
            <TeacherIndividualReport
              teachers={teachers}
              courses={courses}
              subjects={subjects}
              sports={sports}
              schedules={schedules}
              isDarkMode={isDarkMode}
            />
          )}

          {reportType !== 'student' && reportType !== 'teacher' && (
            <EmptyState
              icon="construction"
              title="Reporte en Preparación (Fase 2 y 3)"
              subtitle="Este reporte agrupado estará disponible en la siguiente etapa."
              isDarkMode={isDarkMode}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default AdminReportsTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  moduleHeader: {
    alignItems: 'center',
    marginVertical: 14,
    paddingHorizontal: 8,
  },
  moduleTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  moduleSub: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  selectorCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 6,
  },
  selectorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  selectorSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  loaderBox: {
    padding: 40,
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
});
