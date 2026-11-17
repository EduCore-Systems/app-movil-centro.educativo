import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface PillOption<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

interface PillSelectorProps<T extends string = string> {
  options: PillOption<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
  isDarkMode?: boolean;
}

export function PillSelector<T extends string>({
  options,
  selectedId,
  onSelect,
  isDarkMode = false,
}: PillSelectorProps<T>) {
  const containerBg = isDarkMode ? '#1E293B' : '#F1F5F9';
  const inactiveText = isDarkMode ? '#94A3B8' : '#64748B';

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      {options.map((opt) => {
        const isActive = opt.id === selectedId;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.pillBtn, isActive && styles.pillBtnActive]}
            onPress={() => onSelect(opt.id)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.pillText,
                isActive ? styles.pillTextActive : { color: inactiveText },
              ]}
              numberOfLines={1}
            >
              {opt.label} {opt.count !== undefined ? `(${opt.count})` : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 30,
    padding: 4,
    marginBottom: 16,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnActive: {
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default PillSelector;
