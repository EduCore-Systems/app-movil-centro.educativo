import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FamilyStudent } from '../../../services/familyService';

interface FamilyDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'boletin' | 'certificado';
  student: FamilyStudent | null;
}

const BOLETIN_MATERIAS = [
  { name: 'Historia Argentina y Universal', teacher: 'Prof. Silvina Morales', schedule: 'Mié y Vie 09:30 a 11:00', grade: '8.8', condition: 'Regular' },
  { name: 'Inglés Avanzado', teacher: 'Prof. Sarah Jenkins', schedule: 'Lun y Mié 11:15 a 12:45', grade: '8.8', condition: 'Regular' },
  { name: 'Biología Celular', teacher: 'Prof. Federico Fontana', schedule: 'Mar y Jue 11:15 a 12:45', grade: '8.8', condition: 'Regular' },
  { name: 'Lengua y Literatura', teacher: 'Prof. Carmen Delgado', schedule: 'Mar y Jue 07:45 a 09:15', grade: '8.8', condition: 'Regular' },
  { name: 'Matemática I', teacher: 'Prof. Carlos Benítez', schedule: 'Lun · Mié · Vie 07:45 a 09:15', grade: '8.8', condition: 'Regular' },
  { name: 'Física y Química', teacher: 'Prof. Alejandro Varela', schedule: 'Lun y Jue 09:30 a 11:00', grade: '8.8', condition: 'Regular' },
];

export const FamilyDocumentModal: React.FC<FamilyDocumentModalProps> = ({
  isOpen,
  onClose,
  type,
  student,
}) => {
  if (!isOpen || !student) return null;

  const isBoletin = type === 'boletin';
  const studentName = student.nombre || 'Martina Díaz';
  const studentDni = student.dni || '46777888';
  const studentLegajo = student.studentID_login || 'EST-2026-401';
  const studentCursoNivel = `${student.curso || '1° Año A'} (${student.nivel ? student.nivel.charAt(0).toUpperCase() + student.nivel.slice(1).toLowerCase() : 'Secundaria'})`;

  const handleDownload = () => {
    Alert.alert(
      'Documento Oficial Listo',
      `Se ha preparado la descarga oficial en formato PDF para ${studentName} (Ciclo Lectivo 2026).`
    );
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.containerBox}>
          {/* ── TOPBAR DE CONTROL DEL MODAL ── */}
          <View style={styles.topControlBar}>
            <View style={styles.titleWithIcon}>
              <MaterialIcons
                name={isBoletin ? 'menu-book' : 'verified'}
                size={20}
                color="#EA580C"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.modalHeadingText}>
                {isBoletin ? 'Boletín Oficial de Calificaciones' : 'Constancia de Alumno Regular'}
              </Text>
            </View>

            <View style={styles.actionsRight}>
              <TouchableOpacity
                onPress={handleDownload}
                style={styles.printBtn}
                activeOpacity={0.8}
              >
                <MaterialIcons name="print" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.printBtnText}>Imprimir / Descargar PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── HOJA FORMAL A4 (FONDO BLANCO INSTITUCIONAL) ── */}
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.whiteSheet}>
              {/* Encabezado Membretado Oficial */}
              <View style={styles.letterhead}>
                <View style={styles.letterheadLeft}>
                  <View style={styles.eduLogoBox}>
                    <Text style={styles.eduLogoText}>E</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eduBrandTitle}>CENTRO EDUCATIVO EDUCORE</Text>
                    <Text style={styles.eduBrandSubtitle}>
                      Instituto Incorporado a la Enseñanza Oficial · D.I.E.P. N° 4812
                    </Text>
                    <Text style={styles.eduBrandContact}>
                      Av. Sarmiento 1850 · Resistencia, Chaco · Tel: (0362) 442-8900
                    </Text>
                  </View>
                </View>

                <View style={styles.cycleLectivoBox}>
                  <Text style={styles.cycleLectivoLabel}>CICLO LECTIVO</Text>
                  <Text style={styles.cycleLectivoYear}>2026</Text>
                </View>
              </View>

              <View style={styles.dividerBold} />

              {/* Título Oficial del Documento */}
              <View style={styles.docTitleContainer}>
                <Text style={styles.docTitleText}>
                  {isBoletin
                    ? 'INFORME OFICIAL DE ASIGNATURAS Y CALIFICACIONES'
                    : 'CONSTANCIA DE ALUMNO REGULAR'}
                </Text>
                <View style={styles.titleUnderline} />
              </View>

              {/* Tarjeta de Datos del Estudiante */}
              <View style={styles.studentMetaCard}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>ESTUDIANTE:</Text>
                  <Text style={styles.metaValue}>{studentName}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>DNI / DOCUMENTO:</Text>
                  <Text style={styles.metaValue}>{studentDni}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>LEGAJO INSTITUCIONAL:</Text>
                  <Text style={styles.metaValue}>{studentLegajo}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>CURSO Y NIVEL:</Text>
                  <Text style={styles.metaValue}>{studentCursoNivel}</Text>
                </View>
              </View>

              {/* ── CUERPO: CASO 1 - BOLETÍN DE CALIFICACIONES ── */}
              {isBoletin ? (
                <View style={styles.boletinBody}>
                  <Text style={styles.academicSubtitle}>
                    Rendimiento académico y cursado correspondiente al presente ciclo lectivo:
                  </Text>

                  {/* Tabla de Asignaturas */}
                  <View style={styles.tableBox}>
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.thCell, { flex: 2 }]}>Espacio Curricular</Text>
                      <Text style={[styles.thCell, { flex: 1.8 }]}>Docente a Cargo</Text>
                      <Text style={[styles.thCell, { flex: 1.5, textAlign: 'center' }]}>Horario</Text>
                      <Text style={[styles.thCell, { width: 50, textAlign: 'center' }]}>Calif.</Text>
                      <Text style={[styles.thCell, { width: 65, textAlign: 'center' }]}>Condición</Text>
                    </View>

                    {BOLETIN_MATERIAS.map((mat, i) => (
                      <View key={i} style={[styles.tableDataRow, i % 2 === 1 && styles.tableRowAlt]}>
                        <Text style={[styles.tdCell, { flex: 2, fontWeight: '700', color: '#0F172A' }]}>
                          {mat.name}
                        </Text>
                        <Text style={[styles.tdCell, { flex: 1.8, color: '#475569' }]}>
                          {mat.teacher}
                        </Text>
                        <Text style={[styles.tdCell, { flex: 1.5, textAlign: 'center', fontSize: 10, color: '#64748B' }]}>
                          {mat.schedule}
                        </Text>
                        <Text style={[styles.tdCell, { width: 50, textAlign: 'center', fontWeight: '800', color: '#0F172A' }]}>
                          {mat.grade}
                        </Text>
                        <Text style={[styles.tdCell, { width: 65, textAlign: 'center', fontWeight: '700', color: '#059669' }]}>
                          {mat.condition}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Resumen Final del Boletín */}
                  <View style={styles.summaryBar}>
                    <Text style={styles.summaryItemText}>
                      <Text style={{ fontWeight: '800' }}>Asistencia Oficial:</Text> 96.4% (Óptima)
                    </Text>
                    <Text style={styles.summaryItemText}>
                      <Text style={{ fontWeight: '800' }}>Promedio General:</Text> 8.8 / 10
                    </Text>
                    <Text style={styles.summaryItemText}>
                      <Text style={{ fontWeight: '800' }}>Concepto:</Text> Sobresaliente
                    </Text>
                  </View>
                </View>
              ) : (
                /* ── CUERPO: CASO 2 - CONSTANCIA DE ALUMNO REGULAR ── */
                <View style={styles.certBody}>
                  <Text style={styles.certParagraph}>
                    La Dirección del <Text style={{ fontWeight: '800' }}>Centro Educativo EduCore</Text>, con personería oficial en Av. Sarmiento 1850 de la ciudad de Resistencia, Provincia del Chaco, CERTIFICA por la presente que el/la estudiante:
                  </Text>

                  {/* Recuadro Destacado con Nombre y DNI */}
                  <View style={styles.certHighlightBox}>
                    <Text style={styles.certHighlightName}>{studentName}</Text>
                    <Text style={styles.certHighlightMeta}>
                      DNI N° <Text style={{ fontWeight: '700' }}>{studentDni}</Text> · Legajo Oficial <Text style={{ fontWeight: '700' }}>#{studentLegajo}</Text>
                    </Text>
                  </View>

                  <Text style={styles.certParagraph}>
                    Se encuentra inscripto/a y asiste regularmente a sus actividades curriculares en el <Text style={{ fontWeight: '800' }}>{student.curso || '1° Año A'}</Text> perteneciente al <Text style={{ fontWeight: '800' }}>Nivel SECUNDARIA</Text> de esta institución, registrando matrícula formal y conducta ejemplar durante el <Text style={{ fontWeight: '800' }}>Ciclo Lectivo 2026</Text>.
                  </Text>

                  <Text style={styles.certParagraph}>
                    A solicitud de la parte interesada y para ser presentado ante las autoridades u organismos que correspondan (Asignaciones Familiares, Obras Sociales, Coberturas Médicas y Trámites Oficiales), se expide la presente constancia con validez oficial en la ciudad de Resistencia, a los <Text style={{ fontWeight: '800' }}>09 de noviembre de 2026</Text>.
                  </Text>
                </View>
              )}

              {/* Firmas y Sellos Institucionales */}
              <View style={styles.signaturesBox}>
                <View style={styles.sigCol}>
                  <View style={styles.sigLine} />
                  <Text style={styles.sigName}>Prof. Lic. Andrea Valenzuela</Text>
                  <Text style={styles.sigTitle}>Secretaría Académica General</Text>
                  <Text style={styles.sigSchool}>EduCore Centro Educativo</Text>
                </View>

                <View style={styles.sigCol}>
                  <View style={styles.sigLine} />
                  <Text style={styles.sigName}>Dirección de Nivel</Text>
                  <Text style={styles.sigTitle}>Sello y Firma Autorizada</Text>
                  <View style={styles.stampCircle}>
                    <Text style={styles.stampText}>SELLO</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FamilyDocumentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 29, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  containerBox: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '94%',
    borderRadius: 24,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  topControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalHeadingText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  printBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  sheetScroll: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  sheetContent: {
    padding: 12,
  },
  whiteSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  letterhead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  letterheadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  eduLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  eduLogoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 22,
  },
  eduBrandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  eduBrandSubtitle: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },
  eduBrandContact: {
    fontSize: 8.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  cycleLectivoBox: {
    alignItems: 'flex-end',
  },
  cycleLectivoLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  cycleLectivoYear: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
  },
  dividerBold: {
    height: 2,
    backgroundColor: '#0F172A',
    marginVertical: 10,
  },
  docTitleContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  docTitleText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  titleUnderline: {
    width: 60,
    height: 2,
    backgroundColor: '#EA580C',
    marginTop: 4,
  },
  studentMetaCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  metaCol: {
    flex: 1,
    minWidth: 120,
  },
  metaLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  boletinBody: {
    marginBottom: 10,
  },
  academicSubtitle: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 8,
  },
  tableBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  thCell: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E293B',
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  tdCell: {
    fontSize: 10.5,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  summaryItemText: {
    color: '#F8FAFC',
    fontSize: 10,
  },
  certBody: {
    marginVertical: 10,
    gap: 12,
  },
  certParagraph: {
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
    textAlign: 'justify',
  },
  certHighlightBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
    marginVertical: 4,
  },
  certHighlightName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  certHighlightMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  signaturesBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingTop: 16,
    marginTop: 18,
  },
  sigCol: {
    alignItems: 'center',
  },
  sigLine: {
    width: 120,
    height: 1,
    backgroundColor: '#64748B',
    marginBottom: 6,
  },
  sigName: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  sigTitle: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  sigSchool: {
    fontSize: 8.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  stampCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  stampText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
});
