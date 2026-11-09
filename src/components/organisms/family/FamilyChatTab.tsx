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

interface FamilyChatTabProps {
  student: FamilyStudent;
  user: any;
  onBackToDashboard?: () => void;
  isDarkMode?: boolean;
}

const ASIGNATURAS_DOCENTES = [
  { id: 'sub-1', name: 'Matemática I', teacherName: 'Prof. Carlos Benítez' },
  { id: 'sub-2', name: 'Lengua y Literatura', teacherName: 'Prof. Carmen Delgado' },
  { id: 'sub-3', name: 'Química General', teacherName: 'Prof. Alejandro Varela' },
  { id: 'sub-4', name: 'Historia Argentina y Universal', teacherName: 'Prof. Silvina Morales' },
  { id: 'sub-5', name: 'Inglés Avanzado', teacherName: 'Prof. Sarah Jenkins' },
  { id: 'sub-6', name: 'Biología Celular', teacherName: 'Prof. Federico Fontana' },
];

export const FamilyChatTab: React.FC<FamilyChatTabProps> = ({
  student,
  user,
  onBackToDashboard,
  isDarkMode = true,
}) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([DEMO_CONVERSATION]);
  const [activeConvId, setActiveConvId] = useState<string>(DEMO_CONVERSATION.id);
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Modal Nueva Consulta
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [initialMessageText, setInitialMessageText] = useState('');

  const chatScrollRef = useRef<any>(null);

  useEffect(() => {
    const unsub = subscribeToFamilyConversations(user?.uid || 'parent-demo', (convs) => {
      setConversations(convs);
      if (convs.length > 0 && !activeConvId) {
        setActiveConvId(convs[0].id);
      }
    });
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (!activeConvId) return;
    const unsub = subscribeToMessages(activeConvId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => unsub();
  }, [activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    const newMsg: ChatMessage = {
      id: `local-msg-${Date.now()}`,
      senderId: user?.uid || 'parent-demo',
      senderName: 'TÚ (TUTOR)',
      senderRole: 'Padre',
      text: textToSend,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);

    await sendMessage(activeConvId, {
      senderId: user?.uid || 'parent-demo',
      senderName: user?.nombre || 'Tutor',
      senderRole: 'Padre',
      text: textToSend,
    });

    setIsSending(false);
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const handleStartNewChat = async () => {
    if (!selectedSubjectId) {
      Alert.alert('Atención', 'Por favor selecciona una materia y docente.');
      return;
    }

    const sub = ASIGNATURAS_DOCENTES.find((s) => s.id === selectedSubjectId);
    if (!sub) return;

    const conv = await getOrCreateConversation({
      student,
      parentUser: user || { uid: 'parent-demo', nombre: 'Familia Díaz' },
      teacher: { id: sub.id, name: sub.teacherName },
      subjectName: sub.name,
    });

    if (initialMessageText.trim()) {
      await sendMessage(conv.id, {
        senderId: user?.uid || 'parent-demo',
        senderName: 'TÚ (TUTOR)',
        senderRole: 'Padre',
        text: initialMessageText.trim(),
      });
    }

    setConversations((prev) => [conv, ...prev.filter((c) => c.id !== conv.id)]);
    setActiveConvId(conv.id);
    setIsNewModalOpen(false);
    setSelectedSubjectId('');
    setInitialMessageText('');
  };

  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    chatBoxBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    inputBg: isDarkMode ? '#1E293B' : '#F1F5F9',
    teacherBubbleBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    teacherBubbleBorder: isDarkMode ? '#334155' : '#E2E8F0',
    tutorBubbleBg: '#EA580C',
  };

  const selectedSubjectObj = ASIGNATURAS_DOCENTES.find((s) => s.id === selectedSubjectId);

  return (
    <View style={styles.container}>
      {/* ── CABECERA DE CONSULTAS ── */}
      <View style={[styles.headerCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.headerLeft}>
          {onBackToDashboard && (
            <TouchableOpacity onPress={onBackToDashboard} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={22} color={theme.titleColor} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.title, { color: theme.titleColor }]}>
              Mensajes y Consultas Oficiales
            </Text>
            <Text style={[styles.subtitle, { color: theme.subColor }]}>
              Canal institucional para comunicarse con los docentes de {student?.nombre || 'Martina Díaz'}.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.newConsultBtn}
          onPress={() => setIsNewModalOpen(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add-comment" size={16} color="#FFFFFF" style={{ marginRight: 5 }} />
          <Text style={styles.newConsultBtnText}>Nueva Consulta</Text>
        </TouchableOpacity>
      </View>

      {/* ── SELECTOR HORIZONTAL DE CONVERSACIONES ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.convScroll}
      >
        {conversations.map((c) => {
          const isActive = c.id === activeConvId;
          const initial = c.subjectName ? c.subjectName.charAt(0).toUpperCase() : 'M';
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => setActiveConvId(c.id)}
              style={[
                styles.convPill,
                {
                  backgroundColor: isActive ? 'rgba(234, 88, 12, 0.15)' : theme.cardBg,
                  borderColor: isActive ? '#EA580C' : theme.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.convAvatar, { backgroundColor: isActive ? '#EA580C' : '#334155' }]}>
                <Text style={styles.convAvatarText}>{initial}</Text>
              </View>
              <View>
                <Text style={[styles.convSubject, { color: theme.titleColor }]} numberOfLines={1}>
                  {c.subjectName}
                </Text>
                <Text style={[styles.convTeacher, { color: theme.subColor }]} numberOfLines={1}>
                  {c.teacherName}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── VENTANA DE CHAT ACTIVO ── */}
      <View style={[styles.chatWindow, { backgroundColor: theme.chatBoxBg, borderColor: theme.border }]}>
        {/* Banner de Trazabilidad Oficial con Candado */}
        <View style={styles.traceBanner}>
          <MaterialIcons name="lock" size={13} color="#EA580C" style={{ marginRight: 5 }} />
          <Text style={styles.traceBannerText}>
            Registro oficial institucional · Toda consulta queda asentada en el legajo escolar.
          </Text>
        </View>

        {/* Lista de Mensajes */}
        <ScrollView
          ref={chatScrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isMe = msg.senderRole === 'Padre';
            return (
              <View
                key={msg.id}
                style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}
              >
                <View
                  style={[
                    styles.msgBubble,
                    isMe
                      ? [styles.tutorBubble, { backgroundColor: theme.tutorBubbleBg }]
                      : [styles.teacherBubble, { backgroundColor: theme.teacherBubbleBg, borderColor: theme.teacherBubbleBorder }],
                  ]}
                >
                  <View style={styles.msgMetaRow}>
                    <Text
                      style={[
                        styles.senderLabel,
                        { color: isMe ? '#FFEDD5' : '#EA580C' },
                      ]}
                    >
                      {msg.senderName}
                    </Text>
                    <Text style={[styles.timeLabel, { color: isMe ? '#FFFFFF99' : theme.subColor }]}>
                      {msg.createdAt || ''}
                    </Text>
                  </View>
                  <Text style={[styles.msgText, { color: isMe ? '#FFFFFF' : theme.titleColor }]}>
                    {msg.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Barra de Entrada de Texto */}
        <View style={[styles.inputBar, { backgroundColor: theme.cardBg, borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.titleColor }]}
            placeholder="Escribe tu consulta o mensaje para el docente..."
            placeholderTextColor={theme.subColor}
            value={inputText}
            onChangeText={setInputText}
            multiline={false}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            style={[
              styles.sendBtn,
              { opacity: inputText.trim() && !isSending ? 1 : 0.5 },
            ]}
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

      {/* ── MODAL NUEVA CONSULTA ESCOLAR ── */}
      <Modal visible={isNewModalOpen} transparent animationType="fade" onRequestClose={() => setIsNewModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {/* Header Naranja con Título */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalCategory}>NUEVA CONSULTA ESCOLAR</Text>
                <Text style={styles.modalStudentName}>{student?.nombre || 'Martina Díaz'}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsNewModalOpen(false)}>
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Contenido del Formulario */}
            <View style={styles.modalBody}>
              <Text style={[styles.formLabel, { color: theme.subColor }]}>
                SELECCIONAR MATERIA Y DOCENTE TITULAR
              </Text>

              {/* Selector Desplegable */}
              <TouchableOpacity
                style={[styles.dropdownTrigger, { backgroundColor: theme.chatBoxBg, borderColor: theme.border }]}
                onPress={() => setIsDropdownOpen((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownTriggerText,
                    { color: selectedSubjectObj ? theme.titleColor : theme.subColor },
                  ]}
                  numberOfLines={1}
                >
                  {selectedSubjectObj
                    ? `${selectedSubjectObj.name} · ${selectedSubjectObj.teacherName}`
                    : '-- Elige la asignatura --'}
                </Text>
                <MaterialIcons
                  name={isDropdownOpen ? 'expand-less' : 'expand-more'}
                  size={20}
                  color={theme.subColor}
                />
              </TouchableOpacity>

              {/* Opciones Desplegables */}
              {isDropdownOpen && (
                <View style={[styles.dropdownList, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                  {ASIGNATURAS_DOCENTES.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.dropdownOption,
                        selectedSubjectId === s.id && { backgroundColor: 'rgba(234, 88, 12, 0.15)' },
                      ]}
                      onPress={() => {
                        setSelectedSubjectId(s.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          {
                            color: selectedSubjectId === s.id ? '#EA580C' : theme.titleColor,
                            fontWeight: selectedSubjectId === s.id ? '700' : '500',
                          },
                        ]}
                      >
                        {s.name} · {s.teacherName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Mensaje Inicial */}
              <Text style={[styles.formLabel, { color: theme.subColor, marginTop: 14 }]}>
                MENSAJE INICIAL DE CONSULTA
              </Text>
              <TextInput
                style={[
                  styles.textarea,
                  { backgroundColor: theme.chatBoxBg, borderColor: theme.border, color: theme.titleColor },
                ]}
                placeholder="Estimado docente, quería consultar respecto a..."
                placeholderTextColor={theme.subColor}
                value={initialMessageText}
                onChangeText={setInitialMessageText}
                multiline
                numberOfLines={3}
              />

              {/* Botones de Acción */}
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: theme.border }]}
                  onPress={() => setIsNewModalOpen(false)}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.titleColor }]}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.startChatBtn, { opacity: selectedSubjectId ? 1 : 0.5 }]}
                  onPress={handleStartNewChat}
                  disabled={!selectedSubjectId}
                >
                  <Text style={styles.startChatBtnText}>Iniciar Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FamilyChatTab;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  newConsultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  newConsultBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  convScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  convPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
    maxWidth: 200,
  },
  convAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  convAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  convSubject: {
    fontSize: 12,
    fontWeight: '700',
  },
  convTeacher: {
    fontSize: 10,
    fontWeight: '500',
  },
  chatWindow: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    height: 480,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  traceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(234, 88, 12, 0.2)',
  },
  traceBannerText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#EA580C',
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
  },
  msgRowLeft: {
    justifyContent: 'flex-start',
  },
  msgRowRight: {
    justifyContent: 'flex-end',
  },
  msgBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  teacherBubble: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  tutorBubble: {
    borderTopRightRadius: 4,
  },
  msgMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  senderLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12.5,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#EA580C',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFEDD5',
    letterSpacing: 0.6,
  },
  modalStudentName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  modalBody: {
    padding: 18,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownTriggerText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  dropdownList: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
    maxHeight: 180,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  dropdownOptionText: {
    fontSize: 11.5,
  },
  textarea: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 12,
    textAlignVertical: 'top',
    height: 75,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  startChatBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
  },
  startChatBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
