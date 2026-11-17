import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { FamilyStudent } from '../../../services/familyService';

interface StudentServicesTabProps {
  student: FamilyStudent;
  isDarkMode?: boolean;
  onStudentUpdated?: (updated: FamilyStudent) => void;
}

interface SportOption {
  id: string;
  nombre: string;
  dias: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const DEPORTES_DISPONIBLES: SportOption[] = [
  { id: 'XjMjzVd0XVwv0jJSa24c', nombre: 'Fútbol Intercolegial', dias: 'Lunes y Miércoles · 17:00 hs', icon: 'sports-soccer' },
  { id: 'iv6ahBrUCK0WdhZSw68a', nombre: 'Básquetbol Juvenil', dias: 'Martes y Jueves · 16:30 hs', icon: 'sports-basketball' },
  { id: 'IX1EM4Ximi9OzrZXJcGB', nombre: 'Natación Formativa', dias: 'Sábados · 10:00 hs', icon: 'pool' },
  { id: 'GX6lOytYeT0iO9g5GZt5', nombre: 'Vóleibol Mixto', dias: 'Viernes · 16:00 hs', icon: 'sports-volleyball' },
  { id: '5lW9VLF6xaD7dMILDixr', nombre: 'Taller de Ajedrez', dias: 'Miércoles · 15:30 hs', icon: 'extension' },
  { id: 'p7RnwuVEKZ4SLRL5NusH', nombre: 'Atletismo y Pista', dias: 'Martes y Jueves · 17:30 hs', icon: 'directions-run' },
];

const RUTAS_TRANSPORTE = [
  { id: 'none', nombre: 'No utiliza servicio de transporte' },
  { id: '4J7lRQ51zVgvXEkFL1vv', nombre: 'Recorrido Norte (Av. Alvear - Sarmiento)' },
  { id: 'FH7u86JtSZHreMtGkNWd', nombre: 'Recorrido Sur (Av. Castelli - Barranqueras)' },
  { id: 'KjLdXKB0RV3e76HJ1awi', nombre: 'Recorrido Oeste (Fontana - Av. 25 de Mayo)' },
  { id: 'U4nEWD5XseWIdICr6w1g', nombre: 'Recorrido Este (Costanera - Corrientes)' },
];

export const StudentServicesTab: React.FC<StudentServicesTabProps> = ({
  student,
  isDarkMode = false,
  onStudentUpdated,
}) => {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [usaComedor, setUsaComedor] = useState(false);
  const [transporteRecorrido, setTransporteRecorrido] = useState<string>('none');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (student) {
      setSelectedSports(Array.isArray(student.deportes) ? student.deportes : []);
      setUsaComedor(Boolean(student.usa_comedor || student.diningRoomEnabled));

      const rawRoute = student.transportRouteId || student.transporte_recorrido;
      if (!rawRoute || rawRoute === 'none' || rawRoute === 'Sin servicio') {
        setTransporteRecorrido('none');
      } else {
        const match = RUTAS_TRANSPORTE.find((r) => r.id === rawRoute || r.nombre === rawRoute);
        setTransporteRecorrido(match ? match.id : rawRoute);
      }
      setSaveSuccess(false);
    }
  }, [student]);

  // Manejo de Deportes con tope de 2
  const handleSportToggle = (sportId: string) => {
    if (selectedSports.includes(sportId)) {
      setSelectedSports(selectedSports.filter((id) => id !== sportId));
    } else {
      if (selectedSports.length >= 2) {
        Alert.alert(
          'Límite de Cupos (RF-16)',
          'Regla institucional: Un alumno solo puede inscribirse en un máximo de 2 deportes extracurriculares simultáneos.'
        );
        return;
      }
      setSelectedSports([...selectedSports, sportId]);
    }
  };

  // Detección de cambios
  const initialSports = Array.isArray(student?.deportes) ? [...student.deportes].sort() : [];
  const currentSports = [...selectedSports].sort();
  const sportsChanged =
    initialSports.length !== currentSports.length ||
    initialSports.some((val, idx) => val !== currentSports[idx]);

  const initialComedor = Boolean(student?.usa_comedor || student?.diningRoomEnabled);
  const comedorChanged = initialComedor !== usaComedor;

  const currentRouteMatch = RUTAS_TRANSPORTE.find(
    (r) => r.id === student?.transportRouteId || r.nombre === student?.transporte_recorrido
  );
  const initialRoute = currentRouteMatch
    ? currentRouteMatch.id
    : student?.transportRouteId || student?.transporte_recorrido || 'none';
  const transportChanged = initialRoute !== transporteRecorrido;

  const hasChanges = sportsChanged || comedorChanged || transportChanged;
  const isLimitReached = selectedSports.length >= 2;

  // Estado real de transporte (Pendiente / Confirmado / Sin servicio)
  const isTransportActive = Boolean(transporteRecorrido && transporteRecorrido !== 'none');
  const isTransportConfirmed = student?.transporte_estado === 'confirmado';

  // Estado real de comedor (Pendiente / Confirmado / Inactivo)
  const isDiningActive = Boolean(usaComedor);
  const isDiningConfirmed = student?.comedor_estado === 'confirmado';

  // Guardar en Firestore
  const handleSaveChanges = async () => {
    if (!student?.id) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const studentRef = doc(db, 'students', student.id);
      const selectedRouteObj = RUTAS_TRANSPORTE.find((r) => r.id === transporteRecorrido);
      const routeName = selectedRouteObj ? selectedRouteObj.nombre : (transporteRecorrido === 'none' ? 'Sin servicio' : transporteRecorrido);
      const routeId = transporteRecorrido === 'none' ? null : (selectedRouteObj ? selectedRouteObj.id : transporteRecorrido);

      const isRouteDiff = (routeId || null) !== (student?.transportRouteId || null);
      const nuevoTransporteEstado = !routeId
        ? 'sin_servicio'
        : isRouteDiff
        ? 'pendiente_confirmacion'
        : (student?.transporte_estado || 'pendiente_confirmacion');

      const isDiningDiff = Boolean(usaComedor) !== Boolean(student?.diningRoomEnabled || student?.usa_comedor);
      const nuevoComedorEstado = !usaComedor
        ? 'sin_servicio'
        : isDiningDiff
        ? 'pendiente_confirmacion'
        : (student?.comedor_estado || 'pendiente_confirmacion');

      const updateData = {
        deportes: selectedSports,
        usa_comedor: usaComedor,
        diningRoomEnabled: usaComedor,
        transporte_recorrido: routeName,
        transportRouteId: routeId,
        transporte_estado: nuevoTransporteEstado,
        comedor_estado: nuevoComedorEstado,
        servicios_ultima_solicitud: new Date().toISOString(),
      };

      await updateDoc(studentRef, updateData);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);

      if (onStudentUpdated) {
        onStudentUpdated({
          ...student,
          ...updateData,
        });
      }
      Alert.alert('Éxito', 'Las modificaciones de servicios fueron guardadas correctamente.');
    } catch (err) {
      console.error('Error al guardar servicios:', err);
      Alert.alert('Error', 'No se pudieron guardar las modificaciones en la base de datos.');
    } finally {
      setIsSaving(false);
    }
  };

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    selectedBg: isDarkMode ? 'rgba(234, 88, 12, 0.15)' : '#FFF7ED',
    selectedBorder: '#EA580C',
    boxBg: isDarkMode ? '#0F172A' : '#F8FAFC',
  };

  const selectedRouteLabel =
    RUTAS_TRANSPORTE.find((r) => r.id === transporteRecorrido)?.nombre || 'No utiliza servicio de transporte';

  return (
    <View style={styles.container}>
      {/* ── CABECERA ── */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="sports-soccer" size={22} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: theme.titleColor }]}>
              Servicios y Actividades
            </Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.subColor }]}>
            Talleres, transporte y logística escolar de {student?.nombre}
          </Text>
        </View>

        {saveSuccess && (
          <View style={styles.successPill}>
            <MaterialIcons name="check-circle" size={14} color="#059669" style={{ marginRight: 4 }} />
            <Text style={styles.successPillText}>Sincronizado</Text>
          </View>
        )}
      </View>

      {/* ── SECCIÓN 1: DEPORTES EXTRACURRICULARES (RF-16) ── */}
      <View style={[styles.serviceCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.titleColor }]}>
              Deportes Extracurriculares <Text style={styles.rfTag}>(RF-16)</Text>
            </Text>
            <Text style={[styles.cardDesc, { color: theme.subColor }]}>
              Regla institucional: Máximo de 2 disciplinas simultáneas.
            </Text>
          </View>

          <View style={[styles.cupoBadge, { backgroundColor: isLimitReached ? 'rgba(234, 88, 12, 0.2)' : theme.boxBg }]}>
            <Text style={[styles.cupoBadgeText, { color: isLimitReached ? '#EA580C' : theme.titleColor }]}>
              {selectedSports.length} / 2 Cupos
            </Text>
          </View>
        </View>

        {/* Barra de Progreso de Cupos */}
        <View style={[styles.progressBarTrack, { backgroundColor: theme.boxBg }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: selectedSports.length === 2 ? '100%' : selectedSports.length === 1 ? '50%' : '0%',
                backgroundColor: isLimitReached ? '#EA580C' : '#F59E0B',
              },
            ]}
          />
        </View>

        {/* Lista de Deportes */}
        <View style={styles.sportsList}>
          {DEPORTES_DISPONIBLES.map((sport) => {
            const isChecked = selectedSports.includes(sport.id);
            const isDisabled = !isChecked && isLimitReached;

            return (
              <TouchableOpacity
                key={sport.id}
                onPress={() => handleSportToggle(sport.id)}
                disabled={isDisabled}
                style={[
                  styles.sportItem,
                  {
                    backgroundColor: isChecked ? theme.selectedBg : theme.boxBg,
                    borderColor: isChecked ? theme.selectedBorder : theme.border,
                    opacity: isDisabled ? 0.45 : 1,
                  },
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.sportLeft}>
                  <View style={[styles.checkboxBox, { borderColor: isChecked ? '#EA580C' : theme.subColor }]}>
                    {isChecked && <MaterialIcons name="check" size={14} color="#EA580C" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sportName, { color: theme.titleColor }]}>{sport.nombre}</Text>
                    <Text style={[styles.sportDays, { color: theme.subColor }]}>{sport.dias}</Text>
                  </View>
                </View>

                {isChecked ? (
                  <View style={styles.inscriptoPill}>
                    <Text style={styles.inscriptoText}>Inscripto</Text>
                  </View>
                ) : isDisabled ? (
                  <Text style={[styles.bloqueadoText, { color: theme.subColor }]}>Bloqueado</Text>
                ) : (
                  <Text style={[styles.disponibleText, { color: theme.subColor }]}>Disponible</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── SECCIÓN 2: TRANSPORTE ESCOLAR (RF-17) ── */}
      <View style={[styles.serviceCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          {/* Ícono 100% redondo */}
          <View style={[styles.iconCircleRound, { backgroundColor: 'rgba(2, 132, 199, 0.12)' }]}>
            <MaterialIcons name="directions-bus" size={20} color="#0284C7" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.cardTitle, { color: theme.titleColor }]} maxFontSizeMultiplier={1.2}>
              Transporte Escolar <Text style={styles.rfTag}>(RF-17)</Text>
            </Text>
          </View>

          {/* Estado de Transporte: Confirmado / Solicitud Pendiente / Sin servicio */}
          {isTransportActive ? (
            isTransportConfirmed ? (
              <View style={styles.confirmedPill}>
                <View style={styles.greenDot} />
                <Text style={styles.confirmedText} maxFontSizeMultiplier={1.1}>Confirmado</Text>
              </View>
            ) : (
              <View style={styles.pendingPill}>
                <View style={styles.amberDot} />
                <Text style={styles.pendingText} maxFontSizeMultiplier={1.1}>Solicitud Pendiente</Text>
              </View>
            )
          ) : (
            <View style={[styles.noServicePill, { backgroundColor: theme.boxBg, borderColor: theme.border }]}>
              <Text style={[styles.noServiceText, { color: theme.subColor }]} maxFontSizeMultiplier={1.1}>Sin servicio</Text>
            </View>
          )}
        </View>

        <Text style={[styles.cardDesc, { color: theme.subColor, marginBottom: 12 }]} maxFontSizeMultiplier={1.15}>
          Logística puerta a puerta con choferes certificados.
        </Text>

        {/* Desplegable interactivo para elegir el recorrido */}
        <Text style={[styles.fieldLabel, { color: theme.subColor }]} maxFontSizeMultiplier={1.1}>RECORRIDO ASIGNADO</Text>
        
        <TouchableOpacity
          onPress={() => setIsDropdownOpen((prev) => !prev)}
          style={[
            styles.dropdownTrigger,
            {
              backgroundColor: theme.boxBg,
              borderColor: isDropdownOpen ? '#EA580C' : theme.border,
            },
          ]}
          activeOpacity={0.8}
        >
          <View style={styles.dropdownLeft}>
            <MaterialIcons
              name="directions-bus"
              size={18}
              color={transporteRecorrido !== 'none' ? '#EA580C' : theme.subColor}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.dropdownSelectedText, { color: theme.titleColor }]} numberOfLines={1} maxFontSizeMultiplier={1.15}>
              {selectedRouteLabel}
            </Text>
          </View>
          <View style={styles.dropdownChevronBox}>
            <MaterialIcons
              name={isDropdownOpen ? 'expand-less' : 'expand-more'}
              size={22}
              color={theme.subColor}
            />
          </View>
        </TouchableOpacity>

        {/* Opciones desplegables */}
        {isDropdownOpen && (
          <View style={[styles.dropdownMenu, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {RUTAS_TRANSPORTE.map((ruta) => {
              const isSelected = transporteRecorrido === ruta.id;
              return (
                <TouchableOpacity
                  key={ruta.id}
                  onPress={() => {
                    setTransporteRecorrido(ruta.id);
                    setIsDropdownOpen(false);
                  }}
                  style={[
                    styles.dropdownItem,
                    isSelected && { backgroundColor: theme.selectedBg },
                  ]}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
                    size={18}
                    color={isSelected ? '#EA580C' : theme.subColor}
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    style={[
                      styles.dropdownItemText,
                      {
                        color: isSelected ? '#EA580C' : theme.titleColor,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {ruta.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {transporteRecorrido !== 'none' && (
          <View style={styles.transportDetailBox}>
            <Text style={styles.transportDetailText}>
              📍 <Text style={{ fontWeight: '700' }}>Parada:</Text> Puerta principal · 07:15 hs
            </Text>
            <Text style={styles.transportDetailText}>
              🚌 <Text style={{ fontWeight: '700' }}>Móvil:</Text> Unidad 04 (Carlos Chofer)
            </Text>
          </View>
        )}
      </View>

      {/* ── SECCIÓN 3: COMEDOR ESCOLAR (RF-17) ── */}
      <View style={[styles.serviceCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          {/* Ícono 100% redondo */}
          <View style={[styles.iconCircleRound, { backgroundColor: 'rgba(217, 119, 6, 0.12)' }]}>
            <MaterialIcons name="restaurant" size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.cardTitle, { color: theme.titleColor }]} maxFontSizeMultiplier={1.2}>
              Comedor Escolar <Text style={styles.rfTag}>(RF-17)</Text>
            </Text>
          </View>

          <Switch
            value={usaComedor}
            onValueChange={setUsaComedor}
            trackColor={{ false: theme.border, true: '#EA580C' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Fila intermedia con descripción y píldora de estado */}
        <View style={styles.serviceMetaRow}>
          <Text style={[styles.cardDesc, { color: theme.subColor, flex: 1, marginRight: 8 }]} maxFontSizeMultiplier={1.15}>
            Almuerzo y colación supervisados por nutricionistas.
          </Text>
          {isDiningActive ? (
            isDiningConfirmed ? (
              <View style={styles.confirmedPill}>
                <View style={styles.greenDot} />
                <Text style={styles.confirmedText} maxFontSizeMultiplier={1.1}>Confirmado</Text>
              </View>
            ) : (
              <View style={styles.pendingPill}>
                <View style={styles.amberDot} />
                <Text style={styles.pendingText} maxFontSizeMultiplier={1.1}>Solicitud Pendiente</Text>
              </View>
            )
          ) : (
            <View style={[styles.noServicePill, { backgroundColor: theme.boxBg, borderColor: theme.border }]}>
              <Text style={[styles.noServiceText, { color: theme.subColor }]} maxFontSizeMultiplier={1.1}>Inactivo</Text>
            </View>
          )}
        </View>

        <View style={[styles.diningInfoBox, { backgroundColor: usaComedor ? 'rgba(217, 119, 6, 0.08)' : theme.boxBg }]}>
          <View style={styles.diningStatusRow}>
            <Text style={[styles.diningStatusTitle, { color: theme.titleColor }]} maxFontSizeMultiplier={1.15}>
              {usaComedor ? 'Plan Nutricional Activo' : 'Servicio Inactivo'}
            </Text>
            {usaComedor && (
              <View style={styles.monthlyBadge}>
                <Text style={styles.monthlyBadgeText} maxFontSizeMultiplier={1.1}>Mensual</Text>
              </View>
            )}
          </View>
          <Text style={[styles.diningDesc, { color: theme.subColor }]} maxFontSizeMultiplier={1.15}>
            {usaComedor
              ? 'Menú supervisado por profesionales de la salud. Incluye plato principal, postre y bebida.'
              : 'El estudiante no utiliza el servicio de comedor escolar en este ciclo.'}
          </Text>
        </View>
      </View>

      {/* ── BOTÓN GUARDAR MODIFICACIONES (Con margen inferior amplio) ── */}
      <View style={styles.saveBtnContainer}>
        <TouchableOpacity
          onPress={handleSaveChanges}
          disabled={!hasChanges || isSaving}
          style={[
            styles.saveBtn,
            {
              backgroundColor: hasChanges ? '#EA580C' : (isDarkMode ? '#334155' : '#CBD5E1'),
              opacity: hasChanges && !isSaving ? 1 : 0.6,
            },
          ]}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name={hasChanges ? 'save' : 'check'} size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>
                {hasChanges ? 'Guardar Modificaciones' : 'Sin cambios pendientes'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StudentServicesTab;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  successPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  successPillText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  serviceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  // Contorno 100% redondo
  iconCircleRound: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  rfTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EA580C',
  },
  cardDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  cupoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cupoBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sportsList: {
    gap: 8,
  },
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  sportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sportName: {
    fontSize: 13,
    fontWeight: '700',
  },
  sportDays: {
    fontSize: 11,
    marginTop: 2,
  },
  inscriptoPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inscriptoText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  bloqueadoText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  disponibleText: {
    fontSize: 10,
  },
  confirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  confirmedText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  amberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 4,
  },
  pendingText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
  },
  noServicePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  noServiceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  dropdownChevronBox: {
    paddingLeft: 4,
    paddingRight: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownSelectedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownMenu: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  dropdownItemText: {
    fontSize: 12.5,
  },
  transportDetailBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    gap: 4,
  },
  transportDetailText: {
    fontSize: 11,
    color: '#0284C7',
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  diningInfoBox: {
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  diningStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  diningStatusTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  monthlyBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  monthlyBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  diningDesc: {
    fontSize: 11,
    marginTop: 4,
  },
  saveBtnContainer: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
