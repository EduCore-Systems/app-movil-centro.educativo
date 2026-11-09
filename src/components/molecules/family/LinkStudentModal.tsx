import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { linkStudentByDni, FamilyStudent } from '../../../services/familyService';

interface LinkStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string;
  onStudentLinked: (student: FamilyStudent) => void;
  isDarkMode?: boolean;
}

export const LinkStudentModal: React.FC<LinkStudentModalProps> = ({
  isOpen,
  onClose,
  parentId,
  onStudentLinked,
  isDarkMode = false,
}) => {
  const [dni, setDni] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLink = async () => {
    if (!dni.trim()) {
      Alert.alert('Atención', 'Por favor ingresá el DNI del alumno.');
      return;
    }

    setIsLoading(true);
    const res = await linkStudentByDni(parentId, dni.trim());
    setIsLoading(false);

    if (res.success && res.student) {
      Alert.alert('Éxito', res.message);
      onStudentLinked(res.student);
      setDni('');
      onClose();
    } else {
      Alert.alert('No encontrado', res.message);
    }
  };

  const theme = {
    modalBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    inputBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    inputText: isDarkMode ? '#F8FAFC' : '#0F172A',
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalBox, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="person-add" size={22} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: theme.titleColor }]}>Vincular Estudiante</Text>
                  <Text style={[styles.subtitle, { color: theme.subColor }]}>
                    Ingresá el DNI oficial del alumno matriculado
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <MaterialIcons name="close" size={24} color={theme.subColor} />
                </TouchableOpacity>
              </View>

              {/* Input DNI */}
              <View style={{ marginTop: 18 }}>
                <Text style={[styles.label, { color: theme.titleColor }]}>DNI del Alumno</Text>
                <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                  <MaterialIcons name="badge" size={20} color={theme.subColor} style={{ marginRight: 10 }} />
                  <TextInput
                    style={[styles.input, { color: theme.inputText }]}
                    placeholder="ej. 46777888"
                    placeholderTextColor={theme.subColor}
                    keyboardType="numeric"
                    value={dni}
                    onChangeText={setDni}
                  />
                </View>
              </View>

              {/* Botón Vincular */}
              <TouchableOpacity
                onPress={handleLink}
                disabled={isLoading}
                style={styles.submitBtn}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.submitBtnText}>Vincular a mi Cuenta</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default LinkStudentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 14,
    height: 48,
    marginTop: 20,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
