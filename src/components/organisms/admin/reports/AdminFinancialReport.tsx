import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Badge from '../../../atoms/Badge';
import {
  getPayments,
  markPaymentAsPaid,
  PaymentRecord,
} from '../../../../services/paymentService';

interface AdminFinancialReportProps {
  isDarkMode?: boolean;
}

export const AdminFinancialReport: React.FC<AdminFinancialReportProps> = ({
  isDarkMode = false,
}) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pagado' | 'pendiente'>('todos');
  const [levelFilter, setLevelFilter] = useState<'todos' | 'inicial' | 'primaria' | 'secundaria'>('todos');
  const [notifiedStudents, setNotifiedStudents] = useState<Record<string, 'enviando' | 'enviado'>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modales de dropdown estilo Web
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [levelModalVisible, setLevelModalVisible] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      Alert.alert('Error', 'No se pudieron cargar los registros de facturación.');
    } finally {
      setLoading(false);
    }
  };

  // Simulación formal de envío de correo de aviso de deuda al tutor (RF-06 / RF-07)
  const handleNotifyDebt = (payment: PaymentRecord) => {
    setNotifiedStudents((prev) => ({ ...prev, [payment.id]: 'enviando' }));

    setTimeout(() => {
      setNotifiedStudents((prev) => ({ ...prev, [payment.id]: 'enviado' }));
      Alert.alert(
        'Aviso Enviado',
        `Aviso de deuda enviado correctamente a ${payment.parentEmail || 'tutor'}.\n\nEstudiante: ${
          payment.studentName
        }\nImporte adeudado: $${(payment.totalAmount || 0).toLocaleString('es-AR')}`
      );
    }, 700);
  };

  // Confirmar y registrar cobro en secretaría escolar
  const handleMarkAsPaid = (payment: PaymentRecord) => {
    Alert.alert(
      'Registrar Cobro',
      `¿Confirmar cobro presencial en secretaría para ${payment.studentName} por $${(payment.totalAmount || 0).toLocaleString('es-AR')}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Cobro',
          style: 'default',
          onPress: async () => {
            setProcessingId(payment.id);
            try {
              await markPaymentAsPaid(payment.id);
              await fetchPayments();
              Alert.alert('Éxito', 'Pago registrado como abonado correctamente.');
            } catch (err) {
              console.error('Error al registrar cobro:', err);
              Alert.alert('Error', 'No se pudo actualizar el cobro.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  // --- CÁLCULOS FINANCIEROS GLOBALES ---
  const totalFacturado = payments.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalCobrado = payments
    .filter((p) => p.status === 'pagado')
    .reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalPendiente = payments
    .filter((p) => p.status === 'pendiente')
    .reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const tasaCobranza =
    totalFacturado > 0 ? ((totalCobrado / totalFacturado) * 100).toFixed(1) : '0';

  // Desglose por concepto
  const totalComedor = payments.reduce((acc, p) => acc + (p.diningAmount || 0), 0);
  const totalTransporte = payments.reduce((acc, p) => acc + (p.transportAmount || 0), 0);
  const totalDeportes = payments.reduce((acc, p) => acc + (p.sportsAmount || 0), 0);
  const totalCuotaBase = payments.reduce((acc, p) => acc + (p.baseTuition || 0), 0);

  // Filtrado de la nómina
  const filteredPayments = payments.filter((p) => {
    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;
    const matchesLevel =
      levelFilter === 'todos' || (p.nivel || '').toLowerCase() === levelFilter;
    return matchesStatus && matchesLevel;
  });

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    desgloseBg: isDarkMode ? '#0F172A80' : '#F8FAFC',
    kpiCardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    dropdownBtnBg: isDarkMode ? '#1E293B' : '#0F172A',
    modalBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    modalBorder: isDarkMode ? '#334155' : '#E2E8F0',
  };

  const statusLabelMap: Record<string, string> = {
    todos: 'Todos los Estados',
    pagado: '✓ Al Día (Pagado)',
    pendiente: '⚠️ En Mora (Pendiente)',
  };

  const levelLabelMap: Record<string, string> = {
    todos: 'Todos los Niveles',
    inicial: 'Inicial',
    primaria: 'Primaria',
    secundaria: 'Secundaria',
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#EA580C" />
        <Text style={[styles.loadingText, { color: theme.subColor }]}>
          Procesando balance financiero institucional...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── 1. TARJETAS DE KPIS FINANCIEROS ── */}
      <View style={styles.kpiGrid}>
        {/* KPI 1: Facturación Total */}
        <View style={[styles.kpiCard, { backgroundColor: theme.kpiCardBg, borderColor: theme.border }]}>
          <View style={[styles.kpiIconBox, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
            <MaterialIcons name="account-balance-wallet" size={24} color={isDarkMode ? '#CBD5E1' : '#475569'} />
          </View>
          <View style={styles.kpiContent}>
            <Text style={[styles.kpiLabel, { color: theme.subColor }]}>FACTURACIÓN MES</Text>
            <Text style={[styles.kpiValue, { color: theme.titleColor }]}>
              ${totalFacturado.toLocaleString('es-AR')}
            </Text>
            <Text style={[styles.kpiFooter, { color: theme.subColor }]}>
              {payments.length} Cuotas emitidas
            </Text>
          </View>
        </View>

        {/* KPI 2: Recaudación Percibida */}
        <View style={[styles.kpiCard, { backgroundColor: theme.kpiCardBg, borderColor: theme.border }]}>
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <MaterialIcons name="payments" size={24} color="#10B981" />
          </View>
          <View style={styles.kpiContent}>
            <Text style={[styles.kpiLabel, { color: '#059669' }]}>TOTAL COBRADO</Text>
            <Text style={[styles.kpiValue, { color: '#059669' }]}>
              ${totalCobrado.toLocaleString('es-AR')}
            </Text>
            <Text style={[styles.kpiFooter, { color: '#059669', fontWeight: '700' }]}>
              {payments.filter((p) => p.status === 'pagado').length} Alumnos al día
            </Text>
          </View>
        </View>

        {/* KPI 3: Saldo en Mora */}
        <View style={[styles.kpiCard, { backgroundColor: theme.kpiCardBg, borderColor: theme.border }]}>
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
            <MaterialIcons name="pending-actions" size={24} color="#EF4444" />
          </View>
          <View style={styles.kpiContent}>
            <Text style={[styles.kpiLabel, { color: '#E11D48' }]}>SALDO EN MORA</Text>
            <Text style={[styles.kpiValue, { color: '#E11D48' }]}>
              ${totalPendiente.toLocaleString('es-AR')}
            </Text>
            <Text style={[styles.kpiFooter, { color: '#E11D48', fontWeight: '700' }]}>
              {payments.filter((p) => p.status === 'pendiente').length} Cuotas impagas
            </Text>
          </View>
        </View>

        {/* KPI 4: Tasa de Cobranza */}
        <View style={[styles.kpiCard, { backgroundColor: theme.kpiCardBg, borderColor: theme.border }]}>
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(234, 88, 12, 0.12)' }]}>
            <MaterialIcons name="donut-large" size={24} color="#EA580C" />
          </View>
          <View style={styles.kpiContent}>
            <Text style={[styles.kpiLabel, { color: '#EA580C' }]}>EFECTIVIDAD DE COBRO</Text>
            <Text style={[styles.kpiValue, { color: '#EA580C' }]}>{tasaCobranza}%</Text>
            <Text style={[styles.kpiFooter, { color: theme.subColor }]}>Meta mensual: 80%</Text>
          </View>
        </View>
      </View>

      {/* ── 2. DESGLOSE DE INGRESOS INSTITUCIONALES ── */}
      <View style={[styles.desgloseSection, { backgroundColor: theme.desgloseBg, borderColor: theme.border }]}>
        <View style={styles.desgloseHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="pie-chart" size={18} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={[styles.desgloseTitle, { color: theme.titleColor }]}>
              Composición de Ingresos Institucionales
            </Text>
          </View>
          <Text style={[styles.desgloseCycle, { color: theme.subColor }]}>Ciclo Octubre 2026</Text>
        </View>

        <View style={styles.desgloseGrid}>
          {/* Cuota Pedagógica */}
          <View style={[styles.desgloseItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.conceptLabel, { color: theme.subColor }]}>CUOTA PEDAGÓGICA</Text>
            <Text style={[styles.conceptAmount, { color: theme.titleColor }]}>
              ${totalCuotaBase.toLocaleString('es-AR')}
            </Text>
            <Text style={[styles.conceptSub, { color: theme.subColor }]}>Base obligatoria</Text>
          </View>

          {/* Comedor Escolar */}
          <View style={[styles.desgloseItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.conceptLabel, { color: '#D97706' }]}>COMEDOR ESCOLAR</Text>
            <Text style={[styles.conceptAmount, { color: theme.titleColor }]}>
              ${totalComedor.toLocaleString('es-AR')}
            </Text>
            <Text style={[styles.conceptSub, { color: theme.subColor }]}>Plan nutricional</Text>
          </View>

          {/* Transporte */}
          <View style={[styles.desgloseItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.conceptLabel, { color: '#0284C7' }]}>TRANSPORTE</Text>
            <Text style={[styles.conceptAmount, { color: theme.titleColor }]}>
              ${totalTransporte.toLocaleString('es-AR')}
            </Text>
            <Text style={[styles.conceptSub, { color: theme.subColor }]}>Logística de micros</Text>
          </View>

          {/* Talleres Deportivos */}
          <View style={[styles.desgloseItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.conceptLabel, { color: '#059669' }]}>TALLERES DEPORTIVOS</Text>
            <Text style={[styles.conceptAmount, { color: theme.titleColor }]}>
              ${totalDeportes.toLocaleString('es-AR')}
            </Text>
            <Text style={[styles.conceptSub, { color: theme.subColor }]}>Actividades extracurriculares</Text>
          </View>
        </View>
      </View>

      {/* ── 3. NÓMINA DE COBRANZAS CON DROPDOWNS ESTILO WEB ── */}
      <View style={styles.nominaHeader}>
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.nominaTitle, { color: theme.titleColor }]}>
            Nómina de Cobranzas y Estado de Alumnos
          </Text>
          <Text style={[styles.nominaSub, { color: theme.subColor }]}>
            Listado detallado con acceso a recordatorios de pago por correo a los tutores.
          </Text>
        </View>

        {/* Botones Dropdown estilo Web (píldoras oscuras como en la captura) */}
        <View style={styles.dropdownButtonsRow}>
          {/* Dropdown 1: Estados */}
          <TouchableOpacity
            style={[styles.dropdownPill, { backgroundColor: theme.dropdownBtnBg }]}
            onPress={() => setStatusModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownPillText} numberOfLines={1}>
              {statusLabelMap[statusFilter]}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Dropdown 2: Niveles */}
          <TouchableOpacity
            style={[styles.dropdownPill, { backgroundColor: theme.dropdownBtnBg }]}
            onPress={() => setLevelModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownPillText} numberOfLines={1}>
              {levelLabelMap[levelFilter]}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 4. LISTA DE COBRANZAS (CARDS MÓVILES DETALLADAS) ── */}
      <View style={{ marginTop: 14 }}>
        {filteredPayments.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <MaterialIcons name="search-off" size={40} color={theme.subColor} />
            <Text style={[styles.emptyText, { color: theme.subColor }]}>
              No se encontraron registros con los filtros seleccionados.
            </Text>
          </View>
        ) : (
          filteredPayments.map((p) => {
            const isPaid = p.status === 'pagado';
            const notifState = notifiedStudents[p.id];
            const isBusy = processingId === p.id;

            return (
              <View
                key={p.id}
                style={[
                  styles.paymentCard,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: isPaid ? theme.border : isDarkMode ? '#7F1D1D80' : '#FECDD3',
                  },
                ]}
              >
                {/* Fila Estudiante y Nivel */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.studentName, { color: theme.titleColor }]} numberOfLines={1}>
                      {p.studentName}
                    </Text>
                    <Text style={[styles.studentDni, { color: theme.subColor }]}>
                      DNI: {p.studentDni} · {p.curso || 'Sin curso'}
                    </Text>
                  </View>

                  {/* Badge de Nivel */}
                  <Badge type="nivel" value={p.nivel} isDarkMode={isDarkMode} />
                </View>

                {/* Tutor y Estado */}
                <View style={[styles.tutorBox, { backgroundColor: isDarkMode ? '#0F172A50' : '#F8FAFC' }]}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.tutorEmail, { color: theme.titleColor }]} numberOfLines={1}>
                      {p.parentEmail}
                    </Text>
                    <Text style={[styles.dueDateText, { color: theme.subColor }]}>
                      Vence: {p.dueDate || '10/10/2026'}
                    </Text>
                  </View>

                  {/* Estado Badge estilo Web (• Pendiente / • Pagado) */}
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isPaid ? '#ECFDF5' : '#FEF2F2',
                        borderColor: isPaid ? '#A7F3D0' : '#FECDD3',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: isPaid ? '#10B981' : '#EF4444' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: isPaid ? '#047857' : '#B91C1C' },
                      ]}
                    >
                      {isPaid ? 'Pagado' : 'Pendiente'}
                    </Text>
                  </View>
                </View>

                {/* Desglose de Conceptos */}
                <View style={styles.desgloseContainer}>
                  <Text style={[styles.breakdownItem, { color: theme.subColor }]}>
                    Base: ${(p.baseTuition || 0).toLocaleString('es-AR')}
                  </Text>
                  {(p.diningAmount || 0) > 0 && (
                    <Text style={[styles.breakdownItem, { color: '#D97706' }]}>
                      + Comedor: ${(p.diningAmount || 0).toLocaleString('es-AR')}
                    </Text>
                  )}
                  {(p.transportAmount || 0) > 0 && (
                    <Text style={[styles.breakdownItem, { color: '#0284C7' }]}>
                      + Transporte: ${(p.transportAmount || 0).toLocaleString('es-AR')}
                    </Text>
                  )}
                  {(p.sportsAmount || 0) > 0 && (
                    <Text style={[styles.breakdownItem, { color: '#059669' }]}>
                      + Deportes: ${(p.sportsAmount || 0).toLocaleString('es-AR')}
                    </Text>
                  )}
                </View>

                {/* Footer: Total Facturado y Acciones */}
                <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                  <View>
                    <Text style={[styles.totalLabel, { color: theme.subColor }]}>TOTAL FACTURADO</Text>
                    <Text style={[styles.totalAmount, { color: theme.titleColor }]}>
                      ${(p.totalAmount || 0).toLocaleString('es-AR')}
                    </Text>
                  </View>

                  {/* Acciones */}
                  <View style={styles.actionsBox}>
                    {isPaid ? (
                      <Text style={[styles.paidAtText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                        Abonado {p.paidAt || '04/10/2026'}
                      </Text>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {/* Botón Avisar Deuda */}
                        <TouchableOpacity
                          onPress={() => handleNotifyDebt(p)}
                          disabled={notifState === 'enviando' || notifState === 'enviado'}
                          style={[
                            styles.notifyBtn,
                            notifState === 'enviado' && {
                              backgroundColor: '#ECFDF5',
                              borderColor: '#10B981',
                            },
                          ]}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons
                            name={notifState === 'enviado' ? 'done' : 'mail-outline'}
                            size={15}
                            color={notifState === 'enviado' ? '#047857' : '#EA580C'}
                          />
                          <Text
                            style={[
                              styles.notifyBtnText,
                              { color: notifState === 'enviado' ? '#047857' : '#EA580C' },
                            ]}
                          >
                            {notifState === 'enviado'
                              ? 'Avisado'
                              : notifState === 'enviando'
                              ? 'Enviando...'
                              : 'Avisar'}
                          </Text>
                        </TouchableOpacity>

                        {/* Botón Cobrar en Caja (icono de check en círculo) */}
                        <TouchableOpacity
                          onPress={() => handleMarkAsPaid(p)}
                          disabled={isBusy}
                          style={styles.payIconBtn}
                          activeOpacity={0.7}
                        >
                          {isBusy ? (
                            <ActivityIndicator size="small" color="#059669" />
                          ) : (
                            <MaterialIcons name="check-circle" size={22} color="#059669" />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* ── MODAL DROPDOWN ESTADOS ── */}
      <Modal visible={statusModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setStatusModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.modalBg, borderColor: theme.modalBorder }]}>
              <Text style={[styles.modalTitle, { color: theme.titleColor }]}>Filtrar por Estado</Text>
              {(['todos', 'pagado', 'pendiente'] as const).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.modalOption,
                    statusFilter === st && { backgroundColor: isDarkMode ? '#33415550' : '#F8FAFC' },
                  ]}
                  onPress={() => {
                    setStatusFilter(st);
                    setStatusModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: statusFilter === st ? '#EA580C' : theme.titleColor },
                      statusFilter === st && { fontWeight: '700' },
                    ]}
                  >
                    {statusLabelMap[st]}
                  </Text>
                  {statusFilter === st && (
                    <MaterialIcons name="check" size={18} color="#EA580C" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── MODAL DROPDOWN NIVELES ── */}
      <Modal visible={levelModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setLevelModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.modalBg, borderColor: theme.modalBorder }]}>
              <Text style={[styles.modalTitle, { color: theme.titleColor }]}>Filtrar por Nivel</Text>
              {(['todos', 'inicial', 'primaria', 'secundaria'] as const).map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.modalOption,
                    levelFilter === lvl && { backgroundColor: isDarkMode ? '#33415550' : '#F8FAFC' },
                  ]}
                  onPress={() => {
                    setLevelFilter(lvl);
                    setLevelModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: levelFilter === lvl ? '#2563EB' : theme.titleColor },
                      levelFilter === lvl && { fontWeight: '700' },
                    ]}
                  >
                    {levelLabelMap[lvl]}
                  </Text>
                  {levelFilter === lvl && (
                    <MaterialIcons name="check" size={18} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default AdminFinancialReport;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  kpiGrid: {
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  kpiContent: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  kpiFooter: {
    fontSize: 11,
    marginTop: 2,
  },
  desgloseSection: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  desgloseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  desgloseTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  desgloseCycle: {
    fontSize: 11,
    fontWeight: '600',
  },
  desgloseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  desgloseItem: {
    flex: 1,
    minWidth: '47%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  conceptLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  conceptAmount: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  conceptSub: {
    fontSize: 10,
    marginTop: 2,
  },
  nominaHeader: {
    marginBottom: 6,
  },
  nominaTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  nominaSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  dropdownButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  dropdownPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
    elevation: 1,
  },
  dropdownPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    marginRight: 4,
  },
  emptyBox: {
    padding: 32,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  paymentCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
  },
  studentDni: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  tutorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  tutorEmail: {
    fontSize: 12,
    fontWeight: '600',
  },
  dueDateText: {
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  desgloseContainer: {
    flexDirection: 'column',
    gap: 2,
    marginBottom: 10,
    paddingLeft: 4,
  },
  breakdownItem: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 1,
  },
  actionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paidAtText: {
    fontSize: 11,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 4,
  },
  notifyBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  payIconBtn: {
    padding: 4,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
