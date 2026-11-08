import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ReportTypePicker, { ReportType } from '../../molecules/ReportTypePicker';
import StudentIndividualReport from './reports/StudentIndividualReport';
import TeacherIndividualReport from './reports/TeacherIndividualReport';
import GroupedListReport, { GroupedRow } from './reports/GroupedListReport';
import Badge from '../../atoms/Badge';
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

  const getTeacherName = (tId?: string) => {
    if (!tId) return 'Sin asignar';
    const t = teachers.find((x) => x.id === tId);
    return t ? t.nombre : 'Profesor Eliminado';
  };

  const validStudents = students.filter((s) => s.status !== 'pendiente');

  // ── REPORTES DE LA FASE 2: LISTADOS AGRUPADOS ──

  // 3. Alumnos por Curso / Nivel
  const getCourseReport = () => {
    const levelOrder: Record<string, number> = { inicial: 1, primaria: 2, secundaria: 3 };
    const sorted = [...validStudents].sort((a, b) => {
      const ordA = levelOrder[(a.nivel || '').toLowerCase()] || 99;
      const ordB = levelOrder[(b.nivel || '').toLowerCase()] || 99;
      if (ordA !== ordB) return ordA - ordB;
      return (a.nombre || '').localeCompare(b.nombre || '');
    });

    const rows: GroupedRow[] = sorted.map((s) => ({
      id: s.id,
      cells: [
        s.nombre,
        s.dni || '-',
        s.studentID_login || `EST-2026-${s.id.slice(0, 4)}`,
        <Badge key="lvl" type="nivel" value={s.nivel} isDarkMode={isDarkMode} />,
      ],
    }));

    return (
      <GroupedListReport
        title="Alumnos por Curso/Nivel"
        columns={['ALUMNO', 'DNI', 'LEGAJO', 'NIVEL']}
        rows={rows}
        isDarkMode={isDarkMode}
      />
    );
  };

  // 4. Alumnos por Materia
  const getSubjectReport = () => {
    const rows: GroupedRow[] = [];
    validStudents.forEach((s) => {
      subjects.forEach((sub) => {
        const c = courses.find((x) => x.id === sub.courseId);
        if (c && (c.name === s.curso || c.id === s.curso)) {
          rows.push({
            id: `${s.id}-${sub.id}`,
            cells: [
              s.nombre,
              <Badge key="lvl" type="nivel" value={s.nivel} isDarkMode={isDarkMode} />,
              <Text key="sub" style={{ color: '#2563EB', fontWeight: '700', fontSize: 13 }}>
                {sub.name}
              </Text>,
              getTeacherName(sub.teacherId),
            ],
          });
        }
      });
    });

    // Ordenar alfabéticamente por materia y luego por alumno
    rows.sort((a, b) => {
      const nameA = (a.cells[2] as any).props.children || '';
      const nameB = (b.cells[2] as any).props.children || '';
      return nameA.localeCompare(nameB);
    });

    return (
      <GroupedListReport
        title="Alumnos por Materia"
        columns={['ALUMNO', 'NIVEL', 'MATERIA', 'PROFESOR A CARGO']}
        rows={rows}
        isDarkMode={isDarkMode}
      />
    );
  };

  // 5. Docentes por Nivel Educativo
  const getTeacherLevelReport = () => {
    const rows: GroupedRow[] = teachers.map((t) => {
      const tSubs = subjects.filter((s) => s.teacherId === t.id);
      const levels = new Set(
        tSubs
          .map((s) => courses.find((c) => c.id === s.courseId)?.level)
          .filter(Boolean)
      );

      const levelStr =
        levels.size === 0
          ? 'SIN ASIGNACIÓN / DEPORTES'
          : Array.from(levels)
              .map((l) => l.toUpperCase())
              .join(', ');

      return {
        id: t.id,
        cells: [
          t.nombre,
          t.email || `${t.nombre.toLowerCase().replace(/\s+/g, '.')}@educore.com`,
          levelStr,
          <View key="badge" style={[styles.cargaPill, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
            <Text style={[styles.cargaPillText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
              {tSubs.length} materias
            </Text>
          </View>,
        ],
      };
    });

    return (
      <GroupedListReport
        title="Docentes por Nivel Educativo"
        columns={['DOCENTE', 'EMAIL', 'NIVELES ASIGNADOS', 'CARGA']}
        rows={rows}
        isDarkMode={isDarkMode}
      />
    );
  };

  // 6. Alumnos por Deporte
  const getSportReport = () => {
    const rows: GroupedRow[] = [];
    validStudents
      .filter((s) => Array.isArray(s.deportes) && s.deportes.length > 0)
      .forEach((s) => {
        s.deportes.forEach((sportId: string) => {
          const sp = sports.find((x) => x.id === sportId || x.name === sportId);
          const sportName = sp ? sp.name : sportId;
          rows.push({
            id: `${s.id}-${sportId}`,
            cells: [
              <Text key="sp" style={{ color: '#059669', fontWeight: '700', fontSize: 13 }}>
                {sportName}
              </Text>,
              <Badge key="lvl" type="nivel" value={s.nivel} isDarkMode={isDarkMode} />,
              s.nombre,
            ],
          });
        });
      });

    rows.sort((a, b) => {
      const spA = (a.cells[0] as any).props.children || '';
      const spB = (b.cells[0] as any).props.children || '';
      return spA.localeCompare(spB);
    });

    return (
      <GroupedListReport
        title="Alumnos por Deporte"
        columns={['DEPORTE', 'NIVEL', 'ALUMNO']}
        rows={rows}
        isDarkMode={isDarkMode}
      />
    );
  };

  // 7. Alumnos por Transporte
  const getTransportReport = () => {
    const rows: GroupedRow[] = [];
    validStudents
      .filter((s) => {
        const t = s.transportRouteId || s.transporte_recorrido;
        return (
          t &&
          t !== 'none' &&
          t !== 'Sin servicio' &&
          t !== 'No utiliza transporte'
        );
      })
      .forEach((s) => {
        const routeVal = s.transportRouteId || s.transporte_recorrido;
        const routeObj = routes.find((r) => r.id === routeVal || r.name === routeVal);
        const routeName = routeObj ? routeObj.name : (routeVal || 'Sin asignar');

        rows.push({
          id: s.id,
          cells: [
            <Text
              key="rt"
              style={{
                color: '#EA580C',
                fontWeight: '700',
                fontSize: 13,
              }}
            >
              {routeName}
            </Text>,
            s.nombre,
            <Badge key="lvl" type="nivel" value={s.nivel} isDarkMode={isDarkMode} />,
          ],
        });
      });

    rows.sort((a, b) => {
      const rA = (a.cells[0] as any).props.children || '';
      const rB = (b.cells[0] as any).props.children || '';
      return rA.localeCompare(rB);
    });

    return (
      <GroupedListReport
        title="Alumnos por Recorrido de Transporte"
        columns={['RECORRIDO', 'ALUMNO PASAJERO', 'NIVEL EDUCATIVO']}
        rows={rows}
        isDarkMode={isDarkMode}
      />
    );
  };

  const theme = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
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

      {/* Contenido del Reporte Activo */}
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

          {reportType === 'course' && getCourseReport()}
          {reportType === 'subject' && getSubjectReport()}
          {reportType === 'teacher_level' && getTeacherLevelReport()}
          {reportType === 'sport' && getSportReport()}
          {reportType === 'transport' && getTransportReport()}

          {reportType === 'financial' && (
            <EmptyState
              icon="payments"
              title="Reporte Financiero (Fase 3)"
              subtitle="El panel de estado de cobranzas y morosidad estará disponible en la siguiente etapa."
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
  cargaPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cargaPillText: {
    fontSize: 11,
    fontWeight: '700',
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
