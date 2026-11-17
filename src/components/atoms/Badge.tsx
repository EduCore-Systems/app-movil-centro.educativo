import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type BadgeType = 'nivel' | 'clave' | 'rol' | 'admin-level' | 'curso' | 'profesor' | 'horario-tipo';

interface BadgeProps {
  type: BadgeType;
  value?: string;
  isDarkMode?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ type, value = '', isDarkMode = false }) => {
  if (type === 'admin-level') {
    return (
      <View style={styles.adminLevelBadge}>
        <View style={styles.greenDot} />
        <Text style={styles.adminLevelText}>{value || 'Nivel Adm'}</Text>
      </View>
    );
  }

  if (type === 'nivel') {
    const valUpper = (value || 'INICIAL').toUpperCase();
    return (
      <View style={[styles.nivelPill, isDarkMode && { backgroundColor: '#334155' }]}>
        <Text style={[styles.nivelPillText, isDarkMode && { color: '#CBD5E1' }]}>{valUpper}</Text>
      </View>
    );
  }

  if (type === 'curso') {
    return (
      <View style={[styles.cursoPill, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <Text style={[styles.cursoPillText, isDarkMode && { color: '#93C5FD' }]}>{value || 'Sin curso'}</Text>
      </View>
    );
  }

  if (type === 'profesor') {
    const isUnassigned = !value || value.toLowerCase().includes('sin asignar');
    if (isUnassigned) {
      return (
        <View style={[styles.sinAsignarPill, isDarkMode && { backgroundColor: '#450A0A', borderColor: '#7F1D1D' }]}>
          <Text style={[styles.sinAsignarPillText, isDarkMode && { color: '#F87171' }]}>
            Sin asignar
          </Text>
        </View>
      );
    }
    return (
      <View style={[styles.profesorPill, isDarkMode && { backgroundColor: '#064E3B', borderColor: '#059669' }]}>
        <Text style={[styles.profesorPillText, isDarkMode && { color: '#6EE7B7' }]}>
          {value}
        </Text>
      </View>
    );
  }

  if (type === 'horario-tipo') {
    const isMateria = value.toLowerCase().includes('materia') || value.toLowerCase() === 'subject';
    return (
      <View
        style={[
          styles.horarioTipoPill,
          isMateria ? styles.materiaPill : styles.deportePill,
          isDarkMode && (isMateria ? { backgroundColor: '#1E1B4B' } : { backgroundColor: '#451A03' }),
        ]}
      >
        <Text
          style={[
            styles.horarioTipoText,
            isMateria ? styles.materiaText : styles.deporteText,
            isDarkMode && (isMateria ? { color: '#A5B4FC' } : { color: '#FDBA74' }),
          ]}
        >
          {isMateria ? 'MATERIA' : 'DEPORTE'}
        </Text>
      </View>
    );
  }

  if (type === 'clave') {
    const isTemporal = value.toLowerCase().includes('temporal');
    return (
      <View style={isTemporal ? styles.amberDotPill : styles.greenDotPill}>
        <View style={[styles.greenDot, isTemporal && { backgroundColor: '#F59E0B' }]} />
        <Text style={[styles.greenDotText, isTemporal && { color: '#FCD34D' }]}>
          {value || (isTemporal ? 'Temporal (DNI)' : 'Clave Segura')}
        </Text>
      </View>
    );
  }

  if (type === 'rol') {
    const isAdmin = value.toLowerCase().includes('admin');
    const isDocente = value.toLowerCase().includes('docente') || value.toLowerCase().includes('staff');
    const displayRole = isAdmin ? 'Administrador General' : isDocente ? 'Docente / Staff' : 'Administrativo';

    return (
      <View style={[styles.roleTagPill, isAdmin ? styles.roleTagAdmin : isDocente ? styles.roleTagDocente : styles.roleTagStaff]}>
        <Text style={[styles.roleTagText, isAdmin ? styles.roleTagTextAdmin : isDocente ? styles.roleTagTextDocente : styles.roleTagTextStaff]}>
          {displayRole}
        </Text>
      </View>
    );
  }

  return null;
};

export default Badge;

const styles = StyleSheet.create({
  adminLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  adminLevelText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  nivelPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  nivelPillText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cursoPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignSelf: 'flex-start',
  },
  cursoPillText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  profesorPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignSelf: 'flex-start',
  },
  profesorPillText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  sinAsignarPill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignSelf: 'flex-start',
  },
  sinAsignarPillText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  horarioTipoPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  materiaPill: {
    backgroundColor: '#EEF2FF',
  },
  deportePill: {
    backgroundColor: '#FFF7ED',
  },
  horarioTipoText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  materiaText: {
    color: '#4F46E5',
  },
  deporteText: {
    color: '#EA580C',
  },
  amberDotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  greenDotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  greenDotText: {
    fontSize: 11,
    color: '#34D399',
    marginLeft: 5,
    fontWeight: '600',
  },
  roleTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  roleTagAdmin: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  roleTagDocente: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  roleTagStaff: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roleTagTextAdmin: {
    color: '#818CF8',
  },
  roleTagTextDocente: {
    color: '#34D399',
  },
  roleTagTextStaff: {
    color: '#94A3B8',
  },
});
