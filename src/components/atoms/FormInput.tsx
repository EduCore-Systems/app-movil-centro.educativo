import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  helperText?: string;
  isDarkMode?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  helperText,
  isDarkMode = false,
  style,
  ...props
}) => {
  const theme = {
    label: isDarkMode ? '#94A3B8' : '#64748B',
    inputBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    inputBorder: isDarkMode ? '#334155' : '#E2E8F0',
    inputText: isDarkMode ? '#F8FAFC' : '#0F172A',
    placeholder: isDarkMode ? '#64748B' : '#94A3B8',
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.label }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBg,
            borderColor: theme.inputBorder,
            color: theme.inputText,
          },
          style,
        ]}
        placeholderTextColor={theme.placeholder}
        {...props}
      />
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    height: 44,
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  helperText: {
    fontSize: 10,
    color: '#EA580C',
    fontWeight: '600',
    marginTop: 2,
  },
});

export default FormInput;
