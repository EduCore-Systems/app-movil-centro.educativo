import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type ReportType =
  | 'student'
  | 'teacher'
  | 'course'
  | 'subject'
  | 'teacher_level'
  | 'sport'
  | 'transport'
  | 'financial';

interface ReportTypeOption {
  key: ReportType;
  label: string;
  category: string;
}

const REPORT_OPTIONS: ReportTypeOption[] = [
  { key: 'student', label: '1. Ficha por Alumno', category: 'Reportes Individuales' },
  { key: 'teacher', label: '2. Reporte por Docente', category: 'Reportes Individuales' },
  { key: 'course', label: '3. Alumnos por Curso / Nivel', category: 'Listados Agrupados' },
  { key: 'subject', label: '4. Alumnos por Materia', category: 'Listados Agrupados' },
  { key: 'teacher_level', label: '5. Docentes por Nivel Educativo', category: 'Listados Agrupados' },
  { key: 'sport', label: '6. Alumnos por Deporte', category: 'Listados Agrupados' },
  { key: 'transport', label: '7. Alumnos por Transporte', category: 'Listados Agrupados' },
  { key: 'financial', label: '8. Estado de Cobranzas y Morosidad', category: 'Gestión Financiera' },
];

interface ReportTypePickerProps {
  selectedType: ReportType;
  onSelectType: (type: ReportType) => void;
  isDarkMode?: boolean;
}

export const ReportTypePicker: React.FC<ReportTypePickerProps> = ({
  selectedType,
  onSelectType,
  isDarkMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = REPORT_OPTIONS.find((o) => o.key === selectedType) || REPORT_OPTIONS[0];

  const theme = {
    btnBg: isDarkMode ? '#1E293B' : '#0F172A',
    btnBorder: isDarkMode ? '#475569' : '#1E293B',
    btnText: '#FFFFFF',
    modalBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    categoryBg: isDarkMode ? '#1E293B' : '#F1F5F9',
  };

  const categories = ['Reportes Individuales', 'Listados Agrupados', 'Gestión Financiera'];

  return (
    <>
      <TouchableOpacity
        style={[styles.pickerButton, { backgroundColor: theme.btnBg, borderColor: theme.btnBorder }]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.85}
      >
        <Text style={[styles.pickerButtonText, { color: theme.btnText }]} numberOfLines={1}>
          {selectedOption.label}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={22} color={theme.btnText} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleRow}>
                <MaterialIcons name="analytics" size={22} color="#EA580C" style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: theme.titleColor }]}>Tipo de Reporte</Text>
              </View>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <MaterialIcons name="close" size={24} color={theme.subColor} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map((cat) => {
                const optionsInCat = REPORT_OPTIONS.filter((o) => o.category === cat);
                return (
                  <View key={cat} style={{ marginBottom: 16 }}>
                    <Text style={[styles.categoryHeader, { color: theme.subColor }]}>{cat.toUpperCase()}</Text>
                    {optionsInCat.map((opt) => {
                      const isSelected = selectedType === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[
                            styles.optionItem,
                            isSelected && styles.optionItemActive,
                            { borderColor: theme.border },
                          ]}
                          onPress={() => {
                            onSelectType(opt.key);
                            setIsOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.optionLabel,
                              { color: isSelected ? '#EA580C' : theme.titleColor },
                              isSelected && { fontWeight: '800' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {isSelected && <MaterialIcons name="check" size={20} color="#EA580C" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ReportTypePicker;

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  pickerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  modalBox: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#33415522',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  categoryHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  optionItemActive: {
    borderColor: '#EA580C',
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
