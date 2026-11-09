import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StudentProfileData } from '../../../services/studentService';

interface StudentServicesTabProps {
  student: StudentProfileData;
  isDarkMode?: boolean;
}

interface SportActivity {
  id: string;
  name: string;
  schedule: string;
  enrolled: boolean;
}

export const StudentServicesTab: React.FC<StudentServicesTabProps> = ({
  student,
  isDarkMode = true,
}) => {
  const sportsList: SportActivity[] = [
    {
      id: 'fut-1',
      name: 'Fútbol Intercolegial',
      schedule: 'Lunes y Miércoles · 17:00 hs',
      enrolled: true,
    },
    {
      id: 'bas-1',
      name: 'Básquetbol Juvenil',
      schedule: 'Martes y Jueves · 16:30 hs',
      enrolled: false,
    },
    {
      id: 'nat-1',
      name: 'Natación Formativa',
      schedule: 'Sábados · 10:00 hs',
      enrolled: false,
    },
    {
      id: 'vol-1',
      name: 'Vóleibol Mixto',
      schedule: 'Viernes · 16:00 hs',
      enrolled: false,
    },
    {
      id: 'aje-1',
      name: 'Taller de Ajedrez',
      schedule: 'Miércoles · 15:30 hs',
      enrolled: true,
    },
    {
      id: 'atl-1',
      name: 'Atletismo y Pista',
      schedule: 'Martes y Jueves · 17:30 hs',
      enrolled: false,
    },
  ];

  const enrolledCount = sportsList.filter((s) => s.enrolled).length;
  const maxCupos = 2;
  const isFull = enrolledCount >= maxCupos;

  const theme = {
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    enrolledCardBg: isDarkMode ? '#131B2E' : '#FFF7ED',
    enrolledCardBorder: isDarkMode ? '#39261E' : '#FDBA74',
    blockedCardBg: isDarkMode ? '#0B1120' : '#F8FAFC',
    blockedCardBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    bannerBg: isDarkMode ? '#0B1120' : '#F1F5F9',
    bannerBorder: isDarkMode ? '#1E293B' : '#CBD5E1',
    infoBoxBg: isDarkMode ? '#0B1120' : '#F8FAFC',
  };

  const studentName = student.nombre || 'Mateo Rossi';

  return (
    <View style={styles.container}>
      {/* ── 1. CABECERA GENERAL DE SERVICIOS Y TALLERES ── */}
      <View style={styles.headerBox}>
        <View style={styles.headerTitleRow}>
          <MaterialIcons name="sports-soccer" size={24} color="#EA580C" style={{ marginRight: 8 }} />
          <Text style={[styles.mainTitle, { color: theme.titleColor }]}>
            Servicios y Actividades Extracurriculares
          </Text>
        </View>
        <Text style={[styles.mainSubtitle, { color: theme.subColor }]}>
          Gestión de talleres, alimentación y logística escolar de{' '}
          <Text style={{ fontWeight: '800', color: theme.titleColor }}>{studentName}</Text>
        </Text>
      </View>

      {/* ── 2. SECCIÓN: DEPORTES EXTRACURRICULARES (RF-16) ── */}
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionCardTitle, { color: theme.titleColor }]}>
                Deportes Extracurriculares
              </Text>
              <Text style={[styles.rfText, { color: theme.subColor }]}> (RF-16)</Text>
            </View>
            <Text style={[styles.sectionCardSubtitle, { color: theme.subColor }]}>
              Regla institucional: Máximo de 2 disciplinas simultáneas.
            </Text>
          </View>

          {/* Badge Cupo 2/2 */}
          <View style={styles.cupoBadge}>
            <MaterialIcons name="lock" size={13} color="#EA580C" style={{ marginRight: 4 }} />
            <Text style={styles.cupoBadgeText}>
              {enrolledCount}/{maxCupos} Cupos
            </Text>
          </View>
        </View>

        {/* Barra de progreso de cupos alcanzados */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(enrolledCount / maxCupos) * 100}%` }]} />
          </View>
          <View style={styles.progressLabelsRow}>
            <Text style={[styles.progressLabelLeft, { color: theme.subColor }]}>
              {isFull ? 'Límite reglamentario alcanzado' : `${maxCupos - enrolledCount} cupo disponible`}
            </Text>
            <Text style={styles.progressLabelRight}>
              {isFull ? '100% Ocupado' : `${(enrolledCount / maxCupos) * 100}% Ocupado`}
            </Text>
          </View>
        </View>

        {/* Lista de deportes / talleres */}
        <View style={styles.sportsList}>
          {sportsList.map((sport) => {
            const isEnrolled = sport.enrolled;
            return (
              <View
                key={sport.id}
                style={[
                  styles.sportItemCard,
                  {
                    backgroundColor: isEnrolled ? theme.enrolledCardBg : theme.blockedCardBg,
                    borderColor: isEnrolled ? theme.enrolledCardBorder : theme.blockedCardBorder,
                  },
                ]}
              >
                {/* Ícono Radio o Check */}
                <View style={styles.sportRadioContainer}>
                  {isEnrolled ? (
                    <View style={styles.checkCircleActive}>
                      <MaterialIcons name="check" size={14} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={styles.radioCircleDisabled} />
                  )}
                </View>

                {/* Info del deporte */}
                <View style={styles.sportInfo}>
                  <Text
                    style={[
                      styles.sportTitle,
                      { color: isEnrolled ? theme.titleColor : theme.subColor },
                    ]}
                  >
                    {sport.name}
                  </Text>
                  <Text style={[styles.sportSchedule, { color: theme.subColor }]}>
                    {sport.schedule}
                  </Text>
                </View>

                {/* Estado: Inscripto o Bloqueado */}
                {isEnrolled ? (
                  <View style={styles.inscriptoBadge}>
                    <Text style={styles.inscriptoBadgeText}>Inscripto</Text>
                  </View>
                ) : (
                  <Text style={styles.bloqueadoText}>Bloqueado</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* ── 3. SECCIÓN: TRANSPORTE ESCOLAR (RF-17) ── */}
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.serviceHeaderLeft}>
            <View style={styles.busIconCircle}>
              <MaterialIcons name="directions-bus" size={22} color="#38BDF8" />
            </View>
            <View>
              <Text style={[styles.sectionCardTitle, { color: theme.titleColor }]}>
                Transporte Escolar
              </Text>
              <Text style={[styles.rfText, { color: theme.subColor }]}> (RF-17)</Text>
            </View>
          </View>

          {/* Badge Solicitud Pendiente */}
          <View style={styles.solicitudBadge}>
            <View style={styles.orangeDot} />
            <Text style={styles.solicitudBadgeText}>Solicitud Pendiente</Text>
          </View>
        </View>

        {/* Subcabecera: Recorrido Asignado */}
        <Text style={[styles.fieldSubheader, { color: theme.titleColor }]}>Recorrido Asignado</Text>

        {/* Caja del recorrido con candado de solo lectura */}
        <View style={[styles.assignedRouteBox, { backgroundColor: theme.infoBoxBg, borderColor: theme.border }]}>
          <Text style={[styles.assignedRouteText, { color: theme.titleColor }]} numberOfLines={1}>
            {student.transporte_recorrido || 'Recorrido Norte (Av. Alvear - Sarmiento)'}
          </Text>
          <MaterialIcons name="lock" size={16} color="#64748B" />
        </View>

        {/* Tabla / Ficha técnica de logística */}
        <View style={[styles.logisticsCard, { borderColor: theme.border, backgroundColor: theme.infoBoxBg }]}>
          <View style={styles.logisticsRow}>
            <Text style={[styles.logisticsLabel, { color: theme.subColor }]}>Recorrido asignado:</Text>
            <Text style={[styles.logisticsValue, { color: theme.titleColor }]}>
              Recorrido Norte (Av. Alvear – Sarmiento)
            </Text>
          </View>

          <View style={styles.logisticsRow}>
            <Text style={[styles.logisticsLabel, { color: theme.subColor }]}>Parada estimada:</Text>
            <Text style={[styles.logisticsValue, { color: theme.titleColor }]}>
              Puerta principal · 07:15 hs
            </Text>
          </View>

          <View style={styles.logisticsRow}>
            <Text style={[styles.logisticsLabel, { color: theme.subColor }]}>Móvil asignado:</Text>
            <Text style={[styles.logisticsValue, { color: theme.titleColor }]}>
              Unidad 04 (Carlos Chofer)
            </Text>
          </View>
        </View>
      </View>

      {/* ── 4. SECCIÓN: COMEDOR ESCOLAR (RF-17) ── */}
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.serviceHeaderLeft}>
            <View style={styles.foodIconCircle}>
              <MaterialIcons name="restaurant" size={22} color="#F59E0B" />
            </View>
            <View>
              <Text style={[styles.sectionCardTitle, { color: theme.titleColor }]}>
                Comedor Escolar
              </Text>
              <Text style={[styles.rfText, { color: theme.subColor }]}>
                Almuerzo y colación saludable (RF-17)
              </Text>
            </View>
          </View>

          {/* Badge Solicitud Pendiente */}
          <View style={styles.solicitudBadge}>
            <View style={styles.orangeDot} />
            <Text style={styles.solicitudBadgeText}>Solicitud Pendiente</Text>
          </View>
        </View>

        {/* Plan Nutricional Activo */}
        <View style={[styles.nutritionBox, { backgroundColor: theme.enrolledCardBg, borderColor: theme.enrolledCardBorder }]}>
          <View style={styles.nutritionTopRow}>
            <Text style={[styles.nutritionPlanTitle, { color: theme.titleColor }]}>
              Plan Nutricional Activo
            </Text>
            <View style={styles.mensualBadge}>
              <Text style={styles.mensualBadgeText}>Mensual</Text>
            </View>
          </View>

          <Text style={[styles.nutritionDesc, { color: theme.subColor }]}>
            Menú supervisado por nutricionistas del colegio. Incluye plato principal, postre y colación.
          </Text>
        </View>
      </View>

      {/* ── 5. AVISO INFERIOR: MODO DE SOLO LECTURA ── */}
      <View style={[styles.infoBanner, { backgroundColor: theme.bannerBg, borderColor: theme.bannerBorder }]}>
        <MaterialIcons name="info-outline" size={20} color="#EA580C" style={{ marginRight: 10 }} />
        <Text style={[styles.infoBannerText, { color: theme.subColor }]}>
          <Text style={[styles.infoBannerBold, { color: theme.titleColor }]}>Modo de solo lectura: </Text>
          Las inscripciones y cambios en deportes, transporte y comedor escolar son gestionados exclusivamente por tus tutores legales.
        </Text>
      </View>
    </View>
  );
};

export default StudentServicesTab;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  headerBox: {
    gap: 4,
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  mainSubtitle: {
    fontSize: 12.5,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sectionCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  rfText: {
    fontSize: 12,
  },
  sectionCardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  cupoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.3)',
  },
  cupoBadgeText: {
    color: '#EA580C',
    fontSize: 11.5,
    fontWeight: '800',
  },
  progressBarWrapper: {
    gap: 6,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EA580C',
    borderRadius: 3,
  },
  progressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelLeft: {
    fontSize: 11,
  },
  progressLabelRight: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  sportsList: {
    gap: 8,
  },
  sportItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  sportRadioContainer: {
    marginRight: 12,
  },
  checkCircleActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleDisabled: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#64748B',
    backgroundColor: '#334155',
  },
  sportInfo: {
    flex: 1,
    gap: 2,
  },
  sportTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  sportSchedule: {
    fontSize: 11.5,
  },
  inscriptoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  inscriptoBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  bloqueadoText: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  serviceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  busIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  foodIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  solicitudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.25)',
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
    marginRight: 6,
  },
  solicitudBadgeText: {
    color: '#EA580C',
    fontSize: 11,
    fontWeight: '700',
  },
  fieldSubheader: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  assignedRouteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  assignedRouteText: {
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  logisticsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  logisticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  logisticsLabel: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  logisticsValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  nutritionBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  nutritionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutritionPlanTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  mensualBadge: {
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mensualBadgeText: {
    color: '#EA580C',
    fontSize: 11,
    fontWeight: '800',
  },
  nutritionDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  infoBannerBold: {
    fontWeight: '800',
  },
});
