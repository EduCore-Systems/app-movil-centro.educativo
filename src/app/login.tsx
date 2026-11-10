import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para Modal de Recuperación de Contraseña (Validación con DNI)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetDni, setResetDni] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirmPass, setResetConfirmPass] = useState('');
  const [showResetNewPass, setShowResetNewPass] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleOpenForgotModal = () => {
    setResetIdentifier(email || '');
    setResetDni('');
    setResetNewPass('');
    setResetConfirmPass('');
    setResetError('');
    setResetSuccess('');
    setShowForgotModal(true);
  };

  const handleResetPasswordSubmit = async () => {
    setResetError('');
    setResetSuccess('');

    if (!resetIdentifier.trim() || !resetDni.trim() || !resetNewPass.trim() || !resetConfirmPass.trim()) {
      setResetError('Por favor, completá todos los campos requeridos.');
      return;
    }

    if (resetNewPass.length < 6) {
      setResetError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (resetNewPass !== resetConfirmPass) {
      setResetError('Las contraseñas no coinciden. Verificalas.');
      return;
    }

    setResetLoading(true);
    const res = await resetPassword(resetIdentifier, resetDni, resetNewPass);
    setResetLoading(false);

    if (res.success) {
      setResetSuccess(res.message || 'Contraseña actualizada con éxito.');
      // Pre-cargar credenciales nuevas en el formulario
      setEmail(resetIdentifier.trim());
      setPassword(resetNewPass.trim());
      setTimeout(() => {
        setShowForgotModal(false);
      }, 1800);
    } else {
      setResetError(res.error || 'No se pudo actualizar la contraseña.');
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, completa todos los campos.');
      return;
    }
    setLoading(true);
    setErrorMessage('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.replace('/');
    } else {
      setErrorMessage(res.error || 'Credenciales incorrectas');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera con Logo circular oficial y Portal de Acceso */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.portalTitle}>Portal de Acceso</Text>
        </View>

        {/* Tarjeta del Formulario */}
        <View style={styles.card}>
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#B91C1C" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Campo Correo Electrónico, Legajo o DNI */}
          <Text style={styles.label}>Correo Electrónico, Legajo o DNI</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIconLeft} />
            <TextInput
              style={styles.input}
              placeholder="ej. usuario@email.com, DNI o EST-2026-401"
              placeholderTextColor="#94A3B8"
              keyboardType="default"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Fila de Contraseña con enlace a ¿Olvidaste tu contraseña? arriba del recuadro */}
          <View style={styles.passwordHeaderRow}>
            <Text style={styles.label}>Contraseña</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleOpenForgotModal}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIconLeft} />
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIconRight}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#94A3B8"
              />
            </TouchableOpacity>
          </View>

          {/* Checkbox Recordarme */}
          <TouchableOpacity
            style={styles.rememberRow}
            activeOpacity={0.8}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.rememberText}>Recordarme</Text>
          </TouchableOpacity>

          {/* Botón Ingresar */}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          {/* Nota de ayuda institucional de acceso */}
          <View style={styles.helpBox}>
            <Ionicons name="information-circle-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={styles.helpText}>
              Personal Docente y Padres: Ingresan con correo o DNI. Alumnos con su Legajo EST-2026-XXX o DNI.
            </Text>
          </View>
        </View>

        {/* Footer Institucional */}
        <View style={styles.footer}>
          <Text style={styles.footerSlogan}>EduCore · Educar para Transformar</Text>
          <Text style={styles.footerCopyright}>Ciclo Lectivo 2026 · Todos los derechos reservados</Text>
        </View>
      </ScrollView>

      {/* ── MODAL INSTITUCIONAL DE RECUPERACIÓN DE CONTRASEÑA (VALIDACIÓN DNI) ── */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            {/* Header del Modal */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIconBox}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#EA580C" />
              </View>
              <View style={styles.modalHeaderTitleBox}>
                <Text style={styles.modalTitle}>Recuperar Contraseña</Text>
                <Text style={styles.modalSubtitle}>Validación de identidad institucional con DNI</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowForgotModal(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              {/* Mensaje de Error */}
              {resetError ? (
                <View style={styles.modalErrorBox}>
                  <Ionicons name="alert-circle" size={16} color="#B91C1C" style={{ marginRight: 6 }} />
                  <Text style={styles.modalErrorText}>{resetError}</Text>
                </View>
              ) : null}

              {/* Mensaje de Éxito */}
              {resetSuccess ? (
                <View style={styles.modalSuccessBox}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" style={{ marginRight: 6 }} />
                  <Text style={styles.modalSuccessText}>{resetSuccess}</Text>
                </View>
              ) : null}

              {/* Paso 1: Identificador */}
              <Text style={styles.modalLabel}>Correo Electrónico, Legajo o Usuario</Text>
              <View style={styles.modalInputContainer}>
                <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.input}
                  placeholder="ej. familia.diaz@educore.com o EST-2026-401"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  value={resetIdentifier}
                  onChangeText={setResetIdentifier}
                />
              </View>

              {/* Paso 2: DNI para validar identidad */}
              <Text style={styles.modalLabel}>DNI del Titular Registrado (Para verificar)</Text>
              <View style={styles.modalInputContainer}>
                <Ionicons name="card-outline" size={18} color="#94A3B8" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.input}
                  placeholder="ej. 46777888 (sin puntos)"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={resetDni}
                  onChangeText={setResetDni}
                />
              </View>

              {/* Paso 3: Nueva Contraseña */}
              <Text style={styles.modalLabel}>Nueva Contraseña (mínimo 6 caracteres)</Text>
              <View style={styles.modalInputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingresá tu nueva clave"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showResetNewPass}
                  value={resetNewPass}
                  onChangeText={setResetNewPass}
                />
                <TouchableOpacity
                  onPress={() => setShowResetNewPass(!showResetNewPass)}
                  style={styles.eyeIconRight}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showResetNewPass ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              {/* Paso 4: Confirmar Nueva Contraseña */}
              <Text style={styles.modalLabel}>Confirmar Nueva Contraseña</Text>
              <View style={styles.modalInputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.input}
                  placeholder="Repetí tu nueva clave"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showResetNewPass}
                  value={resetConfirmPass}
                  onChangeText={setResetConfirmPass}
                />
              </View>

              {/* Botón de Acción */}
              <TouchableOpacity
                style={[styles.button, { marginTop: 8 }]}
                activeOpacity={0.8}
                onPress={handleResetPasswordSubmit}
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Actualizar Contraseña</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                activeOpacity={0.7}
                onPress={() => setShowForgotModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar y volver al Login</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  portalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  inputIconLeft: {
    marginRight: 10,
  },
  eyeIconRight: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EA580C',
    marginBottom: 8,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  rememberText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#EA580C',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helpText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    flex: 1,
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
  },
  footerSlogan: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: 11,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalHeaderTitleBox: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalBody: {
    paddingBottom: 8,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 6,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 10,
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  modalErrorText: {
    fontSize: 12,
    color: '#B91C1C',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  modalSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  modalSuccessText: {
    fontSize: 12,
    color: '#059669',
    flex: 1,
    lineHeight: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
