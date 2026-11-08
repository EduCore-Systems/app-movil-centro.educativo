import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  type: 'nivel' | 'clave' | 'rol' | 'admin-level';
  value?: string;
  isDarkMode?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ type, value = '', isDarkMode = false }) => {
  if (type === 'admin-level') {
    return (
      <View style={styles.adminLevelBadge}>
        <View style={styles.greenDot} />
        <Text style={styles.adminLevelText}>Nivel Administrador</Text>
      </View>
    );
  }

  if (type === 'nivel') {
    const valUpper = (value || 'INICIAL').toUpperCase();
    return (
      <View style={styles.nivelPill}>
        <Text style={styles.nivelPillText}>{valUpper}</Text>
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

const styles = StyleSheet.create({
  adminLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  adminLevelText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '700',
  },
  nivelPill: {
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nivelPillText: {
    color: '#EA580C',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  greenDotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  greenDotText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '600',
  },
  amberDotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451A03',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  roleTagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleTagAdmin: {
    backgroundColor: '#FEE2E2',
  },
  roleTagDocente: {
    backgroundColor: '#DCFCE7',
  },
  roleTagStaff: {
    backgroundColor: '#E0E7FF',
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roleTagTextAdmin: {
    color: '#B91C1C',
  },
  roleTagTextDocente: {
    color: '#15803D',
  },
  roleTagTextStaff: {
    color: '#4338CA',
  },
});

export default Badge;
