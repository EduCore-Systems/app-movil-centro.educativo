import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
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
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !student) return null;

  const isBoletin = type === 'boletin';
  const studentName = student.nombre || 'Martina Díaz';
  const studentDni = student.dni || '46777888';
  const studentLegajo = student.studentID_login || 'EST-2026-401';
  const studentCursoNivel = `${student.curso || '1° Año A'} (${student.nivel ? student.nivel.charAt(0).toUpperCase() + student.nivel.slice(1).toLowerCase() : 'Secundaria'})`;

  /**
   * Genera el HTML exacto de la plantilla oficial (idéntico al generado en la web)
   */
  const generateOfficialHtml = () => {
    const tableRows = BOLETIN_MATERIAS.map(
      (m) => `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: bold; color: #0f172a;">${m.name}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; color: #475569;">${m.teacher}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; color: #64748b;">${m.schedule}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; font-weight: bold; color: #0f172a;">${m.grade}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; font-weight: bold; color: #059669;">${m.condition}</td>
        </tr>
      `
    ).join('');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${isBoletin ? 'Boletin_' : 'Certificado_'}${studentName.replace(/\s+/g, '_')}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body {
            margin: 0; padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a; background: #ffffff; font-size: 10pt; line-height: 1.4;
          }
          .header-box {
            border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;
            display: flex; justify-content: space-between; align-items: center;
          }
          .logo-box { display: flex; align-items: center; gap: 12px; }
          .logo-badge {
            width: 44px; height: 44px; background: #ea580c; color: #ffffff;
            border-radius: 12px; display: flex; align-items: center; justify-content: center;
            font-size: 24px; font-weight: bold;
          }
          .title-area h1 { margin: 0; font-size: 15pt; text-transform: uppercase; letter-spacing: -0.5px; }
          .title-area p { margin: 2px 0 0; font-size: 8.5pt; color: #64748b; }
          .doc-title { text-align: center; margin: 16px 0; }
          .doc-title h2 {
            display: inline-block; margin: 0; padding-bottom: 4px; border-bottom: 2px solid #ea580c;
            font-size: 12pt; text-transform: uppercase; letter-spacing: 0.5px; color: #1e293b;
          }
          .student-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 50px;
            padding: 12px 24px;
            margin-bottom: 18px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          .student-col {
            flex: 1;
            padding: 0 4px;
          }
          .student-col .label {
            color: #64748b;
            font-size: 7.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: block;
            margin-bottom: 2px;
          }
          .student-col .value {
            font-weight: 800;
            color: #0f172a;
            font-size: 9.5pt;
            display: block;
          }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 8.5pt; }
          th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 7px 8px; text-align: left; font-weight: bold; color: #1e293b; }
          .summary-row {
            display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0;
            border-radius: 6px; padding: 8px 12px; margin-top: 10px; font-size: 8.5pt;
          }
          .cert-text {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 10.5pt;
            line-height: 1.65;
            text-align: justify;
            margin: 20px 4px;
            color: #334155;
          }
          .cert-highlight {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 50px;
            padding: 14px 20px;
            text-align: center;
            margin: 18px 0;
          }
          .cert-highlight .name {
            font-size: 13pt;
            font-weight: 800;
            text-transform: uppercase;
            color: #0f172a;
            letter-spacing: 0.5px;
          }
          .cert-highlight .meta {
            font-size: 8.5pt;
            color: #64748b;
            margin-top: 3px;
          }
          .signatures {
            margin-top: 36px; padding-top: 14px; border-top: 1px solid #cbd5e1;
            display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; font-size: 8.5pt;
          }
          .sig-line { width: 150px; margin: 0 auto 6px; border-bottom: 1px solid #64748b; }
          .stamp {
            display: inline-block; border: 2px dashed #94a3b8; border-radius: 50%;
            width: 54px; height: 54px; line-height: 50px; color: #94a3b8; font-size: 7.5pt;
            margin-top: 4px; text-transform: uppercase; font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="logo-box">
            <div class="logo-badge">E</div>
            <div class="title-area">
              <h1>Centro Educativo EduCore</h1>
              <p>Instituto Incorporado a la Enseñanza Oficial · D.I.E.P. N° 4812</p>
              <p style="color: #94a3b8;">Av. Sarmiento 1850 · Resistencia, Chaco · Tel: (0362) 442-8900</p>
            </div>
          </div>
          <div style="text-align: right; font-size: 8.5pt;">
            <span style="display: block; font-weight: bold; text-transform: uppercase; color: #475569;">Ciclo Lectivo</span>
            <span style="font-size: 14pt; font-weight: 800; color: #ea580c;">2026</span>
          </div>
        </div>

        <div class="doc-title">
          <h2>${isBoletin ? 'Informe Oficial de Asignaturas y Calificaciones' : 'Constancia de Alumno Regular'}</h2>
        </div>

        <div class="student-card">
          <div class="student-col">
            <span class="label">ESTUDIANTE:</span>
            <span class="value">${studentName}</span>
          </div>
          <div class="student-col">
            <span class="label">DNI / DOCUMENTO:</span>
            <span class="value">${studentDni}</span>
          </div>
          <div class="student-col">
            <span class="label">LEGAJO INSTITUCIONAL:</span>
            <span class="value">${studentLegajo}</span>
          </div>
          <div class="student-col">
            <span class="label">CURSO Y NIVEL:</span>
            <span class="value">${studentCursoNivel}</span>
          </div>
        </div>

        ${
          isBoletin
            ? `
          <p style="color: #475569; font-size: 8.5pt; margin-bottom: 8px;">
            Rendimiento académico y cursado correspondiente al presente ciclo lectivo:
          </p>
          <table>
            <thead>
              <tr>
                <th>Espacio Curricular</th>
                <th>Docente a Cargo</th>
                <th style="text-align: center;">Horario</th>
                <th style="text-align: center;">Calificación</th>
                <th style="text-align: center;">Condición</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="summary-row">
            <span><strong>Asistencia Oficial:</strong> 96.4% (Óptima)</span>
            <span><strong>Promedio General:</strong> 8.8 / 10</span>
            <span><strong>Concepto:</strong> Sobresaliente</span>
          </div>
        `
            : `
          <div class="cert-text">
            <p>
              La Dirección del <strong>Centro Educativo EduCore</strong>, con personería oficial en Av. Sarmiento 1850 de la ciudad de Resistencia, Provincia del Chaco, CERTIFICA por la presente que el/la estudiante:
            </p>
            <div class="cert-highlight">
              <div class="name">${studentName}</div>
              <div class="meta">DNI N° <strong>${studentDni}</strong> · Legajo Oficial <strong>#${studentLegajo}</strong></div>
            </div>
            <p>
              Se encuentra inscripto/a y asiste regularmente a sus actividades curriculares en el <strong>${student.curso || '1° Año A'}</strong> perteneciente al <strong>Nivel ${(student.nivel || 'secundaria').toUpperCase()}</strong> de esta institución, registrando matrícula formal y conducta ejemplar durante el <strong>Ciclo Lectivo 2026</strong>.
            </p>
            <p>
              A solicitud de la parte interesada y para ser presentado ante las autoridades u organismos que correspondan (Asignaciones Familiares, Obras Sociales, Coberturas Médicas y Trámites Oficiales), se expide la presente constancia con validez oficial en la ciudad de Resistencia, a los <strong>${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>.
            </p>
          </div>
        `
        }

        <div class="signatures">
          <div>
            <div class="sig-line"></div>
            <strong>Prof. Lic. Andrea Valenzuela</strong><br/>
            <span style="font-size: 7.5pt; color: #64748b;">Secretaría Académica General</span><br/>
            <span style="font-size: 7.5pt; color: #94a3b8;">EduCore Centro Educativo</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <strong>Dirección de Nivel</strong><br/>
            <span style="font-size: 7.5pt; color: #64748b;">Sello y Firma Autorizada</span><br/>
            <div class="stamp">SELLO</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  /**
   * Generación y descarga nativa real del PDF usando expo-print y expo-sharing
   */
  const handlePrintOrShare = async () => {
    try {
      setIsGenerating(true);
      const html = generateOfficialHtml();
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: isBoletin
            ? `Boletin_${studentName.replace(/\s+/g, '_')}.pdf`
            : `Certificado_${studentName.replace(/\s+/g, '_')}.pdf`,
        });
      } else {
        await Print.printAsync({ html });
      }
    } catch (err: any) {
      console.error('Error al generar PDF:', err);
      Alert.alert('Error', 'No se pudo generar o compartir el archivo PDF oficial.');
    } finally {
      setIsGenerating(false);
    }
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
              <Text style={styles.modalHeadingText} numberOfLines={1}>
                {isBoletin ? 'Boletín Oficial de Calificaciones' : 'Constancia de Alumno Regular'}
              </Text>
            </View>

            <View style={styles.actionsRight}>
              <TouchableOpacity
                onPress={handlePrintOrShare}
                style={[styles.printBtn, isGenerating && { opacity: 0.7 }]}
                activeOpacity={0.8}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                ) : (
                  <MaterialIcons name="print" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                )}
                <Text style={styles.printBtnText}>
                  {isGenerating ? 'Generando...' : 'Imprimir / Descargar PDF'}
                </Text>
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
                    <Text style={styles.eduBrandLocation}>
                      Av. Sarmiento 1850 · Resistencia, Chaco · Tel: (0362) 442-8900
                    </Text>
                  </View>
                </View>

                <View style={styles.letterheadRight}>
                  <Text style={styles.cycleLabel}>CICLO LECTIVO</Text>
                  <Text style={styles.cycleYear}>2026</Text>
                </View>
              </View>

              {/* Separador Institucional */}
              <View style={styles.blackDivider} />

              {/* Título Oficial del Documento */}
              <View style={styles.docTitleContainer}>
                <Text style={styles.docTitle}>
                  {isBoletin
                    ? 'INFORME OFICIAL DE ASIGNATURAS Y CALIFICACIONES'
                    : 'CONSTANCIA DE ALUMNO REGULAR'}
                </Text>
                <View style={styles.docTitleUnderline} />
              </View>

              {/* Ficha Formal de Datos del Estudiante */}
              <View style={styles.studentCardBox}>
                <View style={styles.studentCardCol}>
                  <Text style={styles.fieldLabel}>ESTUDIANTE:</Text>
                  <Text style={styles.fieldValue} numberOfLines={1}>{studentName}</Text>
                </View>

                <View style={styles.studentCardCol}>
                  <Text style={styles.fieldLabel}>DNI / DOCUMENTO:</Text>
                  <Text style={styles.fieldValue}>{studentDni}</Text>
                </View>

                <View style={styles.studentCardCol}>
                  <Text style={styles.fieldLabel}>LEGAJO INSTITUCIONAL:</Text>
                  <Text style={styles.fieldValue}>{studentLegajo}</Text>
                </View>

                <View style={styles.studentCardCol}>
                  <Text style={styles.fieldLabel}>CURSO Y NIVEL:</Text>
                  <Text style={styles.fieldValue}>{studentCursoNivel}</Text>
                </View>
              </View>

              {/* ── CUERPO 1: BOLETÍN OFICIAL ── */}
              {isBoletin && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.tableCaption}>
                    Rendimiento académico y cursado correspondiente al presente ciclo lectivo:
                  </Text>

                  {/* Tabla de Calificaciones Oficial */}
                  <View style={styles.tableBorder}>
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.thCell, { flex: 2.2 }]}>Espacio Curricular</Text>
                      <Text style={[styles.thCell, { flex: 1.8 }]}>Docente a Cargo</Text>
                      <Text style={[styles.thCell, { flex: 1.5, textAlign: 'center' }]}>Horario</Text>
                      <Text style={[styles.thCell, { flex: 1, textAlign: 'center' }]}>Calificación</Text>
                      <Text style={[styles.thCell, { flex: 1, textAlign: 'center' }]}>Condición</Text>
                    </View>

                    {BOLETIN_MATERIAS.map((item, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.tableDataRow,
                          idx % 2 === 1 && { backgroundColor: '#F8FAFC' },
                        ]}
                      >
                        <Text style={[styles.tdCell, styles.subjectName, { flex: 2.2 }]}>
                          {item.name}
                        </Text>
                        <Text style={[styles.tdCell, styles.teacherName, { flex: 1.8 }]}>
                          {item.teacher}
                        </Text>
                        <Text style={[styles.tdCell, styles.scheduleText, { flex: 1.5, textAlign: 'center' }]}>
                          {item.schedule}
                        </Text>
                        <Text style={[styles.tdCell, styles.gradeText, { flex: 1, textAlign: 'center' }]}>
                          {item.grade}
                        </Text>
                        <Text style={[styles.tdCell, styles.conditionText, { flex: 1, textAlign: 'center' }]}>
                          {item.condition}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Resumen Oficial al pie de la tabla */}
                  <View style={styles.summaryBar}>
                    <Text style={styles.summaryItem}>
                      <Text style={styles.summaryBold}>Asistencia Oficial:</Text> 96.4% (Óptima)
                    </Text>
                    <Text style={styles.summaryItem}>
                      <Text style={styles.summaryBold}>Promedio General:</Text> 8.8 / 10
                    </Text>
                    <Text style={styles.summaryItem}>
                      <Text style={styles.summaryBold}>Concepto:</Text> Sobresaliente
                    </Text>
                  </View>
                </View>
              )}

              {/* ── CUERPO 2: CERTIFICADO DE ALUMNO REGULAR ── */}
              {!isBoletin && (
                <View style={styles.certBody}>
                  <Text style={styles.certParagraph}>
                    La Dirección del <Text style={styles.boldText}>Centro Educativo EduCore</Text>, con personería oficial en Av. Sarmiento 1850 de la ciudad de Resistencia, Provincia del Chaco, CERTIFICA por la presente que el/la estudiante:
                  </Text>

                  <View style={styles.certStudentHighlightBox}>
                    <Text style={styles.highlightName}>{studentName}</Text>
                    <Text style={styles.highlightDetails}>
                      DNI N° <Text style={styles.boldText}>{studentDni}</Text> · Legajo Oficial <Text style={styles.boldText}>#{studentLegajo}</Text>
                    </Text>
                  </View>

                  <Text style={styles.certParagraph}>
                    Se encuentra inscripto/a y asiste regularmente a sus actividades curriculares en el <Text style={styles.boldText}>{student.curso || '1° Año A'}</Text> perteneciente al <Text style={styles.boldText}>Nivel {(student.nivel || 'secundaria').toUpperCase()}</Text> de esta institución, registrando matrícula formal y conducta ejemplar durante el <Text style={styles.boldText}>Ciclo Lectivo 2026</Text>.
                  </Text>

                  <Text style={styles.certParagraph}>
                    A solicitud de la parte interesada y para ser presentado ante las autoridades u organismos que correspondan (Asignaciones Familiares, Obras Sociales, Coberturas Médicas y Trámites Oficiales), se expide la presente constancia con validez oficial en la ciudad de Resistencia, a los <Text style={styles.boldText}>{new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>.
                  </Text>
                </View>
              )}

              {/* Firmas y Sellos Institucionales */}
              <View style={styles.signaturesArea}>
                <View style={styles.signatureBox}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signerName}>Prof. Lic. Andrea Valenzuela</Text>
                  <Text style={styles.signerRole}>Secretaría Académica General</Text>
                  <Text style={styles.signerSub}>EduCore Centro Educativo</Text>
                </View>

                <View style={styles.signatureBox}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signerName}>Dirección de Nivel</Text>
                  <Text style={styles.signerRole}>Sello y Firma Autorizada</Text>
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
    maxHeight: '94%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  topControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  modalHeadingText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  sheetScroll: {
    backgroundColor: '#0A0F1D',
  },
  sheetContent: {
    padding: 14,
    alignItems: 'center',
  },
  whiteSheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  letterhead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  letterheadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  eduLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eduLogoText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  eduBrandTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  eduBrandSubtitle: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 1,
  },
  eduBrandLocation: {
    fontSize: 8,
    color: '#94A3B8',
    marginTop: 1,
  },
  letterheadRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  cycleLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#475569',
  },
  cycleYear: {
    fontSize: 15,
    fontWeight: '900',
    color: '#EA580C',
  },
  blackDivider: {
    height: 2,
    backgroundColor: '#0F172A',
    marginVertical: 10,
  },
  docTitleContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  docTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  docTitleUnderline: {
    width: 140,
    height: 2,
    backgroundColor: '#CBD5E1',
    marginTop: 4,
  },
  studentCardBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentCardCol: {
    flex: 1,
    paddingHorizontal: 3,
  },
  fieldLabel: {
    fontSize: 6.8,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  fieldValue: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  tableCaption: {
    fontSize: 8.5,
    color: '#475569',
    marginBottom: 6,
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  thCell: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#1E293B',
    paddingHorizontal: 2,
  },
  tableDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 5,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tdCell: {
    fontSize: 7.5,
    paddingHorizontal: 2,
  },
  subjectName: {
    fontWeight: '700',
    color: '#0F172A',
  },
  teacherName: {
    color: '#475569',
  },
  scheduleText: {
    color: '#64748B',
  },
  gradeText: {
    fontWeight: '800',
    color: '#0F172A',
  },
  conditionText: {
    fontWeight: '700',
    color: '#059669',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    marginTop: 8,
  },
  summaryItem: {
    fontSize: 8,
    color: '#1E293B',
  },
  summaryBold: {
    fontWeight: '800',
  },
  certBody: {
    marginVertical: 12,
  },
  certParagraph: {
    fontSize: 9.5,
    lineHeight: 16,
    color: '#334155',
    textAlign: 'justify',
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '800',
    color: '#0F172A',
  },
  certStudentHighlightBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 10,
  },
  highlightName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  highlightDetails: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 2,
  },
  signaturesArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  signatureBox: {
    flex: 1,
    alignItems: 'center',
  },
  signatureLine: {
    width: 110,
    height: 1,
    backgroundColor: '#64748B',
    marginBottom: 4,
  },
  signerName: {
    fontSize: 8,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  signerRole: {
    fontSize: 7,
    color: '#64748B',
    textAlign: 'center',
  },
  signerSub: {
    fontSize: 6.5,
    color: '#94A3B8',
    textAlign: 'center',
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
    marginTop: 4,
  },
  stampText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: '#94A3B8',
  },
});

export default FamilyDocumentModal;
