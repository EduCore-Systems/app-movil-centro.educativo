import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  subscribeToFamilyConversations,
  subscribeToMessages,
  sendMessage,
  getOrCreateConversation,
  ConversationItem,
  ChatMessage,
  DEMO_MESSAGES,
  DEMO_CONVERSATION,
} from '../../../services/chatService';
import { FamilyStudent } from '../../../services/familyService';
import { auth } from '../../../services/firebase';

interface FamilyChatTabProps {
  student: FamilyStudent;
  user: any;
  onBackToDashboard?: () => void;
  isDarkMode?: boolean;
}

const ASIGNATURAS_DOCENTES = [
  { id: 'sub-1', name: 'Matemática I', teacherName: 'Prof. Carlos Benítez', email: 'carlos.benitez@educore.edu.ar' },
  { id: 'sub-2', name: 'Lengua y Literatura', teacherName: 'Prof. Carmen Delgado', email: 'carmen.delgado@educore.edu.ar' },
  { id: 'sub-3', name: 'Física y Química', teacherName: 'Prof. Alejandro Varela', email: 'alejandro.varela@educore.edu.ar' },
  { id: 'sub-4', name: 'Historia Argentina y Universal', teacherName: 'Prof. Silvina Morales', email: 'silvina.morales@educore.edu.ar' },
  { id: 'sub-5', name: 'Inglés Avanzado', teacherName: 'Prof. Sarah Jenkins', email: 'sarah.jenkins@educore.edu.ar' },
  { id: 'sub-6', name: 'Biología Celular', teacherName: 'Prof. Federico Fontana', email: 'federico.fontana@educore.edu.ar' },
];

export const FamilyChatTab: React.FC<FamilyChatTabProps> = ({
  student,
  user,
  onBackToDashboard,
  isDarkMode = true,
}) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([DEMO_CONVERSATION]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Modal Nueva Consulta
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [initialMessageText, setInitialMessageText] = useState('');

  const chatScrollRef = useRef<any>(null);

  // 1. Suscribirse a las conversaciones en Firestore
  useEffect(() => {
    const parentUid = auth.currentUser?.uid || user?.uid;
    if (!parentUid) return;

    const unsub = subscribeToFamilyConversations(parentUid, async (convs) => {
      if (convs.length > 0) {
        setConversations(convs);
        setActiveConvId((prev) => {
          if (prev && convs.some((c) => c.id === prev)) return prev;
          return convs[0].id;
        });
      } else {
        // Si no existen conversaciones en Firestore, crear una automáticamente para que quede registrada en la nube
        try {
          const defaultConv = await getOrCreateConversation({
            student,
            parentUser: user || { uid: parentUid, nombre: 'Familia Díaz' },
            teacher: { id: 'teacher-carlos', name: 'Prof. Carlos Benítez', email: 'carlos.benitez@educore.edu.ar' },
            subjectName: 'Matemática I',
          });
          if (defaultConv?.id) {
            setConversations([defaultConv]);
            setActiveConvId(defaultConv.id);
          }
        } catch (e) {
          console.warn('Fallback a demo:', e);
          setConversations([DEMO_CONVERSATION]);
          setActiveConvId(DEMO_CONVERSATION.id);
        }
      }
    });

    return () => unsub();
  }, [user?.uid, student?.id]);

  // 2. Suscribirse a los mensajes del hilo activo en tiempo real
  useEffect(() => {
    if (!activeConvId) return;

    const unsub = subscribeToMessages(activeConvId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });

    return () => unsub();
  }, [activeConvId]);

  // 3. Manejo del Teclado para que no oculte el input
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const showSub = Keyboard.addListener(showEvent, () => {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      showSub.remove();
    };
  }, []);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0] || DEMO_CONVERSATION;

  // Enviar mensaje con persistencia en Firestore
  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: auth.currentUser?.uid || user?.uid || 'parent-demo',
      senderName: 'TÚ (TUTOR)',
      senderRole: 'Padre',
      text: textToSend,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      let targetConvId = activeConvId;

      // Si aún estamos en demo local y no existe en Firestore, crearla antes de enviar
      if (!targetConvId || targetConvId === 'demo-matematica') {
        const conv = await getOrCreateConversation({
          student,
          parentUser: user || { uid: auth.currentUser?.uid || 'parent-demo', nombre: 'Familia Díaz' },
          teacher: { id: 'teacher-carlos', name: 'Prof. Carlos Benítez', email: 'carlos.benitez@educore.edu.ar' },
          subjectName: 'Matemática I',
        });
        targetConvId = conv.id;
        setActiveConvId(conv.id);
      }

      await sendMessage(targetConvId, {
        senderId: auth.currentUser?.uid || user?.uid || 'parent-demo',
        senderName: user?.nombre || (user?.email ? `Familia ${user.email.split('@')[0]}` : 'Familia Díaz'),
        senderRole: 'Padre',
        text: textToSend,
      });
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  };

  // Crear nueva consulta oficial
  const handleStartNewChat = async () => {
    if (!selectedSubjectId) {
      Alert.alert('Atención', 'Por favor selecciona una materia y docente.');
      return;
    }

    const sub = ASIGNATURAS_DOCENTES.find((s) => s.id === selectedSubjectId);
    if (!sub) return;

    try {
      const conv = await getOrCreateConversation({
        student,
        parentUser: user || { uid: auth.currentUser?.uid || 'parent-demo', nombre: 'Familia Díaz' },
        teacher: { id: sub.id, name: sub.teacherName, email: sub.email },
        subjectName: sub.name,
      });

      if (initialMessageText.trim()) {
        await sendMessage(conv.id, {
          senderId: auth.currentUser?.uid || user?.uid || 'parent-demo',
          senderName: user?.nombre || 'TÚ (TUTOR)',
          senderRole: 'Padre',
          text: initialMessageText.trim(),
        });
      }

      setConversations((prev) => [conv, ...prev.filter((c) => c.id !== conv.id)]);
      setActiveConvId(conv.id);
      setIsNewModalOpen(false);
      setSelectedSubjectId('');
      setInitialMessageText('');
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo crear la consulta. Revisa tu conexión.');
    }
  };

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    inputBg: isDarkMode ? '#0F172A' : '#F1F5F9',
    sidebarBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    badgeBg: isDarkMode ? '#1E293B' : '#E2E8F0',
    bannerBg: isDarkMode ? '#1E293B' : '#F1F5F9',
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={{ flex: 1 }}
    >
      {/* ── ENCABEZADO SUPERIOR DEL CHAT ── */}
      <View style={[styles.headerCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBackToDashboard}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={20} color={theme.titleColor} />
            </TouchableOpacity>
            <Text
              style={[styles.headerTitle, { color: theme.titleColor }]}
              maxFontSizeMultiplier={1.15}
            >
              Mensajes y Consultas
            </Text>
          </View>

          <TouchableOpacity
            style={styles.newChatBtn}
            onPress={() => setIsNewModalOpen(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add-comment" size={15} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text style={styles.newChatBtnText} maxFontSizeMultiplier={1.15}>Nueva Consulta</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.headerSubtitle, { color: theme.subColor }]} maxFontSizeMultiplier={1.15}>
          Canal institucional para comunicarse con los docentes de{' '}
          <Text style={{ fontWeight: '700', color: '#EA580C' }}>{student.nombre}</Text>.
        </Text>
      </View>

      {/* ── CONTENEDOR PRINCIPAL DEL CHAT ── */}
      <View style={[styles.container, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        {/* Selector de materias / conversaciones horizontal */}
        {conversations.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.convHorizontalBar}
            contentContainerStyle={styles.convHorizontalContent}
          >
            {conversations.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setActiveConvId(c.id)}
                style={[
                  styles.convPill,
                  { backgroundColor: activeConvId === c.id ? '#EA580C' : theme.badgeBg },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.convPillText,
                    { color: activeConvId === c.id ? '#FFFFFF' : theme.titleColor },
                  ]}
                  numberOfLines={1}
                >
                  {c.subjectName} · {c.teacherName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── BANNER INSTITUCIONAL OFICIAL ── */}
        <View style={[styles.officialBanner, { backgroundColor: theme.bannerBg }]}>
          <MaterialIcons name="lock" size={14} color="#EA580C" style={{ marginRight: 6 }} />
          <Text style={[styles.officialBannerText, { color: theme.subColor }]}>
            Registro oficial institucional · Toda consulta queda asentada en el legajo escolar.
          </Text>
        </View>

        {/* ── HILO DE MENSAJES ── */}
        <ScrollView
          ref={chatScrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => {
            const isMe = msg.senderRole === 'Padre' || msg.senderName.includes('TÚ');
            const formatTime = typeof msg.createdAt === 'string'
              ? msg.createdAt
              : msg.createdAt?.toDate
              ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '11:20 a. m.';

            return (
              <View
                key={msg.id}
                style={[
                  styles.msgRow,
                  isMe ? styles.msgRowRight : styles.msgRowLeft,
                ]}
              >
                <View
                  style={[
                    styles.msgBubble,
                    isMe
                      ? styles.bubblePadre
                      : [styles.bubbleDocente, { backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9', borderColor: theme.border }],
                  ]}
                >
                  <View style={styles.bubbleHeader}>
                    <Text
                      style={[
                        styles.bubbleSender,
                        { color: isMe ? '#FFFFFF' : '#EA580C' },
                      ]}
                      maxFontSizeMultiplier={1.15}
                    >
                      {msg.senderName}
                    </Text>
                    <Text
                      style={[
                        styles.bubbleTime,
                        { color: isMe ? 'rgba(255,255,255,0.8)' : theme.subColor },
                      ]}
                      maxFontSizeMultiplier={1.1}
                    >
                      {formatTime}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.bubbleText,
                      { color: isMe ? '#FFFFFF' : theme.titleColor },
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ── BARRA INFERIOR DE ESCRITURA ── */}
        <View style={[styles.inputBar, { backgroundColor: theme.sidebarBg, borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.inputField, { backgroundColor: theme.inputBg, color: theme.titleColor, borderColor: theme.border }]}
            placeholder="Escribe tu consulta o mensaje para el docente..."
            placeholderTextColor={theme.subColor}
            value={inputText}
            onChangeText={setInputText}
            multiline
            onFocus={() => {
              setTimeout(() => {
                chatScrollRef.current?.scrollToEnd({ animated: true });
              }, 200);
            }}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isSending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            activeOpacity={0.8}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="send" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.sendBtnText}>Enviar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── MODAL: NUEVA CONSULTA ESCOLAR ── */}
      <Modal visible={isNewModalOpen} transparent animationType="fade" onRequestClose={() => setIsNewModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: theme.border }]}>
            {/* Cabecera Naranja Gradiente */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderSubtitle}>NUEVA CONSULTA ESCOLAR</Text>
                <Text style={styles.modalHeaderTitle}>{student.nombre}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsNewModalOpen(false)}>
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Selector de Materia */}
              <Text style={[styles.fieldTitle, { color: theme.titleColor }]}>
                SELECCIONAR MATERIA Y DOCENTE TITULAR
              </Text>

              <TouchableOpacity
                style={[styles.dropdownTrigger, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                onPress={() => setIsDropdownOpen((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownTriggerText, { color: selectedSubjectId ? theme.titleColor : theme.subColor }]} numberOfLines={1}>
                  {selectedSubjectId
                    ? ASIGNATURAS_DOCENTES.find((s) => s.id === selectedSubjectId)?.name + ' · ' + ASIGNATURAS_DOCENTES.find((s) => s.id === selectedSubjectId)?.teacherName
                    : '-- Elige la asignatura --'}
                </Text>
                <MaterialIcons
                  name={isDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={20}
                  color={theme.subColor}
                />
              </TouchableOpacity>

              {/* Lista Desplegable */}
              {isDropdownOpen && (
                <View style={[styles.dropdownList, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                  {ASIGNATURAS_DOCENTES.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.dropdownItem,
                        selectedSubjectId === s.id && { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' },
                      ]}
                      onPress={() => {
                        setSelectedSubjectId(s.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: selectedSubjectId === s.id ? '#EA580C' : theme.titleColor },
                          selectedSubjectId === s.id && { fontWeight: '700' },
                        ]}
                      >
                        {s.name} · {s.teacherName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Mensaje Inicial */}
              <Text style={[styles.fieldTitle, { color: theme.titleColor, marginTop: 16 }]}>
                MENSAJE INICIAL DE CONSULTA
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: theme.inputBg, color: theme.titleColor, borderColor: theme.border },
                ]}
                placeholder="Estimado docente, quería consultar respecto a..."
                placeholderTextColor={theme.subColor}
                multiline
                numberOfLines={4}
                value={initialMessageText}
                onChangeText={setInitialMessageText}
              />

              {/* Botones de Acción */}
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                  onPress={() => setIsNewModalOpen(false)}
                >
                  <Text style={[styles.modalCancelText, { color: theme.subColor }]}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, !selectedSubjectId && { opacity: 0.6 }]}
                  onPress={handleStartNewChat}
                  disabled={!selectedSubjectId}
                >
                  <Text style={styles.modalSubmitText}>Iniciar Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 160,
    marginRight: 6,
  },
  backBtn: {
    padding: 4,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    flexShrink: 1,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    flexShrink: 0,
    alignSelf: 'center',
  },
  newChatBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11.5,
    marginTop: 8,
    lineHeight: 16,
  },
  container: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 440,
    maxHeight: 520,
    flex: 1,
  },
  convHorizontalBar: {
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  convHorizontalContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  convPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  convPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  officialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  officialBannerText: {
    fontSize: 10.5,
    textAlign: 'center',
  },
  messagesScroll: {
    flex: 1,
    paddingHorizontal: 12,
  },
  messagesContent: {
    paddingVertical: 12,
    gap: 10,
  },
  msgRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  msgRowLeft: {
    justifyContent: 'flex-start',
  },
  msgRowRight: {
    justifyContent: 'flex-end',
  },
  msgBubble: {
    maxWidth: '86%',
    padding: 12,
    borderRadius: 16,
  },
  bubblePadre: {
    backgroundColor: '#EA580C',
    borderBottomRightRadius: 4,
  },
  bubbleDocente: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginBottom: 4,
    gap: 6,
  },
  bubbleSender: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  bubbleTime: {
    fontSize: 9.5,
    flexShrink: 0,
  },
  bubbleText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  inputField: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    maxHeight: 70,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#EA580C',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHeaderSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '800',
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  modalBody: {
    padding: 16,
  },
  fieldTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownTriggerText: {
    fontSize: 12,
    flex: 1,
  },
  dropdownList: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 180,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
  },
  dropdownItemText: {
    fontSize: 11.5,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 12,
    height: 90,
    textAlignVertical: 'top',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default FamilyChatTab;
