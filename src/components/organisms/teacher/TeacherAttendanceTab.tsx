import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  TeacherCourseSubject,
  TeacherStudentItem,
  AttendanceStatus,
  AttendanceRecord,
  saveTeacherAttendance,
} from '../../../services/teacherService';

interface TeacherAttendanceTabProps {
  subjects: TeacherCourseSubject[];
  selectedSubjectId?: string;
  isDarkMode?: boolean;
}

export const TeacherAttendanceTab: React.FC<TeacherAttendanceTabProps> = ({
  subjects,
  selectedSubjectId,
  isDarkMode = true,
}) => {
  const [currentSubjectId, setCurrentSubjectId] = useState<string>(
    selectedSubjectId || subjects[0]?.id || 'sub-his-1'
  );
  const [selectorModalVisible, setSelectorModalVisible] = useState(false);
  const [classDate, setClassDate] = useState('09/11/2026');

  // Asistencia por alumno: { [studentId]: 'P' | 'T' | 'AJ' | 'AI' | null }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus | null>>({});
  // Observaciones por alumno: { [studentId]: string }
  const [observationsMap, setObservationsMap] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Materia activa actual
  const currentSubject = subjects.find(s => s.id === currentSubjectId) || subjects[0];
  const students = currentSubject?.students || [];

  // Actualizar si cambia la prop selectedSubjectId
  useEffect(() => {
    if (selectedSubjectId && selectedSubjectId !== currentSubjectId) {
      setCurrentSubjectId(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  // Reset de estados al cambiar de curso
  useEffect(() => {
    setAttendanceMap({});
    setObservationsMap({});
    setSaveSuccess(false);
  }, [currentSubjectId]);

  // Contar cuántos están marcados
  const markedCount = students.filter(st => attendanceMap[st.id] !== undefined && attendanceMap[st.id] !== null).length;
  const totalStudents = students.length;
  const remaining = totalStudents - markedCount;
  const isAllMarked = totalStudents > 0 && markedCount === totalStudents;

  // Acción: Marcar a todos presentes
  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach(st => {
      updated[st.id] = 'P';
    });
    setAttendanceMap(updated);
  };

  // Acción: Desmarcar todos
  const handleResetAll = () => {
    setAttendanceMap({});
    setSaveSuccess(false);
  };

  // Acción: Marcar estado de un alumno
  const handleSelectStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }));
  };

  // Acción: Cambiar observación
  const handleObservationChange = (studentId: string, text: string) => {
    setObservationsMap(prev => ({
      ...prev,
      [studentId]: text,
    }));
  };

  // Guardar asistencia del día
  const handleSaveAttendance = async () => {
    if (!isAllMarked) {
      Alert.alert(
        'Asistencia incompleta',
        `Debes marcar a todos los alumnos antes de guardar (faltan ${remaining} por registrar).`
      );
      return;
    }

    setIsSaving(true);
    const records: AttendanceRecord[] = students.map(st => ({
      studentId: st.id,
      studentName: st.name,
      legajo: st.legajo,
      status: attendanceMap[st.id] || 'P',
      observation: observationsMap[st.id] || '',
    }));

    const ok = await saveTeacherAttendance(currentSubject.id, classDate, records);
    setIsSaving(false);

    if (ok) {
      setSaveSuccess(true);
      Alert.alert(
        '¡Asistencia Guardada!',
        `Se registró la asistencia de ${totalStudents} alumnos para ${currentSubject.name} correspondiente al ${classDate}.`,
        [{ text: 'Aceptar' }]
      );
    }
  };

  const theme = {
    bg: isDarkMode ? '#0A0F1D' : '#F8FAFC',
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    headerBg: isDarkMode ? '#131D31' : '#F1F5F9',
    rowBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    rowAltBg: isDarkMode ? '#0B132B' : '#F8FAFC',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    borderSubtle: isDarkMode ? '#172236' : '#EEF2F6',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    inputBg: isDarkMode ? '#0B1220' : '#F1F5F9',
    inputText: isDarkMode ? '#F8FAFC' : '#0F172A',
  };

  return (
    <View style={styles.container}>
      {/* ── CARD SELECTORA SUPERIOR (MATERIA, FECHA Y ACCIONES RÁPIDAS) ── */}
      <View style={[styles.filterCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.filterTopRow}>
          {/* Selector de Materia / Curso */}
          <View style={styles.selectorFieldContainer}>
            <Text style={styles.fieldLabel}>SELECCIONAR MATERIA / CURSO</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
              onPress={() => setSelectorModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dropdownButtonText, { color: theme.titleColor }]} numberOfLines={1}>
                {currentSubject?.name} - {currentSubject?.curso} ({currentSubject?.nivel.toLowerCase()})
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Selector de Fecha */}
          <View style={styles.dateFieldContainer}>
            <Text style={styles.fieldLabel}>FECHA DE LA CLASE</Text>
            <View style={[styles.dateInputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <Text style={[styles.dateText, { color: theme.titleColor }]}>{classDate}</Text>
              <MaterialIcons name="calendar-today" size={16} color="#94A3B8" />
            </View>
          </View>
        </View>

        {/* Botones de acción rápida: Todos Presentes y Desmarcar Todos */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllPresent}
            activeOpacity={0.8}
          >
            <MaterialIcons name="check" size={18} color="#FFFFFF" />
            <Text style={styles.markAllButtonText}>Todos Presentes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetButton, { borderColor: theme.border }]}
            onPress={handleResetAll}
            activeOpacity={0.8}
          >
            <MaterialIcons name="replay" size={16} color="#94A3B8" />
            <Text style={[styles.resetButtonText, { color: theme.subColor }]}>Desmarcar Todos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── ENCABEZADO DE LA ASIGNATURA ACTUAL ── */}
      <View style={styles.subjectHeader}>
        <View style={styles.subjectHeaderLeft}>
          <Text style={styles.levelBadge}>
            {currentSubject?.nivel.toUpperCase()} · {currentSubject?.curso.toUpperCase()}
          </Text>
          <Text style={[styles.subjectTitle, { color: theme.titleColor }]}>
            {currentSubject?.name}
          </Text>
        </View>
        <View style={styles.subjectHeaderRight}>
          <MaterialIcons name="people" size={18} color="#94A3B8" />
          <Text style={[styles.studentCountText, { color: theme.subColor }]}>
            {totalStudents} alumnos en nómina
          </Text>
        </View>
      </View>

      {/* ── TABLA / LISTA DE ASISTENCIA CON SCROLL HORIZONTAL ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.horizontalScrollContainer}
      >
        <View style={[styles.tableContainer, { borderColor: theme.border }]}>
          {/* Header de la Tabla */}
          <View style={[styles.tableHeaderRow, { backgroundColor: theme.headerBg, borderColor: theme.border }]}>
            <Text style={[styles.colHeader, styles.colAlumno, { color: theme.subColor }]}>ALUMNO</Text>
            <Text style={[styles.colHeader, styles.colLegajo, { color: theme.subColor }]}>LEGAJO</Text>
            <Text style={[styles.colHeader, styles.colAsistencia, { color: theme.subColor }]}>ASISTENCIA ACUM.</Text>
            <Text style={[styles.colHeader, styles.colEstado, { color: theme.subColor }]}>ESTADO DE HOY</Text>
            <Text style={[styles.colHeader, styles.colObservacion, { color: theme.subColor }]}>OBSERVACIÓN RÁPIDA</Text>
          </View>

          {/* Filas de Alumnos */}
          {students.map((student, index) => {
            const currentStatus = attendanceMap[student.id];
            const initials = student.name
              .split(' ')
              .map(w => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            const isAlt = index % 2 === 1;
            const rowBg = isAlt ? theme.rowAltBg : theme.rowBg;

            return (
              <View
                key={student.id}
                style={[
                  styles.tableRow,
                  { backgroundColor: rowBg, borderBottomColor: theme.borderSubtle },
                ]}
              >
                {/* 1. Alumno info */}
                <View style={[styles.cell, styles.colAlumno]}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                  <View style={styles.studentInfoWrapper}>
                    <Text style={[styles.studentName, { color: theme.titleColor }]}>
                      {student.name}
                    </Text>
                    <Text style={[styles.studentTutor, { color: theme.subColor }]} numberOfLines={1}>
                      Tutor: {student.tutorInfo || student.emailPadre || 'Registrado'}
                    </Text>
                  </View>
                </View>

                {/* 2. Legajo */}
                <View style={[styles.cell, styles.colLegajo]}>
                  <Text style={[styles.legajoText, { color: theme.titleColor }]}>
                    {student.legajo}
                  </Text>
                </View>

                {/* 3. Asistencia Acumulada */}
                <View style={[styles.cell, styles.colAsistencia]}>
                  <View style={styles.asistenciaHeaderRow}>
                    <Text style={[styles.asistenciaPercent, { color: theme.titleColor }]}>
                      {student.asistenciaAcum || '85%'}
                    </Text>
                    <Text style={[styles.asistenciaRatio, { color: theme.subColor }]}>
                      {student.asistenciaRatio || '4/4'}
                    </Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(
                            100,
                            parseInt((student.asistenciaAcum || '85').replace('%', ''), 10)
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* 4. Estado de Hoy: P, T, AJ, AI */}
                <View style={[styles.cell, styles.colEstado]}>
                  <View style={styles.statusButtonsGroup}>
                    {/* Botón Presente (P) */}
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        currentStatus === 'P'
                          ? styles.statusBtnP_active
                          : [styles.statusBtnInactive, { borderColor: theme.border }],
                      ]}
                      onPress={() => handleSelectStatus(student.id, 'P')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          currentStatus === 'P' ? styles.statusBtnP_text : { color: theme.subColor },
                        ]}
                      >
                        P
                      </Text>
                    </TouchableOpacity>

                    {/* Botón Tarde (T) */}
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        currentStatus === 'T'
                          ? styles.statusBtnT_active
                          : [styles.statusBtnInactive, { borderColor: theme.border }],
                      ]}
                      onPress={() => handleSelectStatus(student.id, 'T')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          currentStatus === 'T' ? styles.statusBtnT_text : { color: theme.subColor },
                        ]}
                      >
                        T
                      </Text>
                    </TouchableOpacity>

                    {/* Botón Ausente Justificado (AJ) */}
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        currentStatus === 'AJ'
                          ? styles.statusBtnAJ_active
                          : [styles.statusBtnInactive, { borderColor: theme.border }],
                      ]}
                      onPress={() => handleSelectStatus(student.id, 'AJ')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          currentStatus === 'AJ' ? styles.statusBtnAJ_text : { color: theme.subColor },
                        ]}
                      >
                        AJ
                      </Text>
                    </TouchableOpacity>

                    {/* Botón Ausente Injustificado (AI) */}
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        currentStatus === 'AI'
                          ? styles.statusBtnAI_active
                          : [styles.statusBtnInactive, { borderColor: theme.border }],
                      ]}
                      onPress={() => handleSelectStatus(student.id, 'AI')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          currentStatus === 'AI' ? styles.statusBtnAI_text : { color: theme.subColor },
                        ]}
                      >
                        AI
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 5. Observación Rápida */}
                <View style={[styles.cell, styles.colObservacion]}>
                  <TextInput
                    style={[
                      styles.obsInput,
                      {
                        backgroundColor: theme.inputBg,
                        color: theme.inputText,
                        borderColor: theme.border,
                      },
                    ]}
                    placeholder="Añadir nota del día..."
                    placeholderTextColor="#64748B"
                    value={observationsMap[student.id] || ''}
                    onChangeText={txt => handleObservationChange(student.id, txt)}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ── BARRA INFERIOR DE PROGRESO Y BOTÓN GUARDAR ── */}
      <View style={[styles.bottomBarCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.progressInfoContainer}>
          <View style={styles.progressBulletRow}>
            <View
              style={[
                styles.progressDot,
                { backgroundColor: isAllMarked ? '#10B981' : '#F97316' },
              ]}
            />
            <Text style={[styles.progressTitle, { color: isAllMarked ? '#10B981' : '#F97316' }]}>
              Progreso: {markedCount} de {totalStudents} alumnos marcados{' '}
              {!isAllMarked && `(faltan ${remaining})`}
            </Text>
          </View>
          <Text style={[styles.progressHelper, { color: theme.subColor }]}>
            {isAllMarked
              ? 'Todos los alumnos fueron marcados. Listo para registrar.'
              : 'Debes marcar a todos los alumnos para habilitar el guardado.'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            isAllMarked ? styles.saveButtonActive : styles.saveButtonDisabled,
          ]}
          onPress={handleSaveAttendance}
          disabled={!isAllMarked || isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <Text style={styles.saveButtonText}>Guardando...</Text>
          ) : (
            <>
              <MaterialIcons
                name="save"
                size={18}
                color={isAllMarked ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.saveButtonText,
                  { color: isAllMarked ? '#FFFFFF' : '#64748B' },
                ]}
              >
                Guardar Asistencia del Día
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── MODAL: SELECTOR DE MATERIA Y CURSO ── */}
      <Modal
        visible={selectorModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectorModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectorModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.titleColor }]}>
              Seleccionar Materia / Curso
            </Text>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {subjects.map(sub => {
                const isSelected = sub.id === currentSubjectId;
                return (
                  <TouchableOpacity
                    key={sub.id}
                    style={[
                      styles.modalItem,
                      { borderColor: theme.borderSubtle },
                      isSelected && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setCurrentSubjectId(sub.id);
                      setSelectorModalVisible(false);
                    }}
                  >
                    <View style={styles.modalItemLeft}>
                      <Text
                        style={[
                          styles.modalItemName,
                          { color: isSelected ? '#F97316' : theme.titleColor },
                        ]}
                      >
                        {sub.name}
                      </Text>
                      <Text style={[styles.modalItemMeta, { color: theme.subColor }]}>
                        {sub.nivel} · {sub.curso} · {sub.studentsCount} alumnos
                      </Text>
                    </View>
                    {isSelected && <MaterialIcons name="check-circle" size={20} color="#F97316" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingBottom: 28,
  },
  // ── FILTRO SUPERIOR ──
  filterCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  filterTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  selectorFieldContainer: {
    flex: 2,
    minWidth: 220,
  },
  dateFieldContainer: {
    flex: 1,
    minWidth: 130,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  dropdownButtonText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  markAllButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // ── ENCABEZADO DE ASIGNATURA ──
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectHeaderLeft: {
    flex: 1,
  },
  levelBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F97316',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subjectHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 4,
  },
  studentCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // ── TABLA CON SCROLL HORIZONTAL ──
  horizontalScroll: {
    borderRadius: 14,
    marginBottom: 20,
  },
  horizontalScrollContainer: {
    minWidth: 800,
  },
  tableContainer: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  colAlumno: {
    width: 260,
  },
  colLegajo: {
    width: 120,
  },
  colAsistencia: {
    width: 130,
  },
  colEstado: {
    width: 170,
  },
  colObservacion: {
    width: 200,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cell: {
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3B2319',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitials: {
    color: '#F97316',
    fontSize: 13,
    fontWeight: '800',
  },
  studentInfoWrapper: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  studentTutor: {
    fontSize: 11,
  },
  legajoText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  asistenciaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingRight: 16,
  },
  asistenciaPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  asistenciaRatio: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
    width: '90%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 3,
  },
  statusButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnInactive: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
  },
  statusBtnP_active: {
    backgroundColor: '#10B981',
  },
  statusBtnT_active: {
    backgroundColor: '#F59E0B',
  },
  statusBtnAJ_active: {
    backgroundColor: '#3B82F6',
  },
  statusBtnAI_active: {
    backgroundColor: '#EF4444',
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusBtnP_text: {
    color: '#FFFFFF',
  },
  statusBtnT_text: {
    color: '#FFFFFF',
  },
  statusBtnAJ_text: {
    color: '#FFFFFF',
  },
  statusBtnAI_text: {
    color: '#FFFFFF',
  },
  obsInput: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    width: '95%',
  },
  // ── BARRA INFERIOR ──
  bottomBarCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 14,
  },
  progressInfoContainer: {
    flex: 1,
    minWidth: 220,
  },
  progressBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressHelper: {
    fontSize: 11,
    paddingLeft: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveButtonActive: {
    backgroundColor: '#F97316',
  },
  saveButtonDisabled: {
    backgroundColor: '#1E293B',
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // ── MODAL SELECTOR ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '75%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },
  modalList: {
    maxHeight: 340,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  modalItemSelected: {
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
    borderRadius: 10,
  },
  modalItemLeft: {
    flex: 1,
    paddingRight: 10,
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  modalItemMeta: {
    fontSize: 12,
  },
});
