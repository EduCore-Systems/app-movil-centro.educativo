import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ActionButtonProps {
  type: 'lock-reset' | 'edit' | 'pill-add';
  onPress: () => void;
  isDarkMode?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  type,
  onPress,
  isDarkMode = false,
  style,
}) => {
  if (type === 'lock-reset') {
    return (
      <TouchableOpacity
        style={[
          styles.circleBtn,
          {
            backgroundColor: isDarkMode ? '#2D1B10' : '#FFF7ED',
            borderColor: isDarkMode ? '#7C2D12' : '#FFEDD5',
          },
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <MaterialIcons name="lock-reset" size={17} color="#EA580C" />
      </TouchableOpacity>
    );
  }

  if (type === 'edit') {
    return (
      <TouchableOpacity
        style={[
          styles.circleBtn,
          {
            backgroundColor: isDarkMode ? '#1E1B38' : '#EEF2FF',
            borderColor: isDarkMode ? '#312E81' : '#E0E7FF',
          },
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <MaterialIcons name="edit" size={16} color="#6366F1" />
      </TouchableOpacity>
    );
  }

  if (type === 'pill-add') {
    return (
      <TouchableOpacity
        style={[styles.pillAddBtn, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={16} color="#EA580C" style={{ marginRight: 2 }} />
        <Text style={styles.pillAddText}>+ Añadir Hijo</Text>
      </TouchableOpacity>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  circleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pillAddText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '800',
  },
});

export default ActionButton;
