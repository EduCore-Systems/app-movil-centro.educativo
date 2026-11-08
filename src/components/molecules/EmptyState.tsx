import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  isDarkMode?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  isDarkMode = false,
}) => {
  const textPrimary = isDarkMode ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDarkMode ? '#94A3B8' : '#64748B';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: textSecondary }]}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
});

export default EmptyState;
