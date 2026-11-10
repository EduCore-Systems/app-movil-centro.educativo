import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import FamilyTopBar from './FamilyTopBar';
import FamilySidebar from './FamilySidebar';
import FamilyNavTabs, { FamilyTab } from '../../molecules/family/FamilyNavTabs';
import FamilyStudentCard from '../../molecules/family/FamilyStudentCard';
import LinkStudentModal from '../../molecules/family/LinkStudentModal';
import StudentProfileTab from './StudentProfileTab';
import StudentSubjectsTab from './StudentSubjectsTab';
import StudentServicesTab from './StudentServicesTab';
import FamilyTuitionTab from './FamilyTuitionTab';
import FamilyChatTab from './FamilyChatTab';
import FamilyDocumentModal from './FamilyDocumentModal';
import { getChildrenForParent, FamilyStudent } from '../../../services/familyService';
import { useAuth } from '../../../context/AuthContext';

interface FamilyPanelProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const FamilyPanel: React.FC<FamilyPanelProps> = ({
  isDarkMode = true,
  onToggleTheme,
}) => {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState<FamilyStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<FamilyStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FamilyTab>('resumen');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Estado para el Visor Formal de Documentos Oficiales (Boletín / Certificado Regular)
  const [docModal, setDocModal] = useState<{ isOpen: boolean; type: 'boletin' | 'certificado' }>({
    isOpen: false,
    type: 'boletin',
  });

  // Referencias para auto-scroll suave
  const mainScrollRef = useRef<any>(null);
  const childrenScrollRef = useRef<any>(null);

  const tutorName = user?.nombre || user?.name || (user?.email ? `Familia ${user.email.split('@')[0]}` : 'Familia Díaz');

  const loadChildren = async () => {
    setLoading(true);
    try {
      const data = await getChildrenForParent(user?.uid, user?.email);
      setChildren(data);
      if (data.length > 0) {
        setSelectedStudent(data[0]);
      }
    } catch (err) {
      console.error('Error al cargar hijos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, [user?.uid]);

  // Soporte para elevar y hacer scroll cuando el teclado se despliega
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      if (activeTab === 'chat') {
        setTimeout(() => {
          mainScrollRef.current?.scrollToEnd({ animated: true });
        }, 150);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [activeTab]);

  const handleStudentLinked = (newStudent: FamilyStudent) => {
    setChildren((prev) => [newStudent, ...prev]);
    setSelectedStudent(newStudent);
  };

  const handleStudentUpdated = (updated: FamilyStudent) => {
    setSelectedStudent(updated);
    setChildren((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Al seleccionar un hijo: auto-scroll horizontal para que la tarjeta no quede cortada a la mitad
  const handleSelectChild = (child: FamilyStudent, index: number) => {
    setSelectedStudent(child);
    childrenScrollRef.current?.scrollTo({
      x: index * 260,
      animated: true,
    });
  };

  // Al cambiar de pestaña: scroll para centrar el contenido y ver botones completos
  const handleSelectTab = (tab: FamilyTab) => {
    setActiveTab(tab);
    mainScrollRef.current?.scrollTo({
      y: 220,
      animated: true,
    });
  };

  const theme = {
    bg: isDarkMode ? '#0A0F1D' : '#F8FAFC',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* ── TOPBAR FAMILIAR ── */}
      <FamilyTopBar
        isDarkMode={isDarkMode}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onToggleTheme={onToggleTheme || (() => {})}
        tutorName={tutorName}
      />

      <ScrollView
        ref={mainScrollRef}
        style={styles.contentScroll}
        contentContainerStyle={[
          styles.scrollContentContainer,
          activeTab === 'chat' && keyboardHeight > 0 && { paddingBottom: keyboardHeight + 30 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── CABECERA DEL PORTAL ── */}
        <View style={styles.headerBanner}>
          <View>
            <View style={styles.portalTitleRow}>
              <Text style={[styles.portalTitle, { color: theme.titleColor }]}>
                Portal de Familias
              </Text>
              <View style={styles.matriculaPill}>
                <View style={styles.greenPulse} />
                <Text style={styles.matriculaPillText}>Matrícula al Día</Text>
              </View>
            </View>
            <Text style={[styles.portalSub, { color: theme.subColor }]}>
              Centro Educativo EduCore · Ciclo Lectivo 2026
            </Text>
          </View>

          {/* Botones de Documentación Rápida con Apertura Real */}
          <View style={styles.docButtonsRow}>
            <TouchableOpacity
              style={[styles.docBtnOutline, { borderColor: theme.border, backgroundColor: theme.cardBg }]}
              onPress={() => setDocModal({ isOpen: true, type: 'boletin' })}
              activeOpacity={0.8}
            >
              <MaterialIcons name="download" size={16} color={theme.subColor} style={{ marginRight: 6 }} />
              <Text style={[styles.docBtnOutlineText, { color: theme.titleColor }]} maxFontSizeMultiplier={1.15} numberOfLines={1}>
                Boletín Actual
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.docBtnFilled}
              onPress={() => setDocModal({ isOpen: true, type: 'certificado' })}
              activeOpacity={0.8}
            >
              <MaterialIcons name="verified" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.docBtnFilledText} maxFontSizeMultiplier={1.15} numberOfLines={1}>
                Certificado Regular
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── SELECTOR: MIS HIJOS ── */}
        <View style={styles.sectionHeaderRow}>
          <MaterialIcons name="family-restroom" size={20} color="#EA580C" style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: theme.titleColor }]}>Mis Hijos</Text>
          {children.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
              <Text style={[styles.countBadgeText, { color: theme.subColor }]}>
                {children.length} {children.length === 1 ? 'alumno vinculado' : 'alumnos vinculados'}
              </Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#EA580C" />
            <Text style={[styles.loadingText, { color: theme.subColor }]}>Cargando estudiantes vinculados...</Text>
          </View>
        ) : (
          <View style={styles.childrenSection}>
            <ScrollView
              ref={childrenScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.childrenCardsRow}
              decelerationRate="fast"
            >
              {children.map((child, idx) => (
                <FamilyStudentCard
                  key={child.id}
                  student={child}
                  isSelected={selectedStudent?.id === child.id}
                  onSelect={() => handleSelectChild(child, idx)}
                  isDarkMode={isDarkMode}
                />
              ))}
            </ScrollView>

            {/* Botón "+ Vincular Estudiante" */}
            <TouchableOpacity
              style={[
                styles.linkStudentBtn,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: isDarkMode ? '#334155' : '#CBD5E1',
                },
              ]}
              onPress={() => setIsLinkModalOpen(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.linkIconCircle, { backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9' }]}>
                <MaterialIcons name="person-add" size={18} color="#EA580C" />
              </View>
              <Text style={[styles.linkStudentText, { color: theme.titleColor }]}>
                Vincular Estudiante
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── CONTENIDO DEL ESTUDIANTE SELECCIONADO ── */}
        {selectedStudent && (
          <View style={{ marginTop: 14 }}>
            {/* Píldoras de Navegación Modular */}
            <FamilyNavTabs
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              isDarkMode={isDarkMode}
            />

            {/* 1. Ficha del Estudiante */}
            {activeTab === 'resumen' && (
              <StudentProfileTab student={selectedStudent} isDarkMode={isDarkMode} />
            )}

            {/* 2. Materias y Docentes (Fase 2) */}
            {activeTab === 'materias' && (
              <StudentSubjectsTab
                student={selectedStudent}
                isDarkMode={isDarkMode}
                onOpenChatWithTeacher={() => {
                  handleSelectTab('chat');
                }}
              />
            )}

            {/* 3. Servicios Escolares (Fase 2) */}
            {activeTab === 'servicios' && (
              <StudentServicesTab
                student={selectedStudent}
                isDarkMode={isDarkMode}
                onStudentUpdated={handleStudentUpdated}
              />
            )}

            {/* 4. Gestión de Cuotas y Aranceles (Módulo 2 Coevaluación) */}
            {activeTab === 'cuotas' && (
              <FamilyTuitionTab
                student={selectedStudent}
                user={user}
                isDarkMode={isDarkMode}
                onBackToDashboard={() => handleSelectTab('resumen')}
              />
            )}

            {/* 5. Consultas con Docentes (Fase 3 - Sincronizado en tiempo real) */}
            {activeTab === 'chat' && (
              <FamilyChatTab
                student={selectedStudent}
                user={user}
                onBackToDashboard={() => handleSelectTab('resumen')}
                isDarkMode={isDarkMode}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* ── SIDEBAR FAMILIAR ── */}
      <FamilySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onLogout={logout}
        tutorName={tutorName}
        childrenCount={children.length}
        onOpenDocument={(type) => setDocModal({ isOpen: true, type })}
        isDarkMode={isDarkMode}
      />

      {/* ── MODAL VINCULAR ESTUDIANTE ── */}
      <LinkStudentModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        parentId={user?.uid || 'parent-demo'}
        onStudentLinked={handleStudentLinked}
        isDarkMode={isDarkMode}
      />

      {/* ── MODAL VISOR FORMAL DE DOCUMENTOS (BOLETÍN / CERTIFICADO REGULAR) ── */}
      <FamilyDocumentModal
        isOpen={docModal.isOpen}
        onClose={() => setDocModal((prev) => ({ ...prev, isOpen: false }))}
        type={docModal.type}
        student={selectedStudent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerBanner: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  portalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  portalTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  matriculaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  matriculaPillText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  portalSub: {
    fontSize: 12,
    marginTop: 4,
  },
  docButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  docBtnOutline: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  docBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
  },
  docBtnFilled: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  docBtnFilledText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
  },
  childrenSection: {
    marginBottom: 10,
  },
  childrenCardsRow: {
    paddingRight: 10,
    gap: 12,
  },
  linkStudentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    gap: 8,
  },
  linkIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkStudentText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default FamilyPanel;
