import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TeacherCourseSubject } from '../../../services/teacherService';

interface StudentRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: TeacherCourseSubject | null;
  onTakeAttendance?: (subjectId: string) => void;
  isDarkMode?: boolean;
}

export const StudentRosterModal: React.FC<StudentRosterModalProps> = ({
  isOpen,
  onClose,
  subject,
  onTakeAttendance,
  isDarkMode = true,
}) => {
  if (!isOpen || !subject) return null;

  const students = subject.students || [];

  const theme = {
    modalBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    bodyBg: isDarkMode ? '#0B1120' : '#F8FAFC',
    subHeaderBg: isDarkMode ? '#0A0F1D' : '#F1F5F9',
    cardBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    avatarBg: isDarkMode ? '#1E293B' : '#E2E8F0',
    avatarText: isDarkMode ? '#F8FAFC' : '#0F172A',
    rowBorder: isDarkMode ? '#172236' : '#EEF2F6',
  };

  const getInitials = (name: string) => {
    const parts = (name || 'Al').trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.modalBg, borderColor: theme.cardBorder }]}>
          {/* ── CABECERA NARANJA OFICIAL ── */}
          <View style={styles.headerOrange}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <MaterialIcons name="groups" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.headerTextCol}>
                <Text style={styles.levelCourseBadge}>
                  {(subject.nivel || 'GENERAL').toUpperCase()} · {subject.curso.toUpperCase()}
                </Text>
                <Text style={styles.subjectTitle} numberOfLines={1}>
                  {subject.name}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* ── SUBHEADER: DÍAS/HORARIOS Y TOTAL MATRICULADOS ── */}
          <View style={[styles.subHeaderBar, { backgroundColor: theme.subHeaderBg, borderBottomColor: theme.cardBorder }]}>
            <View style={styles.scheduleRow}>
              <MaterialIcons name="schedule" size={15} color="#EA580C" style={{ marginRight: 6 }} />
              <Text style={[styles.scheduleText, { color: theme.subColor }]} numberOfLines={1}>
                {subject.schedule || 'Horario institucional coordinado'}
              </Text>
            </View>
            <Text style={[styles.enrolledCount, { color: theme.titleColor }]}>
              {students.length} alumnos matriculados
            </Text>
          </View>

          {/* ── LISTADO DE ALUMNOS DE LA NÓMINA ── */}
          <ScrollView
            style={[styles.studentsListScroll, { backgroundColor: theme.bodyBg }]}
            contentContainerStyle={styles.studentsListContent}
            showsVerticalScrollIndicator={false}
          >
            {students.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="person-off" size={40} color={theme.subColor} />
                <Text style={[styles.emptyText, { color: theme.subColor }]}>
                  No hay alumnos asignados a este curso todavía.
                </Text>
              </View>
            ) : (
              students.map((st, index) => {
                const initials = getInitials(st.name || st.nombre || 'Alumno');
                const isLast = index === students.length - 1;

                return (
                  <View
                    key={st.id || index}
                    style={[
                      styles.studentRow,
                      { borderBottomColor: theme.rowBorder },
                      isLast && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View style={styles.studentLeftInfo}>
                      <View style={[styles.avatarCircle, { backgroundColor: theme.avatarBg }]}>
                        <Text style={[styles.avatarInitials, { color: theme.avatarText }]}>
                          {initials}
                        </Text>
                      </View>
                      <View style={styles.studentNameCol}>
                        <Text style={[styles.studentName, { color: theme.titleColor }]}>
                          {st.name || st.nombre}
                        </Text>
                        <View style={styles.studentMetaRow}>
                          <Text style={[styles.metaLabel, { color: theme.subColor }]}>
                            DNI: <Text style={{ color: theme.titleColor, fontWeight: '700' }}>{st.dni || 'Sin DNI'}</Text>
                          </Text>
                          <Text style={[styles.metaDot, { color: theme.subColor }]}>·</Text>
                          <Text style={[styles.metaLabel, { color: theme.subColor }]}>
                            Legajo: <Text style={{ color: theme.titleColor, fontWeight: '700' }}>{st.legajo || st.studentID_login || st.id}</Text>
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>activo</Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* ── FOOTER DEL MODAL CON BOTONES DE ACCIÓN ── */}
          <View style={[styles.modalFooter, { backgroundColor: theme.subHeaderBg, borderTopColor: theme.cardBorder }]}>
            <TouchableOpacity
              style={[styles.closeModalBtn, { borderColor: theme.cardBorder }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.closeModalBtnText, { color: theme.titleColor }]}>
                Cerrar Nómina
              </Text>
            </TouchableOpacity>

            {onTakeAttendance && (
              <TouchableOpacity
                style={styles.takeAttendanceBtn}
                onPress={() => {
                  onClose();
                  onTakeAttendance(subject.id);
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="how-to-reg" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.takeAttendanceBtnText}>
                  Tomar Asistencia de esta Materia
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StudentRosterModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  // ── CABECERA NARANJA ──
  headerOrange: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  levelCourseBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FED7AA',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  // ── SUBHEADER ──
  subHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 180,
  },
  scheduleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  enrolledCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  // ── LISTADO DE ALUMNOS ──
  studentsListScroll: {
    maxHeight: 380,
  },
  studentsListContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  studentLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '800',
  },
  studentNameCol: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  studentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
  },
  metaDot: {
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  // ── FOOTER ──
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  closeModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  closeModalBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  takeAttendanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  takeAttendanceBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
