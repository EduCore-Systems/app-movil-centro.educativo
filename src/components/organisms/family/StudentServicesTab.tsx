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

      const updateData = {
        deportes: selectedSports,
        usa_comedor: usaComedor,
        diningRoomEnabled: usaComedor,
        transporte_recorrido: routeName,
        transportRouteId: routeId,
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

  return (
    <View style={styles.container}>
      {/* ── CABECERA ── */}
      <View style={styles.headerRow}>
        <View>
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
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(2, 132, 199, 0.12)' }]}>
            <MaterialIcons name="directions-bus" size={20} color="#0284C7" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.cardTitle, { color: theme.titleColor }]}>
              Transporte Escolar <Text style={styles.rfTag}>(RF-17)</Text>
            </Text>
            <Text style={[styles.cardDesc, { color: theme.subColor }]}>
              Logística puerta a puerta con choferes certificados.
            </Text>
          </View>

          {transporteRecorrido !== 'none' ? (
            <View style={styles.confirmedPill}>
              <View style={styles.greenDot} />
              <Text style={styles.confirmedText}>Confirmado</Text>
            </View>
          ) : (
            <View style={[styles.noServicePill, { backgroundColor: theme.boxBg }]}>
              <Text style={[styles.noServiceText, { color: theme.subColor }]}>Sin servicio</Text>
            </View>
          )}
        </View>

        {/* Opciones de Recorrido */}
        <Text style={[styles.fieldLabel, { color: theme.subColor }]}>RECORRIDO ASIGNADO</Text>
        <View style={styles.routeSelector}>
          {RUTAS_TRANSPORTE.map((ruta) => {
            const isSelected = transporteRecorrido === ruta.id;
            return (
              <TouchableOpacity
                key={ruta.id}
                onPress={() => setTransporteRecorrido(ruta.id)}
                style={[
                  styles.routeOption,
                  {
                    backgroundColor: isSelected ? theme.selectedBg : theme.boxBg,
                    borderColor: isSelected ? theme.selectedBorder : theme.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={18}
                  color={isSelected ? '#EA580C' : theme.subColor}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.routeText, { color: theme.titleColor }]}>{ruta.nombre}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(217, 119, 6, 0.12)' }]}>
            <MaterialIcons name="restaurant" size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.cardTitle, { color: theme.titleColor }]}>
              Comedor Escolar <Text style={styles.rfTag}>(RF-17)</Text>
            </Text>
            <Text style={[styles.cardDesc, { color: theme.subColor }]}>
              Almuerzo y colación supervisados por nutricionistas.
            </Text>
          </View>

          <Switch
            value={usaComedor}
            onValueChange={setUsaComedor}
            trackColor={{ false: theme.border, true: '#EA580C' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.diningInfoBox, { backgroundColor: usaComedor ? 'rgba(217, 119, 6, 0.08)' : theme.boxBg }]}>
          <View style={styles.diningStatusRow}>
            <Text style={[styles.diningStatusTitle, { color: theme.titleColor }]}>
              {usaComedor ? 'Plan Nutricional Activo' : 'Servicio Inactivo'}
            </Text>
            {usaComedor && (
              <View style={styles.monthlyBadge}>
                <Text style={styles.monthlyBadgeText}>Mensual</Text>
              </View>
            )}
          </View>
          <Text style={[styles.diningDesc, { color: theme.subColor }]}>
            {usaComedor
              ? 'Menú supervisado por profesionales de la salud. Incluye plato principal, postre y bebida.'
              : 'El estudiante no utiliza el servicio de comedor escolar en este ciclo.'}
          </Text>
        </View>
      </View>

      {/* ── BOTÓN GUARDAR MODIFICACIONES ── */}
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
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
  noServicePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
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
  routeSelector: {
    gap: 6,
  },
  routeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  routeText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
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
  diningInfoBox: {
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  diningStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  diningStatusTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  monthlyBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 8,
  },
  monthlyBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  diningDesc: {
    fontSize: 11,
    marginTop: 4,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 6,
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
