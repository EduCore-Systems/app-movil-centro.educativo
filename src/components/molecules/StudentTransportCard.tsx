import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StudentService, TransportRoute } from '../../services/additionalServices';
import Badge from '../atoms/Badge';

interface StudentTransportCardProps {
  student: StudentService;
  routes: TransportRoute[];
  onAssignRoute: (studentId: string, routeId: string) => void;
  onConfirm: (studentId: string) => void;
  isDarkMode?: boolean;
}

export const StudentTransportCard: React.FC<StudentTransportCardProps> = ({
  student,
  routes,
  onAssignRoute,
  onConfirm,
  isDarkMode = false,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const hasTransport = Boolean(
    student.transportRouteId ||
      (student.transporte_recorrido &&
        student.transporte_recorrido !== 'Sin servicio' &&
        student.transporte_recorrido !== 'No utiliza transporte')
  );
  const isPending = hasTransport && student.transporte_estado === 'pendiente_confirmacion';

  const currentRoute = routes.find(
    (r) => r.id === student.transportRouteId || r.name === student.transporte_recorrido
  );

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    modalBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    chipInactive: isDarkMode ? '#334155' : '#F1F5F9',
    selectBg: currentRoute
      ? isDarkMode
        ? '#431407'
        : '#FFF7ED'
      : isDarkMode
      ? '#334155'
      : '#F8FAFC',
    selectBorder: currentRoute ? '#FDBA74' : isDarkMode ? '#475569' : '#E2E8F0',
    selectText: currentRoute ? '#EA580C' : isDarkMode ? '#94A3B8' : '#64748B',
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      {/* Top Row: Name and Level */}
      <View style={styles.topRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.studentName, { color: theme.titleColor }]} numberOfLines={1}>
            {student.nombre}
          </Text>
        </View>
        <Badge type="nivel" value={student.nivel} isDarkMode={isDarkMode} />
      </View>

      {/* Middle Row: Status Badge & Confirm Button */}
      <View style={styles.statusRow}>
        <Text style={[styles.statusLabel, { color: theme.subColor }]}>Estado:</Text>
        {hasTransport ? (
          isPending ? (
            <View style={styles.pendingRow}>
              <View style={styles.pendingBadge}>
                <View style={styles.amberDot} />
                <Text style={styles.pendingText}>Pendiente</Text>
              </View>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => onConfirm(student.id)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="check" size={14} color="#FFFFFF" />
                <Text style={styles.confirmBtnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.confirmedBadge}>
              <MaterialIcons name="directions-bus" size={14} color="#059669" style={{ marginRight: 4 }} />
              <Text style={styles.confirmedText}>Confirmado</Text>
            </View>
          )
        ) : (
          <View style={styles.sinServicioBadge}>
            <MaterialIcons name="block" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
            <Text style={styles.sinServicioText}>Sin Servicio</Text>
          </View>
        )}
      </View>

      {/* Bottom: Route Selector Dropdown Button */}
      <TouchableOpacity
        style={[styles.selectBtn, { backgroundColor: theme.selectBg, borderColor: theme.selectBorder }]}
        onPress={() => setIsPickerOpen(true)}
        activeOpacity={0.85}
      >
        <MaterialIcons name="alt-route" size={16} color={theme.selectText} style={{ marginRight: 6 }} />
        <Text style={[styles.selectBtnText, { color: theme.selectText }]} numberOfLines={1}>
          {currentRoute ? `${currentRoute.name} ($${currentRoute.cost})` : 'No utiliza transporte'}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={20} color={theme.selectText} />
      </TouchableOpacity>

      {/* Route Picker Modal */}
      <Modal visible={isPickerOpen} transparent animationType="fade" onRequestClose={() => setIsPickerOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.titleColor }]}>Asignar Recorrido</Text>
              <TouchableOpacity onPress={() => setIsPickerOpen(false)}>
                <MaterialIcons name="close" size={22} color={theme.subColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Option: No utiliza transporte */}
              <TouchableOpacity
                style={[
                  styles.routeOption,
                  !currentRoute && styles.routeOptionActive,
                  { borderColor: theme.border },
                ]}
                onPress={() => {
                  onAssignRoute(student.id, '');
                  setIsPickerOpen(false);
                }}
              >
                <View>
                  <Text style={[styles.routeOptionTitle, { color: theme.titleColor }]}>
                    No utiliza transporte
                  </Text>
                  <Text style={[styles.routeOptionSub, { color: theme.subColor }]}>
                    Desvincular al alumno del servicio
                  </Text>
                </View>
                {!currentRoute && <MaterialIcons name="check" size={20} color="#EA580C" />}
              </TouchableOpacity>

              {/* Existing Routes */}
              {routes.map((r) => {
                const isSelected = currentRoute?.id === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.routeOption,
                      isSelected && styles.routeOptionActive,
                      { borderColor: theme.border },
                    ]}
                    onPress={() => {
                      onAssignRoute(student.id, r.id);
                      setIsPickerOpen(false);
                    }}
                  >
                    <View>
                      <Text style={[styles.routeOptionTitle, { color: theme.titleColor }]}>{r.name}</Text>
                      <Text style={styles.routeOptionCost}>${r.cost} / mes</Text>
                    </View>
                    {isSelected && <MaterialIcons name="check" size={20} color="#EA580C" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StudentTransportCard;

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  amberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
    marginRight: 5,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  confirmedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  sinServicioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  sinServicioText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  selectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#33415522',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  routeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  routeOptionActive: {
    borderColor: '#EA580C',
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
  },
  routeOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  routeOptionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  routeOptionCost: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
});
