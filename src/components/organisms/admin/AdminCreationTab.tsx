import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { collection, doc, setDoc, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, firebaseConfig } from '../../../services/firebase';
import FormInput from '../../atoms/FormInput';
import ActionButton from '../../atoms/ActionButton';
import PillSelector, { PillOption } from '../../molecules/PillSelector';

interface AdminCreationTabProps {
  isDarkMode: boolean;
  onSwitchToDashboard: () => void;
  onUserCreated?: () => void;
}

interface StudentForm {
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  nivel: string;
  genero: string;
}

const getSecondaryAuth = () => {
  const existingApp = getApps().find(a => a.name === 'secondary');
  const secondaryApp = existingApp || initializeApp(firebaseConfig, 'secondary');
  return getAuth(secondaryApp);
};

const generateUniqueStudentIdLogin = async () => {
  const year = new Date().getFullYear();
  let unique = false;
  let studentID = '';
  let attempts = 0;

  while (!unique && attempts < 10) {
    attempts++;
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    studentID = `EST-${year}-${randomDigits}`;

    try {
      const q = query(collection(db, 'students'), where('studentID_login', '==', studentID), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        unique = true;
      }
    } catch {
      unique = true;
    }
  }

  return studentID;
};

export const AdminCreationTab: React.FC<AdminCreationTabProps> = ({
  isDarkMode,
  onSwitchToDashboard,
  onUserCreated,
}) => {
  const [creationType, setCreationType] = useState<'parent_student' | 'administrative'>('parent_student');

  // Formulario Tutor y Estudiantes
  const [parentName, setParentName] = useState('');
  const [parentDni, setParentDni] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [students, setStudents] = useState<StudentForm[]>([
    { nombre: '', dni: '', fechaNacimiento: '', nivel: 'inicial', genero: 'Masculino' },
  ]);

  // Formulario Personal / Administrativo
  const [adminName, setAdminName] = useState('');
  const [adminDni, setAdminDni] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState<'Staff' | 'Administrativo' | 'user_admin'>('Staff');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Modales de selección
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    title: string;
    options: { label: string; value: string }[];
    selectedValue: string;
    onSelect: (val: any) => void;
  }>({
    visible: false,
    title: '',
    options: [],
    selectedValue: '',
    onSelect: () => {},
  });

  const theme = {
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    cardBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    sectionBoxBg: isDarkMode ? '#111C35' : '#F8FAFC',
    sectionBoxBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    inputBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    inputBorder: isDarkMode ? '#334155' : '#E2E8F0',
    inputText: isDarkMode ? '#F8FAFC' : '#0F172A',
  };

  const handleStudentChange = (index: number, field: keyof StudentForm, value: string) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const addStudentField = () => {
    setStudents([
      ...students,
      { nombre: '', dni: '', fechaNacimiento: '', nivel: 'inicial', genero: 'Masculino' },
    ]);
  };

  const removeStudentField = (index: number) => {
    if (students.length === 1) return;
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleCreateParentSubmit = async () => {
    setFormError('');

    if (!parentName.trim() || !parentDni.trim() || !parentEmail.trim()) {
      setFormError('Por favor, completa todos los datos del tutor (nombre, DNI y correo electrónico).');
      return;
    }

    for (const std of students) {
      if (!std.nombre.trim() || !std.dni.trim()) {
        setFormError('Por favor, completa el nombre y DNI de cada estudiante.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const secondaryAuth = getSecondaryAuth();
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        parentEmail.trim(),
        parentDni.trim()
      );
      const parentUid = userCredential.user.uid;
      await signOut(secondaryAuth);

      const studentDocIds: string[] = [];
      for (const std of students) {
        if (!std.nombre.trim() || !std.dni.trim()) continue;
        const studentID_login = await generateUniqueStudentIdLogin();
        const studentRef = await addDoc(collection(db, 'students'), {
          studentID_login,
          parentId: parentUid,
          emailPadre: parentEmail.trim(),
          status: 'activo',
          mustChangePassword: true,
          nombre: std.nombre.trim(),
          dni: std.dni.trim(),
          genero: std.genero || 'Masculino',
          fechaNacimiento: std.fechaNacimiento || '',
          nivel: std.nivel || 'inicial',
          createdAt: serverTimestamp(),
        });
        studentDocIds.push(studentRef.id);
      }

      await setDoc(doc(db, 'users', parentUid), {
        role: 'Padre',
        email: parentEmail.trim(),
        nombre: parentName.trim(),
        dni: parentDni.trim(),
        mustChangePassword: true,
        emailInvalid: false,
        studentIds: studentDocIds,
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        '¡Tutor y Alumnos Creados!',
        `Se ha registrado a ${parentName} con DNI ${parentDni}. Las cuentas han sido activadas. El tutor podrá ingresar usando su DNI como contraseña temporal.`,
        [
          {
            text: 'Excelente',
            onPress: () => {
              if (onUserCreated) onUserCreated();
              onSwitchToDashboard();
            },
          },
        ]
      );

      setParentName('');
      setParentDni('');
      setParentEmail('');
      setStudents([{ nombre: '', dni: '', fechaNacimiento: '', nivel: 'inicial', genero: 'Masculino' }]);
    } catch (err: any) {
      console.error('Error al registrar tutor y alumnos:', err);
      if (err.code === 'auth/email-already-in-use') {
        setFormError('Este correo electrónico ya está registrado en el sistema.');
      } else {
        setFormError(err.message || 'Error de conexión al registrar.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAdminSubmit = async () => {
    setFormError('');

    if (!adminName.trim() || !adminDni.trim() || !adminEmail.trim()) {
      setFormError('Por favor, completa todos los campos del formulario (incluyendo DNI).');
      return;
    }

    setIsSubmitting(true);
    try {
      const secondaryAuth = getSecondaryAuth();
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        adminEmail.trim(),
        adminDni.trim()
      );
      const adminUid = userCredential.user.uid;
      await signOut(secondaryAuth);

      await setDoc(doc(db, 'users', adminUid), {
        role: adminRole,
        email: adminEmail.trim(),
        nombre: adminName.trim(),
        dni: adminDni.trim(),
        mustChangePassword: true,
        emailInvalid: false,
        createdAt: serverTimestamp(),
      });

      const roleLabel =
        adminRole === 'user_admin'
          ? 'Administrador General'
          : adminRole === 'Administrativo'
          ? 'Administrativo'
          : 'Docente / Staff';

      Alert.alert(
        '¡Usuario Creado!',
        `Se ha registrado a ${adminName} con el rol de ${roleLabel}. Cuenta activa. El usuario podrá ingresar utilizando su DNI como contraseña temporal.`,
        [
          {
            text: 'Excelente',
            onPress: () => {
              if (onUserCreated) onUserCreated();
              onSwitchToDashboard();
            },
          },
        ]
      );

      setAdminName('');
      setAdminDni('');
      setAdminEmail('');
      setAdminRole('Staff');
    } catch (err: any) {
      console.error('Error al registrar personal:', err);
      if (err.code === 'auth/email-already-in-use') {
        setFormError('Este correo electrónico ya está registrado en el sistema.');
      } else {
        setFormError(err.message || 'Error de conexión al registrar.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'user_admin') return 'Administrador General';
    if (role === 'Administrativo') return 'Administrativo';
    return 'Docente / Staff';
  };

  const getNivelLabel = (nivel: string) => {
    if (nivel === 'inicial') return 'Nivel Inicial';
    if (nivel === 'primaria') return 'Primaria';
    if (nivel === 'secundaria') return 'Secundaria';
    return nivel;
  };

  const creationOptions: PillOption<'parent_student' | 'administrative'>[] = [
    { id: 'parent_student', label: 'Tutor y Estudiantes' },
    { id: 'administrative', label: 'Personal / Administrativo' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.mainCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
        
        {/* Título de la tarjeta */}
        <View style={styles.cardHeader}>
          <MaterialIcons name="person-add" size={24} color="#EA580C" style={{ marginRight: 10 }} />
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            {creationType === 'parent_student'
              ? 'Registrar Tutor y Estudiantes'
              : 'Registrar Personal / Administrativo'}
          </Text>
        </View>

        {/* ── SELECTOR CENTRAL TIPO CÁPSULA (MOLÉCULA PILLSELECTOR) ── */}
        <PillSelector
          options={creationOptions}
          selectedId={creationType}
          onSelect={(id) => {
            setCreationType(id);
            setFormError('');
          }}
          isDarkMode={isDarkMode}
        />

        {/* ── MENSAJE DE ERROR ── */}
        {formError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        ) : null}

        {/* ── FORMULARIO 1: TUTOR Y ESTUDIANTES ── */}
        {creationType === 'parent_student' ? (
          <View style={styles.formSection}>
            <View style={[styles.innerBox, { backgroundColor: theme.sectionBoxBg, borderColor: theme.sectionBoxBorder }]}>
              <Text style={styles.sectionHeading}>DATOS DEL PADRE/TUTOR</Text>

              <FormInput
                label="Nombre Completo del Tutor"
                placeholder="Ej. Andrés Martínez"
                value={parentName}
                onChangeText={setParentName}
                isDarkMode={isDarkMode}
              />

              <FormInput
                label="DNI del Tutor"
                placeholder="Número de DNI"
                keyboardType="numeric"
                value={parentDni}
                onChangeText={(val) => setParentDni(val.replace(/\D/g, ''))}
                helperText="* Será su contraseña de acceso temporal por defecto."
                isDarkMode={isDarkMode}
              />

              <FormInput
                label="Correo Electrónico"
                placeholder="tutor@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={parentEmail}
                onChangeText={setParentEmail}
                isDarkMode={isDarkMode}
              />
            </View>

            <View style={styles.estudiantesHeaderRow}>
              <Text style={styles.sectionHeading}>ESTUDIANTES VINCULADOS</Text>
              <ActionButton type="pill-add" onPress={addStudentField} isDarkMode={isDarkMode} />
            </View>

            {students.map((std, idx) => (
              <View
                key={idx}
                style={[styles.studentCardBox, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
              >
                <View style={styles.studentCardHeader}>
                  <Text style={styles.studentCardTitle}>Estudiante #{idx + 1}</Text>
                  {students.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeStudentField(idx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>

                <FormInput
                  label="Nombre Completo"
                  placeholder="Ej. Lucas Martínez"
                  value={std.nombre}
                  onChangeText={(val) => handleStudentChange(idx, 'nombre', val)}
                  isDarkMode={isDarkMode}
                />

                <FormInput
                  label="DNI"
                  placeholder="Número de DNI"
                  keyboardType="numeric"
                  value={std.dni}
                  onChangeText={(val) => handleStudentChange(idx, 'dni', val.replace(/\D/g, ''))}
                  isDarkMode={isDarkMode}
                />

                <FormInput
                  label="Fecha de Nacimiento"
                  placeholder="dd/mm/aaaa"
                  value={std.fechaNacimiento}
                  onChangeText={(val) => handleStudentChange(idx, 'fechaNacimiento', val)}
                  isDarkMode={isDarkMode}
                />

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Nivel Educativo</Text>
                  <TouchableOpacity
                    style={[styles.selectBtn, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                    onPress={() => {
                      setPickerModal({
                        visible: true,
                        title: 'Seleccionar Nivel Educativo',
                        options: [
                          { label: 'Nivel Inicial', value: 'inicial' },
                          { label: 'Primaria', value: 'primaria' },
                          { label: 'Secundaria', value: 'secundaria' },
                        ],
                        selectedValue: std.nivel,
                        onSelect: (val) => handleStudentChange(idx, 'nivel', val),
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.selectBtnText, { color: theme.inputText }]}>
                      {getNivelLabel(std.nivel)}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Género</Text>
                  <TouchableOpacity
                    style={[styles.selectBtn, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                    onPress={() => {
                      setPickerModal({
                        visible: true,
                        title: 'Seleccionar Género',
                        options: [
                          { label: 'Masculino', value: 'Masculino' },
                          { label: 'Femenino', value: 'Femenino' },
                          { label: 'Otro / No Binario', value: 'Otro' },
                        ],
                        selectedValue: std.genero,
                        onSelect: (val) => handleStudentChange(idx, 'genero', val),
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.selectBtnText, { color: theme.inputText }]}>
                      {std.genero || 'Masculino'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.mainSubmitBtn}
              onPress={handleCreateParentSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.mainSubmitBtnText}>Creando Cuentas y Vinculando...</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="person-add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.mainSubmitBtnText}>Crear Cuentas y Enviar Activación</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* ── FORMULARIO 2: PERSONAL / ADMINISTRATIVO ── */
          <View style={styles.formSection}>
            <View style={[styles.innerBox, { backgroundColor: theme.sectionBoxBg, borderColor: theme.sectionBoxBorder }]}>
              <Text style={styles.sectionHeading}>DATOS DEL PERSONAL / ADMINISTRATIVO</Text>

              <FormInput
                label="Nombre Completo"
                placeholder="Ej. Juan Pérez"
                value={adminName}
                onChangeText={setAdminName}
                isDarkMode={isDarkMode}
              />

              <FormInput
                label="DNI del Personal"
                placeholder="Número de DNI"
                keyboardType="numeric"
                value={adminDni}
                onChangeText={(val) => setAdminDni(val.replace(/\D/g, ''))}
                helperText="* Será su contraseña de acceso temporal por defecto."
                isDarkMode={isDarkMode}
              />

              <FormInput
                label="Correo Electrónico"
                placeholder="juan.perez@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={adminEmail}
                onChangeText={setAdminEmail}
                isDarkMode={isDarkMode}
              />

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Rol Institucional</Text>
                <TouchableOpacity
                  style={[styles.selectBtn, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                  onPress={() => {
                    setPickerModal({
                      visible: true,
                      title: 'Seleccionar Rol Institucional',
                      options: [
                        { label: 'Docente / Staff', value: 'Staff' },
                        { label: 'Administrativo', value: 'Administrativo' },
                        { label: 'Administrador General', value: 'user_admin' },
                      ],
                      selectedValue: adminRole,
                      onSelect: (val) => setAdminRole(val),
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.selectBtnText, { color: theme.inputText }]}>
                    {getRoleLabel(adminRole)}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.mainSubmitBtn}
              onPress={handleCreateAdminSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.mainSubmitBtnText}>Creando Cuenta...</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="person-add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.mainSubmitBtnText}>Crear Cuenta de Personal</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={pickerModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerModal(prev => ({ ...prev, visible: false }))}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPickerModal(prev => ({ ...prev, visible: false }))}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{pickerModal.title}</Text>
            {pickerModal.options.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.modalOption,
                  pickerModal.selectedValue === opt.value && styles.modalOptionActive,
                ]}
                onPress={() => {
                  pickerModal.onSelect(opt.value);
                  setPickerModal(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    pickerModal.selectedValue === opt.value
                      ? { color: '#EA580C', fontWeight: 'bold' }
                      : { color: theme.textPrimary },
                  ]}
                >
                  {opt.label}
                </Text>
                {pickerModal.selectedValue === opt.value && (
                  <Ionicons name="checkmark" size={18} color="#EA580C" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  mainCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  formSection: {
    gap: 16,
  },
  innerBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  estudiantesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  studentCardBox: {
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  studentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  studentCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
  },
  selectBtn: {
    height: 44,
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectBtnText: {
    fontSize: 13,
  },
  mainSubmitBtn: {
    backgroundColor: '#EA580C',
    height: 52,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  mainSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B20',
  },
  modalOptionActive: {
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  modalOptionText: {
    fontSize: 14,
  },
});

export default AdminCreationTab;
