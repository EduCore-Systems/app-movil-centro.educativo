import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onToggle }) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={styles.btn}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isDarkMode ? 'sunny' : 'moon'}
        size={20}
        color={isDarkMode ? '#F59E0B' : '#64748B'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    padding: 6,
  },
});

export default ThemeToggle;
