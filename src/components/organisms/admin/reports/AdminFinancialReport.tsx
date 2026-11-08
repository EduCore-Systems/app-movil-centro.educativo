import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
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
            <MaterialIcons name="account-balance-wallet" size={22} color={isDarkMode ? '#CBD5E1' : '#475569'} />
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
            <MaterialIcons name="payments" size={22} color="#10B981" />
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
            <MaterialIcons name="pending-actions" size={22} color="#EF4444" />
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
            <MaterialIcons name="donut-large" size={22} color="#EA580C" />
          </View>
          <View style={styles.kpiContent}>
            <Text style={[styles.kpiLabel, { color: '#EA580C' }]}>EFECTIVIDAD DE COBRO</Text>
            <Text style={[styles.kpiValue, { color: '#EA580C' }]}>{tasaCobranza}%</Text>
            <Text style={[styles.kpiFooter, { color: theme.subColor }]}>Meta mensual: 80%</Text>
          </View>
        </View>
      </View>

      {/* ── 2. DESGLOSE DE INGRESOS POR CONCEPTO ── */}
      <View style={[styles.desgloseSection, { backgroundColor: theme.desgloseBg, borderColor: theme.border }]}>
        <View style={styles.desgloseHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="pie-chart" size={18} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={[styles.desgloseTitle, { color: theme.titleColor }]}>
              Composición de Ingresos
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
            <Text style={[styles.conceptSub, { color: theme.subColor }]}>Logística micros</Text>
          </View>

          {/* Talleres Deportivos */}
          <View style={[styles.desgloseItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.conceptLabel, { color: '#059669' }]}>TALLERES DEPORTIVOS</Text>
            <Text style={[styles.conceptAmount, { color: theme.titleColor }]}>
              ${totalDeportes.toLocaleString('es-AR')}
            </Text>
            <Text style={[styles.conceptSub, { color: theme.subColor }]}>Extracurriculares</Text>
          </View>
        </View>
      </View>

      {/* ── 3. FILTROS DE LA NÓMINA ── */}
      <View style={styles.nominaHeader}>
        <View>
          <Text style={[styles.nominaTitle, { color: theme.titleColor }]}>
            Nómina de Cobranzas y Morosidad
          </Text>
          <Text style={[styles.nominaSub, { color: theme.subColor }]}>
            Control de cobranzas con acceso a recordatorios por correo a los tutores.
          </Text>
        </View>

        {/* Chips de filtro por Estado */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          <View style={styles.chipRow}>
            {(['todos', 'pagado', 'pendiente'] as const).map((st) => (
              <TouchableOpacity
                key={st}
                onPress={() => setStatusFilter(st)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      statusFilter === st
                        ? '#EA580C'
                        : isDarkMode
                        ? '#334155'
                        : '#F1F5F9',
                    borderColor: statusFilter === st ? '#EA580C' : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color:
                        statusFilter === st
                          ? '#FFFFFF'
                          : isDarkMode
                          ? '#CBD5E1'
                          : '#475569',
                      fontWeight: statusFilter === st ? '800' : '600',
                    },
                  ]}
                >
                  {st === 'todos'
                    ? 'Todos los Estados'
                    : st === 'pagado'
                    ? '✓ Al Día (Pagado)'
                    : '⚠️ En Mora (Pendiente)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Chips de filtro por Nivel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={styles.chipRow}>
            {(['todos', 'inicial', 'primaria', 'secundaria'] as const).map((lvl) => (
              <TouchableOpacity
                key={lvl}
                onPress={() => setLevelFilter(lvl)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      levelFilter === lvl
                        ? '#2563EB'
                        : isDarkMode
                        ? '#1E293B'
                        : '#FFFFFF',
                    borderColor: levelFilter === lvl ? '#2563EB' : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color:
                        levelFilter === lvl
                          ? '#FFFFFF'
                          : isDarkMode
                          ? '#94A3B8'
                          : '#64748B',
                      fontWeight: levelFilter === lvl ? '800' : '600',
                    },
                  ]}
                >
                  {lvl === 'todos' ? 'Todos los Niveles' : lvl.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ── 4. LISTA DE COBRANZAS (CARDS MÓVILES) ── */}
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
                {/* Cabecera de Alumno */}
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

                {/* Info de Tutor y Vencimiento */}
                <View style={[styles.tutorBox, { backgroundColor: isDarkMode ? '#0F172A50' : '#F8FAFC' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tutorEmail, { color: theme.titleColor }]} numberOfLines={1}>
                      {p.parentEmail}
                    </Text>
                    <Text style={[styles.dueDateText, { color: theme.subColor }]}>
                      Vence: {p.dueDate || '10/10/2026'}
                    </Text>
                  </View>

                  {/* Estado Badge */}
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isPaid
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(239, 68, 68, 0.12)',
                        borderColor: isPaid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
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
                        { color: isPaid ? '#059669' : '#DC2626' },
                      ]}
                    >
                      {isPaid ? 'Pagado' : 'Pendiente'}
                    </Text>
                  </View>
                </View>

                {/* Desglose de Conceptos */}
                <View style={styles.desgloseRow}>
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
                      + Transp: ${(p.transportAmount || 0).toLocaleString('es-AR')}
                    </Text>
                  )}
                  {(p.sportsAmount || 0) > 0 && (
                    <Text style={[styles.breakdownItem, { color: '#059669' }]}>
                      + Dep: ${(p.sportsAmount || 0).toLocaleString('es-AR')}
                    </Text>
                  )}
                </View>

                {/* Total Facturado y Acciones */}
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
                      <View style={styles.paidBadgeBox}>
                        <MaterialIcons name="check-circle" size={16} color="#10B981" />
                        <Text style={[styles.paidAtText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                          Abonado {p.paidAt || '04/10'}
                        </Text>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {/* Botón Avisar Deuda */}
                        <TouchableOpacity
                          onPress={() => handleNotifyDebt(p)}
                          disabled={notifState === 'enviando' || notifState === 'enviado'}
                          style={[
                            styles.notifyBtn,
                            notifState === 'enviado' && {
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              borderColor: '#10B981',
                            },
                          ]}
                        >
                          <MaterialIcons
                            name={notifState === 'enviado' ? 'done' : 'mail'}
                            size={14}
                            color={notifState === 'enviado' ? '#059669' : '#EA580C'}
                          />
                          <Text
                            style={[
                              styles.notifyBtnText,
                              { color: notifState === 'enviado' ? '#059669' : '#EA580C' },
                            ]}
                          >
                            {notifState === 'enviado'
                              ? 'Avisado'
                              : notifState === 'enviando'
                              ? 'Enviando...'
                              : 'Avisar'}
                          </Text>
                        </TouchableOpacity>

                        {/* Botón Cobrar en Caja */}
                        <TouchableOpacity
                          onPress={() => handleMarkAsPaid(p)}
                          disabled={isBusy}
                          style={styles.payBtn}
                        >
                          {isBusy ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <MaterialIcons name="check" size={14} color="#FFFFFF" />
                              <Text style={styles.payBtnText}>Cobrar</Text>
                            </>
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
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
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
    marginRight: 4,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  desgloseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  breakdownItem: {
    fontSize: 11,
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
    color: '#0F172A',
  },
  actionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paidBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paidAtText: {
    fontSize: 11,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    borderWidth: 1,
    borderColor: '#EA580C40',
    gap: 4,
  },
  notifyBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#059669',
    gap: 4,
  },
  payBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
