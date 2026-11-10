import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  PaymentRecord,
  getStudentPayments,
  informPayment,
} from '../../../services/paymentService';
import { FamilyStudent } from '../../../services/familyService';

interface FamilyTuitionTabProps {
  student: FamilyStudent;
  user?: any;
  isDarkMode?: boolean;
  onBackToDashboard?: () => void;
}

export const FamilyTuitionTab: React.FC<FamilyTuitionTabProps> = ({
  student,
  user,
  isDarkMode = true,
  onBackToDashboard,
}) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'pendientes' | 'pagadas' | 'todas'>('pendientes');

  // Modal Informar Pago
  const [selectedPaymentForPay, setSelectedPaymentForPay] = useState<PaymentRecord | null>(null);
  const [payMethod, setPayMethod] = useState<'Transferencia Bancaria' | 'Mercado Pago' | 'Caja Escolar'>('Transferencia Bancaria');
  const [payReference, setPayReference] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Modal / Generación de Recibo PDF (identificador de la tarjeta en proceso)
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  // Cargar pagos del estudiante
  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await getStudentPayments(student);
      setPayments(data);
    } catch (err) {
      console.warn('Error al cargar cuotas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [student?.id, student?.dni]);

  // Cálculos de KPI
  const pendingPayments = useMemo(() => payments.filter((p) => p.status === 'pendiente'), [payments]);
  const paidPayments = useMemo(() => payments.filter((p) => p.status === 'pagado'), [payments]);

  const totalPendingAmount = useMemo(() => {
    return pendingPayments.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  }, [pendingPayments]);

  const nextDuePayment = useMemo(() => {
    return pendingPayments.length > 0 ? pendingPayments[0] : null;
  }, [pendingPayments]);

  // Lista filtrada
  const filteredPayments = useMemo(() => {
    if (activeFilter === 'pendientes') return pendingPayments;
    if (activeFilter === 'pagadas') return paidPayments;
    return payments;
  }, [payments, activeFilter, pendingPayments, paidPayments]);

  // Acción: Confirmar pago
  const handleConfirmPayment = async () => {
    if (!selectedPaymentForPay) return;
    setIsSubmittingPay(true);
    try {
      await informPayment(selectedPaymentForPay.id, {
        method: payMethod,
        reference: payReference.trim() || undefined,
      });

      // Actualizar estado local inmediatamente
      const now = new Date();
      const formattedDate = `${now.toLocaleDateString('es-AR')} · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs`;
      const receiptNo = payReference.trim() ? `TR-${payReference.trim()}` : `REC-2026-${Date.now().toString().slice(-5)}`;

      setPayments((prev) =>
        prev.map((p) =>
          p.id === selectedPaymentForPay.id
            ? {
                ...p,
                status: 'pagado',
                paidAt: formattedDate,
                paymentMethod: payMethod,
                receiptNumber: receiptNo,
              }
            : p
        )
      );

      Alert.alert(
        'Pago Registrado con Éxito',
        `El comprobante ${receiptNo} quedó asentado para la cuota de ${selectedPaymentForPay.period || 'el período seleccionado'}.`,
        [{ text: 'Aceptar' }]
      );
      setSelectedPaymentForPay(null);
      setPayReference('');
    } catch (e: any) {
      Alert.alert('Error', 'No se pudo procesar el pago.');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  // Acción: Descargar / Compartir Recibo Oficial en PDF
  const handleDownloadReceiptPdf = async (item: PaymentRecord) => {
    setGeneratingPdfId(item.id);
    try {
      const receiptCode = item.receiptNumber || `REC-2026-${Date.now().toString().slice(-5)}`;
      const issueDate = item.paidAt || new Date().toLocaleDateString('es-AR');
      const studentName = student.nombre || item.studentName || 'Martina Díaz';
      const studentDni = student.dni || item.studentDni || '46777888';
      const studentCourse = `${student.curso || item.curso || '1° Año A'} (${student.nivel || item.nivel || 'Secundaria'})`;

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Recibo_Oficial_${receiptCode}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 32px;
              color: #0f172a;
              background-color: #ffffff;
            }
            .header-table {
              width: 100%;
              border-bottom: 2px solid #ea580c;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .brand-title {
              font-size: 22px;
              font-weight: 800;
              color: #ea580c;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .brand-sub {
              font-size: 11px;
              color: #64748b;
              margin-top: 4px;
            }
            .receipt-box {
              text-align: right;
            }
            .receipt-badge {
              display: inline-block;
              background-color: #ecfdf5;
              color: #059669;
              border: 1px solid #10b981;
              padding: 6px 12px;
              border-radius: 6px;
              font-weight: 800;
              font-size: 13px;
              text-transform: uppercase;
            }
            .info-grid {
              width: 100%;
              margin-bottom: 24px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
            }
            .info-label {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              font-weight: 700;
            }
            .info-value {
              font-size: 13px;
              color: #0f172a;
              font-weight: 600;
              margin-bottom: 10px;
            }
            table.items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            table.items-table th {
              background-color: #0f172a;
              color: #ffffff;
              font-size: 11px;
              text-transform: uppercase;
              padding: 10px;
              text-align: left;
            }
            table.items-table td {
              border-bottom: 1px solid #e2e8f0;
              padding: 12px 10px;
              font-size: 12px;
            }
            .total-row {
              background-color: #fff7ed;
              font-weight: 800;
              font-size: 14px;
              color: #ea580c;
            }
            .stamp-box {
              margin-top: 30px;
              border: 2px dashed #10b981;
              padding: 14px;
              border-radius: 8px;
              display: inline-block;
              text-align: center;
              background-color: #f0fdf4;
            }
            .stamp-title {
              font-size: 12px;
              font-weight: 800;
              color: #059669;
              text-transform: uppercase;
            }
            .stamp-sub {
              font-size: 10px;
              color: #15803d;
              margin-top: 2px;
            }
            .footer-legal {
              margin-top: 40px;
              font-size: 10px;
              color: #94a3b8;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div class="brand-title">Instituto Educativo EduCore</div>
                <div class="brand-sub">Comprobante Oficial de Cobranza Escolar y Matrícula</div>
                <div class="brand-sub">CUIT: 30-71449201-8 · Av. Siempreviva 742</div>
              </td>
              <td class="receipt-box">
                <div class="receipt-badge">Abonado · Pagado</div>
                <div style="font-size: 12px; font-weight: 700; margin-top: 6px;">N°: ${receiptCode}</div>
                <div style="font-size: 11px; color: #64748b;">Fecha: ${issueDate}</div>
              </td>
            </tr>
          </table>

          <table class="info-grid">
            <tr>
              <td style="width: 50%;">
                <div class="info-label">Estudiante / Titular</div>
                <div class="info-value">${studentName}</div>
                <div class="info-label">DNI</div>
                <div class="info-value">${studentDni}</div>
              </td>
              <td style="width: 50%;">
                <div class="info-label">Curso y División</div>
                <div class="info-value">${studentCourse}</div>
                <div class="info-label">Medio de Pago Registrado</div>
                <div class="info-value">${item.paymentMethod || 'Transferencia Bancaria'}</div>
              </td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th>Concepto / Detalle Arancelario</th>
                <th>Período</th>
                <th style="text-align: right;">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Cuota Pedagógica Base</strong><br><span style="font-size: 10px; color: #64748b;">Enseñanza oficial y currículo pedagógico</span></td>
                <td>${item.period || 'Cuota Escolar'}</td>
                <td style="text-align: right;">$${(item.baseTuition || 42000).toLocaleString('es-AR')}</td>
              </tr>
              ${
                item.diningAmount && item.diningAmount > 0
                  ? `<tr>
                      <td><strong>Comedor Escolar Integral</strong><br><span style="font-size: 10px; color: #64748b;">Menú nutricional diario y supervisión</span></td>
                      <td>Mensual</td>
                      <td style="text-align: right;">$${item.diningAmount.toLocaleString('es-AR')}</td>
                    </tr>`
                  : ''
              }
              ${
                item.transportAmount && item.transportAmount > 0
                  ? `<tr>
                      <td><strong>Transporte Escolar Institucional</strong><br><span style="font-size: 10px; color: #64748b;">Servicio puerta a puerta ida y vuelta</span></td>
                      <td>Mensual</td>
                      <td style="text-align: right;">$${item.transportAmount.toLocaleString('es-AR')}</td>
                    </tr>`
                  : ''
              }
              ${
                item.sportsAmount && item.sportsAmount > 0
                  ? `<tr>
                      <td><strong>Deportes y Talleres Extracurriculares</strong><br><span style="font-size: 10px; color: #64748b;">Prácticas deportivas de campo y clubes escolares</span></td>
                      <td>Mensual</td>
                      <td style="text-align: right;">$${item.sportsAmount.toLocaleString('es-AR')}</td>
                    </tr>`
                  : ''
              }
              <tr class="total-row">
                <td colspan="2" style="text-align: right; text-transform: uppercase;">Total Abonado:</td>
                <td style="text-align: right;">$${item.totalAmount.toLocaleString('es-AR')}</td>
              </tr>
            </tbody>
          </table>

          <div class="stamp-box">
            <div class="stamp-title">✓ VALIDACIÓN OFICIAL CAJA CENTRAL EDUCORE</div>
            <div class="stamp-sub">Transacción verificada · Código de seguridad: ${receiptCode}</div>
          </div>

          <div class="footer-legal">
            Documento de validez legal emitido por el Sistema de Gestión EducCore. Conserve este comprobante como constancia fehaciente de pago arancelario del ciclo lectivo 2026.
          </div>
        </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        await Print.printAsync({ html: htmlContent });
      } else {
        // En Android / iOS:
        let sharedSuccessfully = false;
        try {
          const isShareAvailable = await Sharing.isAvailableAsync();
          if (isShareAvailable) {
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            let targetUri = uri;
            if (!targetUri.startsWith('file://')) {
              targetUri = `file://${targetUri}`;
            }
            await Sharing.shareAsync(targetUri, {
              UTI: '.pdf',
              mimeType: 'application/pdf',
              dialogTitle: `Recibo_EduCore_${receiptCode}.pdf`,
            });
            sharedSuccessfully = true;
          }
        } catch (shareErr) {
          console.warn('Sharing no disponible o restringido por FileProvider en Android, abriendo PrintManager nativo:', shareErr);
        }

        // Si Sharing no está permitido o falló en el sandbox de Expo Go,
        // invocar Print.printAsync() que abre el diálogo nativo del sistema para "Guardar como PDF"
        if (!sharedSuccessfully) {
          await Print.printAsync({ html: htmlContent });
        }
      }
    } catch (err) {
      console.error('Error al generar recibo oficial en PDF:', err);
      Alert.alert('Error', 'No se pudo generar el comprobante en PDF.');
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    bg: isDarkMode ? '#0A0F1D' : '#F8FAFC',
    inputBg: isDarkMode ? '#0F172A' : '#F1F5F9',
    badgePendingBg: isDarkMode ? 'rgba(234, 88, 12, 0.15)' : '#FFEDD5',
    badgePendingText: '#EA580C',
    badgePaidBg: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
    badgePaidText: '#10B981',
  };

  return (
    <View style={styles.container}>
      {/* ── ENCABEZADO SUPERIOR DEL MÓDULO ── */}
      <View style={[styles.headerCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleBox}>
            <View style={styles.headerIconContainer}>
              <MaterialIcons name="account-balance-wallet" size={20} color="#EA580C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.headerTitle, { color: theme.titleColor }]}
                maxFontSizeMultiplier={1.15}
              >
                Gestión de Cuotas y Aranceles
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: theme.subColor }]}
                maxFontSizeMultiplier={1.15}
              >
                Estado arancelario oficial de{' '}
                <Text style={{ fontWeight: '700', color: '#EA580C' }}>{student.nombre}</Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
            onPress={loadPayments}
            activeOpacity={0.7}
          >
            <MaterialIcons name="refresh" size={18} color={theme.titleColor} />
          </TouchableOpacity>
        </View>

        {/* ── TARJETAS KPI (RÚBRICA DE EVALUACIÓN) ── */}
        <View style={styles.kpiContainer}>
          {/* KPI 1: Total Adeudado */}
          <View style={[styles.kpiCard, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Text style={[styles.kpiLabel, { color: theme.subColor }]} maxFontSizeMultiplier={1.1} numberOfLines={1}>
              TOTAL PENDIENTE
            </Text>
            <Text
              style={[
                styles.kpiValue,
                { color: totalPendingAmount > 0 ? '#EA580C' : '#10B981' },
              ]}
              maxFontSizeMultiplier={1.15}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              ${totalPendingAmount.toLocaleString('es-AR')}
            </Text>
            <Text style={[styles.kpiHint, { color: theme.subColor }]} maxFontSizeMultiplier={1.1} numberOfLines={1}>
              {pendingPayments.length} {pendingPayments.length === 1 ? 'cuota a vencer' : 'cuotas por abonar'}
            </Text>
          </View>

          {/* KPI 2: Estado Arancelario */}
          <View style={[styles.kpiCard, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Text style={[styles.kpiLabel, { color: theme.subColor }]} maxFontSizeMultiplier={1.1} numberOfLines={1}>
              ESTADO DE CUENTA
            </Text>
            <View style={styles.statusPillRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: totalPendingAmount > 0 ? '#EA580C' : '#10B981' },
                ]}
              />
              <Text
                style={[
                  styles.statusPillText,
                  { color: totalPendingAmount > 0 ? '#EA580C' : '#10B981' },
                ]}
                maxFontSizeMultiplier={1.15}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {totalPendingAmount > 0 ? 'Con Pendientes' : 'Al Día'}
              </Text>
            </View>
            <Text style={[styles.kpiHint, { color: theme.subColor }]} maxFontSizeMultiplier={1.1} numberOfLines={1}>
              Ciclo Lectivo 2026
            </Text>
          </View>

          {/* KPI 3: Próximo Vencimiento */}
          <View style={[styles.kpiCard, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Text style={[styles.kpiLabel, { color: theme.subColor }]} maxFontSizeMultiplier={1.1} numberOfLines={1}>
              PRÓXIMO VENCE
            </Text>
            <Text
              style={[styles.kpiValueDate, { color: theme.titleColor }]}
              maxFontSizeMultiplier={1.15}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {nextDuePayment ? nextDuePayment.dueDate : 'Sin deudas'}
            </Text>
            <Text style={[styles.kpiHint, { color: theme.subColor }]} maxFontSizeMultiplier={1.1} numberOfLines={1}>
              {nextDuePayment ? 'Plazo adm.' : 'Al día'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── CONTROL SEGMENTADO DE FILTRO (PENDIENTES / PAGADAS / TODAS) ── */}
      <View style={[styles.filterBar, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.filterTabBtn,
            activeFilter === 'pendientes' && styles.filterTabBtnActive,
          ]}
          onPress={() => setActiveFilter('pendientes')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: activeFilter === 'pendientes' ? '#FFFFFF' : theme.subColor },
            ]}
            maxFontSizeMultiplier={1.15}
            numberOfLines={1}
          >
            Pendientes ({pendingPayments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTabBtn,
            activeFilter === 'pagadas' && styles.filterTabBtnActive,
          ]}
          onPress={() => setActiveFilter('pagadas')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: activeFilter === 'pagadas' ? '#FFFFFF' : theme.subColor },
            ]}
            maxFontSizeMultiplier={1.15}
            numberOfLines={1}
          >
            Pagadas ({paidPayments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTabBtn,
            activeFilter === 'todas' && styles.filterTabBtnActive,
          ]}
          onPress={() => setActiveFilter('todas')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: activeFilter === 'todas' ? '#FFFFFF' : theme.subColor },
            ]}
            maxFontSizeMultiplier={1.15}
            numberOfLines={1}
          >
            Todas ({payments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── LISTADO DETALLADO DE CUOTAS ── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={[styles.loadingText, { color: theme.subColor }]}>
            Cargando nómina de cuotas y pagos...
          </Text>
        </View>
      ) : filteredPayments.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <MaterialIcons name="check-circle" size={48} color="#10B981" />
          <Text style={[styles.emptyTitle, { color: theme.titleColor }]}>
            {activeFilter === 'pendientes'
              ? '¡Excelente! No hay cuotas pendientes'
              : 'No se encontraron registros de cuotas'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.subColor }]}>
            {activeFilter === 'pendientes'
              ? 'El estudiante se encuentra regular y al día con todos los aranceles escolares.'
              : 'Selecciona otro filtro para visualizar las cuotas anteriores.'}
          </Text>
        </View>
      ) : (
        filteredPayments.map((item) => {
          const isPaid = item.status === 'pagado';

          return (
            <View
              key={item.id}
              style={[
                styles.paymentCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: isPaid ? theme.border : '#EA580C',
                  borderLeftWidth: 4,
                  borderLeftColor: isPaid ? '#10B981' : '#EA580C',
                },
              ]}
            >
              {/* Fila Cabecera de la Tarjeta */}
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1, minWidth: 140 }}>
                  <Text
                    style={[styles.periodTitle, { color: theme.titleColor }]}
                    maxFontSizeMultiplier={1.15}
                  >
                    {item.period || 'Cuota Escolar'}
                  </Text>
                  <View style={styles.dueDateRow}>
                    <MaterialIcons name="event" size={13} color={theme.subColor} style={{ marginRight: 4 }} />
                    <Text
                      style={[styles.dueDateText, { color: theme.subColor }]}
                      maxFontSizeMultiplier={1.15}
                    >
                      Vencimiento: <Text style={{ fontWeight: '700', color: theme.titleColor }}>{item.dueDate}</Text>
                    </Text>
                  </View>
                </View>

                {/* Badge de Estado Oficial (Rúbrica) */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isPaid ? theme.badgePaidBg : theme.badgePendingBg,
                      borderColor: isPaid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(234, 88, 12, 0.4)',
                    },
                  ]}
                >
                  <MaterialIcons
                    name={isPaid ? 'check-circle' : 'hourglass-top'}
                    size={13}
                    color={isPaid ? theme.badgePaidText : theme.badgePendingText}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: isPaid ? theme.badgePaidText : theme.badgePendingText },
                    ]}
                    maxFontSizeMultiplier={1.15}
                    numberOfLines={1}
                  >
                    {isPaid ? 'Abonado' : 'Pendiente de Pago'}
                  </Text>
                </View>
              </View>

              {/* Importe Total Destacado */}
              <View style={[styles.amountBanner, { backgroundColor: theme.inputBg }]}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.amountLabel, { color: theme.subColor }]}
                    maxFontSizeMultiplier={1.1}
                  >
                    IMPORTE TOTAL
                  </Text>
                  <Text
                    style={[styles.amountValue, { color: theme.titleColor }]}
                    maxFontSizeMultiplier={1.2}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    ${item.totalAmount.toLocaleString('es-AR')}
                  </Text>
                </View>

                <View style={styles.paymentMethodMeta}>
                  <Text
                    style={[styles.amountLabel, { color: theme.subColor }]}
                    maxFontSizeMultiplier={1.1}
                  >
                    CONDICIÓN
                  </Text>
                  <Text
                    style={[
                      styles.conditionText,
                      { color: isPaid ? '#10B981' : '#EA580C' },
                    ]}
                    maxFontSizeMultiplier={1.15}
                  >
                    {isPaid ? 'Al Día' : 'Exigible'}
                  </Text>
                </View>
              </View>

              {/* Desglose Transparente de Servicios (Rúbrica: Importe) */}
              <View style={[styles.breakdownBox, { borderColor: theme.border }]}>
                <Text
                  style={[styles.breakdownTitle, { color: theme.subColor }]}
                  maxFontSizeMultiplier={1.1}
                >
                  DESGLOSE ARANCELARIO DETALLADO:
                </Text>

                <View style={styles.breakdownRow}>
                  <Text
                    style={[styles.breakdownItemName, { color: theme.titleColor }]}
                    maxFontSizeMultiplier={1.15}
                  >
                    • Cuota Pedagógica Base
                  </Text>
                  <Text
                    style={[styles.breakdownItemVal, { color: theme.titleColor }]}
                    maxFontSizeMultiplier={1.15}
                  >
                    ${(item.baseTuition || 42000).toLocaleString('es-AR')}
                  </Text>
                </View>

                {item.diningAmount !== undefined && item.diningAmount > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text
                      style={[styles.breakdownItemName, { color: theme.titleColor }]}
                      maxFontSizeMultiplier={1.15}
                    >
                      • Servicio de Comedor Escolar
                    </Text>
                    <Text
                      style={[styles.breakdownItemVal, { color: theme.titleColor }]}
                      maxFontSizeMultiplier={1.15}
                    >
                      ${item.diningAmount.toLocaleString('es-AR')}
                    </Text>
                  </View>
                )}

                {item.transportAmount !== undefined && item.transportAmount > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text
                      style={[styles.breakdownItemName, { color: theme.titleColor }]}
                      maxFontSizeMultiplier={1.15}
                    >
                      • Recorrido de Transporte Escolar
                    </Text>
                    <Text
                      style={[styles.breakdownItemVal, { color: theme.titleColor }]}
                      maxFontSizeMultiplier={1.15}
                    >
                      ${item.transportAmount.toLocaleString('es-AR')}
                    </Text>
                  </View>
                )}

                {item.sportsAmount !== undefined && item.sportsAmount > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text
                      style={[styles.breakdownItemName, { color: theme.titleColor }]}
                      maxFontSizeMultiplier={1.15}
                    >
                      • Talleres y Prácticas Deportivas
                    </Text>
                    <Text
                      style={[styles.breakdownItemVal, { color: theme.titleColor }]}
                      maxFontSizeMultiplier={1.15}
                    >
                      ${item.sportsAmount.toLocaleString('es-AR')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Información de Historial de Pago (Si ya está abonada) */}
              {isPaid && (
                <View style={[styles.paidHistoryBanner, { backgroundColor: isDarkMode ? 'rgba(16,185,129,0.08)' : '#F0FDF4' }]}>
                  <View style={styles.paidHistoryRow}>
                    <MaterialIcons name="verified" size={16} color="#10B981" style={{ marginRight: 6 }} />
                    <Text
                      style={[styles.paidHistoryText, { color: isDarkMode ? '#A7F3D0' : '#065F46' }]}
                      maxFontSizeMultiplier={1.15}
                    >
                      Abonado: <Text style={{ fontWeight: '700' }}>{item.paidAt || 'Registrado'}</Text>
                    </Text>
                  </View>

                  <View style={styles.paidHistoryMetaRow}>
                    <Text
                      style={[styles.paidMetaLabel, { color: isDarkMode ? '#6EE7B7' : '#047857' }]}
                      maxFontSizeMultiplier={1.15}
                    >
                      Medio: {item.paymentMethod || 'Transferencia'} · Comprobante: {item.receiptNumber || 'REC-OFICIAL'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Botones de Acción */}
              <View style={styles.cardActionsRow}>
                {isPaid ? (
                  <TouchableOpacity
                    style={[styles.actionBtnReceipt, { borderColor: '#10B981' }]}
                    onPress={() => handleDownloadReceiptPdf(item)}
                    activeOpacity={0.8}
                    disabled={generatingPdfId !== null}
                  >
                    {generatingPdfId === item.id ? (
                      <ActivityIndicator size="small" color="#10B981" />
                    ) : (
                      <>
                        <MaterialIcons name="file-download" size={18} color="#10B981" style={{ marginRight: 8 }} />
                        <Text
                          style={styles.actionBtnReceiptText}
                          maxFontSizeMultiplier={1.15}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          Descargar Recibo Oficial (PDF)
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.actionBtnPay}
                    onPress={() => setSelectedPaymentForPay(item)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="payment" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text
                      style={styles.actionBtnPayText}
                      maxFontSizeMultiplier={1.15}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      Informar Pago / Datos Bancarios
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}

      {/* ── MODAL INFORMAR PAGO CON DATOS BANCARIOS ── */}
      <Modal
        visible={!!selectedPaymentForPay}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPaymentForPay(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {/* Cabecera Modal */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: theme.titleColor }]}>
                  Informar Pago de Cuota
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.subColor }]}>
                  {selectedPaymentForPay?.period} · ${selectedPaymentForPay?.totalAmount.toLocaleString('es-AR')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedPaymentForPay(null)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={20} color={theme.titleColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Datos Bancarios Institucionales */}
              <View style={[styles.bankInfoBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <View style={styles.bankHeaderRow}>
                  <MaterialIcons name="account-balance" size={18} color="#EA580C" style={{ marginRight: 6 }} />
                  <Text style={[styles.bankTitle, { color: theme.titleColor }]}>
                    Datos de Transferencia Institucional
                  </Text>
                </View>

                <View style={styles.bankDetailItem}>
                  <Text style={[styles.bankLabel, { color: theme.subColor }]}>BANCO:</Text>
                  <Text style={[styles.bankValue, { color: theme.titleColor }]}>Banco Santander Río</Text>
                </View>

                <View style={styles.bankDetailItem}>
                  <Text style={[styles.bankLabel, { color: theme.subColor }]}>ALIAS:</Text>
                  <Text style={[styles.bankValue, { color: '#EA580C', fontWeight: '800' }]}>EDUCORE.COLEGIO</Text>
                </View>

                <View style={styles.bankDetailItem}>
                  <Text style={[styles.bankLabel, { color: theme.subColor }]}>CBU:</Text>
                  <Text style={[styles.bankValue, { color: theme.titleColor }]}>0720340120000019283741</Text>
                </View>

                <View style={styles.bankDetailItem}>
                  <Text style={[styles.bankLabel, { color: theme.subColor }]}>CUIT:</Text>
                  <Text style={[styles.bankValue, { color: theme.titleColor }]}>30-71449201-8 (Instituto EduCore)</Text>
                </View>
              </View>

              {/* Selector de Método de Pago */}
              <Text style={[styles.formSectionLabel, { color: theme.titleColor }]}>
                Selecciona el medio utilizado:
              </Text>
              <View style={styles.methodChipsRow}>
                {(['Transferencia Bancaria', 'Mercado Pago', 'Caja Escolar'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.methodChip,
                      { backgroundColor: theme.inputBg, borderColor: theme.border },
                      payMethod === m && styles.methodChipActive,
                    ]}
                    onPress={() => setPayMethod(m)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.methodChipText,
                        { color: payMethod === m ? '#FFFFFF' : theme.subColor },
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Número de Comprobante / Referencia */}
              <Text style={[styles.formSectionLabel, { color: theme.titleColor, marginTop: 14 }]}>
                N° de Comprobante / Referencia de Transferencia:
              </Text>
              <TextInput
                style={[
                  styles.referenceInput,
                  { backgroundColor: theme.inputBg, color: theme.titleColor, borderColor: theme.border },
                ]}
                placeholder="Ej: 9481204812"
                placeholderTextColor={theme.subColor}
                value={payReference}
                onChangeText={setPayReference}
              />

              <View style={[styles.noticeBox, { backgroundColor: isDarkMode ? 'rgba(234,88,12,0.1)' : '#FFF7ED' }]}>
                <MaterialIcons name="info" size={16} color="#EA580C" style={{ marginRight: 6 }} />
                <Text style={[styles.noticeText, { color: isDarkMode ? '#FDBA74' : '#C2410C' }]}>
                  Al confirmar, la cuota quedará asentada como abonada de manera oficial y se generará el recibo con fecha y hora.
                </Text>
              </View>
            </ScrollView>

            {/* Footer Modal con Botón Confirmar */}
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                onPress={() => setSelectedPaymentForPay(null)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelText, { color: theme.subColor }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmPayment}
                disabled={isSubmittingPay}
                activeOpacity={0.8}
              >
                {isSubmittingPay ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalConfirmText}>Confirmar y Asentar Pago</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FamilyTuitionTab;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  // Cabecera Principal
  headerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.3)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // KPI Grid
  kpiContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  kpiValueDate: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  kpiHint: {
    fontSize: 9.5,
    marginTop: 4,
    fontWeight: '500',
  },
  statusPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // Segmented Control
  filterBar: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 3,
    marginBottom: 16,
    gap: 4,
    alignItems: 'center',
  },
  filterTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  filterTabBtnActive: {
    backgroundColor: '#EA580C',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Loading & Empty
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 17,
  },

  // Tarjeta de Cuota
  paymentCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  dueDateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  // Amount Banner
  amountBanner: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  paymentMethodMeta: {
    alignItems: 'flex-end',
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },

  // Breakdown
  breakdownBox: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 6,
  },
  breakdownTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  breakdownItemName: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  breakdownItemVal: {
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 0,
    marginLeft: 6,
  },

  // Historial Banner
  paidHistoryBanner: {
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  paidHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  paidHistoryText: {
    fontSize: 11.5,
    flex: 1,
    minWidth: 160,
  },
  paidHistoryMetaRow: {
    marginLeft: 22,
    marginTop: 2,
  },
  paidMetaLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    lineHeight: 15,
  },

  // Actions
  cardActionsRow: {
    marginTop: 4,
  },
  actionBtnPay: {
    backgroundColor: '#EA580C',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionBtnPayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionBtnReceipt: {
    borderWidth: 1.5,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  actionBtnReceiptText: {
    color: '#10B981',
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalBody: {
    padding: 18,
  },
  bankInfoBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  bankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bankTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  bankDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  bankValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  formSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  methodChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  methodChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  methodChipActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  methodChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  referenceInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    marginBottom: 6,
  },
  noticeText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 2,
    backgroundColor: '#EA580C',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
