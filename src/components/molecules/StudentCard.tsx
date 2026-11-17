import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Badge from '../atoms/Badge';
import ActionButton from '../atoms/ActionButton';

export interface Student {
  id: string;
  nombre?: string;
  dni?: string;
  nivel?: string;
  status?: string;
  studentID_login?: string;
  emailPadre?: string;
  tutorNombre?: string;
  tutorDni?: string;
  genero?: string;
  alumnoClaveEstado?: string;
  tutorClaveEstado?: string;
  fechaNacimiento?: string;
  telefonoTutor?: string;
  [key: string]: any;
}

interface StudentCardProps {
  item: Student;
  isDarkMode?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({ item, isDarkMode = false }) => {
  const theme = {
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    cardBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    divider: isDarkMode ? '#1E293B' : '#F1F5F9',
    actionPillBg: isDarkMode ? '#1E293B' : '#F1F5F9',
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{item.nombre}</Text>
          <Text style={[styles.subInfo, { color: theme.textSecondary }]}>
            {item.studentID_login || item.id} | DNI: {item.dni || 'S/D'} | Género: {item.genero || 'No especificado'}
          </Text>
        </View>
        <Badge type="nivel" value={item.nivel} isDarkMode={isDarkMode} />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      <View style={styles.tutorBox}>
        <Text style={[styles.tutorName, { color: theme.textPrimary }]}>
          {item.tutorNombre || 'Familia'}
        </Text>
        <Text style={[styles.tutorText, { color: theme.textSecondary }]}>
          {item.emailPadre || 'Sin correo registrado'}
        </Text>
        <Text style={[styles.tutorText, { color: theme.textSecondary }]}>
          DNI: {item.tutorDni || 'S/D'}
        </Text>
      </View>

      <View style={styles.clavesRow}>
        <Badge type="clave" value={`Alumno: ${item.alumnoClaveEstado || 'Cambiada'}`} isDarkMode={isDarkMode} />
        <Badge type="clave" value={`Tutor: ${item.tutorClaveEstado || 'Cambiada'}`} isDarkMode={isDarkMode} />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      <View style={styles.actionsContainer}>
        <View style={[styles.actionRowPill, { backgroundColor: theme.actionPillBg }]}>
          <Text style={styles.labelAlumno}>ALUMNO:</Text>
          <ActionButton
            type="lock-reset"
            isDarkMode={isDarkMode}
            onPress={() => {
              Alert.alert(
                'Restablecer Clave de Alumno',
                `¿Deseas restablecer la clave de ${item.nombre} a su DNI (${item.dni}) por defecto?`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Restablecer', onPress: () => Alert.alert('Completado', `Clave de ${item.nombre} restablecida al DNI.`) },
                ]
              );
            }}
          />
          <ActionButton
            type="edit"
            isDarkMode={isDarkMode}
            onPress={() => {
              Alert.alert('Editar Alumno', `Edición de datos para ${item.nombre} (DNI: ${item.dni}).`);
            }}
          />
        </View>

        <View style={[styles.actionRowPill, { backgroundColor: theme.actionPillBg }]}>
          <Text style={styles.labelTutor}>TUTOR:</Text>
          <ActionButton
            type="lock-reset"
            isDarkMode={isDarkMode}
            onPress={() => {
              Alert.alert(
                'Restablecer Clave del Tutor',
                `¿Deseas restablecer la clave del tutor (${item.tutorNombre}) a su DNI (${item.tutorDni || 'por defecto'})?`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Restablecer', onPress: () => Alert.alert('Completado', `Clave del tutor restablecida al DNI.`) },
                ]
              );
            }}
          />
          <ActionButton
            type="edit"
            isDarkMode={isDarkMode}
            onPress={() => {
              Alert.alert('Editar Tutor', `Edición de datos para ${item.tutorNombre} (${item.emailPadre}).`);
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  subInfo: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  tutorBox: {
    marginBottom: 10,
  },
  tutorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  tutorText: {
    fontSize: 12,
    marginTop: 2,
  },
  clavesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionRowPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  labelAlumno: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  labelTutor: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366F1',
  },
});

export default StudentCard;
