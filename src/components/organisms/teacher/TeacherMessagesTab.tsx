import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  ConversationItem,
  ChatMessage,
  subscribeToTeacherConversations,
  subscribeToMessages,
  sendMessage,
  markConversationAsRead,
  TEACHER_DEMO_CONVERSATIONS,
} from '../../../services/chatService';
import { TeacherCourseSubject } from '../../../services/teacherService';

interface TeacherMessagesTabProps {
  user?: any;
  subjects?: TeacherCourseSubject[];
  isDarkMode?: boolean;
}

const QUICK_RESPONSES = [
  'Buenas tardes. Con gusto le respondo la inquietud.',
  'Estimada familia, el estudiante viene participando con mucho compromiso.',
  'Confirmado. Le recuerdo que la entrega límite es el próximo viernes.',
  'Cualquier consulta adicional, quedo a su disposición en este canal.',
];

export const TeacherMessagesTab: React.FC<TeacherMessagesTabProps> = ({
  user,
  subjects = [],
  isDarkMode = true,
}) => {
  const [conversations, setConversations] = useState<ConversationItem[]>(TEACHER_DEMO_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [isSubjectPickerOpen, setIsSubjectPickerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const chatScrollRef = useRef<any>(null);

  // 1. Suscripción en tiempo real a las consultas dirigidas al docente
  useEffect(() => {
    const unsub = subscribeToTeacherConversations(user, (convs) => {
      if (convs && convs.length > 0) {
        setConversations(convs);
      }
    });

    return () => unsub();
  }, [user]);

  // 2. Suscripción a los mensajes cuando se abre un chat
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    markConversationAsRead(activeConversation.id, 'Docente');

    const unsub = subscribeToMessages(activeConversation.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });

    return () => unsub();
  }, [activeConversation]);

  // Total de consultas sin responder
  const totalUnread = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadByTeacher || 0), 0);
  }, [conversations]);

  // Filtro de lista
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (filterMode === 'unread' && (!c.unreadByTeacher || c.unreadByTeacher === 0)) {
        return false;
      }

      if (selectedSubjectFilter !== 'all' && c.subjectName !== selectedSubjectFilter) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const student = (c.studentName || '').toLowerCase();
        const parent = (c.parentName || '').toLowerCase();
        const subject = (c.subjectName || '').toLowerCase();
        const course = (c.studentCourse || '').toLowerCase();
        return (
          student.includes(query) ||
          parent.includes(query) ||
          subject.includes(query) ||
          course.includes(query)
        );
      }

      return true;
    });
  }, [conversations, filterMode, selectedSubjectFilter, searchTerm]);

  // Lista única de materias para el dropdown
  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    conversations.forEach((c) => {
      if (c.subjectName) set.add(c.subjectName);
    });
    subjects.forEach((s) => {
      if (s.name) set.add(s.name);
    });
    return Array.from(set);
  }, [conversations, subjects]);

  // Acción: Enviar respuesta
  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConversation || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    const newMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      senderId: user?.uid || 'teacher-fontana',
      senderName: user?.nombre || 'Prof. Federico Fontana',
      senderRole: 'Docente',
      text: textToSend,
      createdAt: 'Ahora',
    };

    // Actualización optimista inmediata
    setMessages((prev) => [...prev, newMsg]);
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      await sendMessage(activeConversation.id, {
        senderId: user?.uid || 'teacher-fontana',
        senderName: user?.nombre || 'Prof. Federico Fontana',
        senderRole: 'Docente',
        text: textToSend,
      });

      // Actualizar último mensaje en la lista local
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                lastMessage: textToSend,
                lastSenderRole: 'Docente',
                lastMessageAt: 'Hoy',
                unreadByTeacher: 0,
              }
            : c
        )
      );
    } catch (err) {
      console.warn('Error al enviar mensaje en Firestore:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleUseQuickResponse = (text: string) => {
    setInputText((prev) => (prev ? `${prev} ${text}` : text));
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AL';
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  };

  const theme = {
    bg: isDarkMode ? '#0A0F1D' : '#F8FAFC',
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#1E293B' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    inputBg: isDarkMode ? '#0B1220' : '#F1F5F9',
    tagBg: isDarkMode ? '#1E293B' : '#E2E8F0',
    tagText: isDarkMode ? '#CBD5E1' : '#334155',
    activePillBg: isDarkMode ? '#1E293B' : '#0F172A',
    inactivePillBg: isDarkMode ? '#0B1220' : '#F1F5F9',
    rowHover: isDarkMode ? '#131D31' : '#F8FAFC',
  };

  return (
    <View style={styles.container}>
      {/* ── CARD CABECERA: MENSAJES Y CONSULTAS DE FAMILIAS ── */}
      <View style={[styles.headerCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconBadge}>
            <MaterialIcons name="chat" size={20} color="#EA580C" />
          </View>
          <View style={styles.headerTextWrapper}>
            <Text style={[styles.headerTitle, { color: theme.titleColor }]}>
              Mensajes y Consultas de Familias
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.subColor }]}>
              Canal oficial de tutoría y diálogo pedagógico con constancia institucional en tiempo real.
            </Text>
          </View>
        </View>

        <View style={styles.officialPill}>
          <View style={styles.officialDot} />
          <Text style={styles.officialPillText}>Registro Oficial Habilitado</Text>
        </View>
      </View>

      {/* ── BARRA DE BÚSQUEDA Y FILTROS ── */}
      <View style={[styles.filterBarCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        {/* Input Buscador */}
        <View style={[styles.searchInputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <MaterialIcons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={[styles.searchInput, { color: theme.titleColor }]}
            placeholder="Buscar por alumno, tutor o materia..."
            placeholderTextColor="#64748B"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')} activeOpacity={0.7}>
              <MaterialIcons name="close" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Chips de Filtro y Dropdown de Materia */}
        <View style={styles.chipsRow}>
          <View style={styles.chipsLeft}>
            {/* Chip Todas */}
            <TouchableOpacity
              style={[
                styles.chipButton,
                filterMode === 'all'
                  ? { backgroundColor: theme.activePillBg, borderColor: '#334155' }
                  : { backgroundColor: theme.inactivePillBg, borderColor: theme.border },
              ]}
              onPress={() => setFilterMode('all')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipButtonText,
                  { color: filterMode === 'all' ? '#FFFFFF' : theme.subColor },
                ]}
              >
                Todas ({conversations.length})
              </Text>
            </TouchableOpacity>

            {/* Chip Sin responder */}
            <TouchableOpacity
              style={[
                styles.chipButton,
                filterMode === 'unread'
                  ? { backgroundColor: '#EA580C', borderColor: '#EA580C' }
                  : { backgroundColor: theme.inactivePillBg, borderColor: theme.border },
              ]}
              onPress={() => setFilterMode('unread')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipButtonText,
                  { color: filterMode === 'unread' ? '#FFFFFF' : theme.subColor },
                ]}
              >
                Sin responder
              </Text>
              {totalUnread > 0 && (
                <View
                  style={[
                    styles.unreadCounterBadge,
                    { backgroundColor: filterMode === 'unread' ? '#FFFFFF' : '#EA580C' },
                  ]}
                >
                  <Text
                    style={[
                      styles.unreadCounterText,
                      { color: filterMode === 'unread' ? '#EA580C' : '#FFFFFF' },
                    ]}
                  >
                    {totalUnread}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Selector de Materias Dropdown */}
          <TouchableOpacity
            style={[styles.subjectDropdownBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
            onPress={() => setIsSubjectPickerOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.subjectDropdownText, { color: theme.titleColor }]} numberOfLines={1}>
              {selectedSubjectFilter === 'all' ? 'Todas las materias' : selectedSubjectFilter}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── LISTADO DE CONVERSACIONES ── */}
      <View style={[styles.conversationsCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        {filteredConversations.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="mark-chat-read" size={40} color="#64748B" />
            <Text style={[styles.emptyTitle, { color: theme.titleColor }]}>
              No hay consultas en esta sección
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.subColor }]}>
              Cuando los tutores envíen consultas sobre sus asignaturas, aparecerán listadas aquí.
            </Text>
          </View>
        ) : (
          filteredConversations.map((conv, index) => {
            const hasUnread = (conv.unreadByTeacher || 0) > 0;
            const initials = getInitials(conv.studentName);
            const isLast = index === filteredConversations.length - 1;

            return (
              <TouchableOpacity
                key={conv.id || index}
                style={[
                  styles.conversationItemRow,
                  { borderBottomColor: theme.border },
                  isLast && { borderBottomWidth: 0 },
                  hasUnread && styles.conversationItemUnread,
                ]}
                onPress={() => setActiveConversation(conv)}
                activeOpacity={0.7}
              >
                {/* Avatar Iniciales */}
                <View style={styles.avatarContainer}>
                  <View
                    style={[
                      styles.avatarBadge,
                      hasUnread
                        ? { backgroundColor: '#F97316' }
                        : { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarBadgeText,
                        { color: hasUnread ? '#FFFFFF' : theme.titleColor },
                      ]}
                    >
                      {initials}
                    </Text>
                  </View>
                  {hasUnread && <View style={styles.unreadAvatarDot} />}
                </View>

                {/* Detalles de la conversación */}
                <View style={styles.convDetailsCol}>
                  <View style={styles.convTopLine}>
                    <Text
                      style={[
                        styles.convStudentName,
                        { color: theme.titleColor },
                        hasUnread && { fontWeight: '800' },
                      ]}
                    >
                      {conv.studentName}
                    </Text>
                    <Text style={[styles.convDateText, { color: theme.subColor }]}>
                      {typeof conv.lastMessageAt === 'string'
                        ? conv.lastMessageAt
                        : '09-nov'}
                    </Text>
                  </View>

                  {/* Pills de Materia y Curso */}
                  <View style={styles.convMetaRow}>
                    <View style={[styles.subjectPill, { backgroundColor: theme.tagBg }]}>
                      <Text style={[styles.subjectPillText, { color: theme.tagText }]}>
                        {conv.subjectName}
                      </Text>
                    </View>
                    {conv.studentCourse && (
                      <Text style={[styles.courseLabelText, { color: theme.subColor }]}>
                        · {conv.studentCourse}
                      </Text>
                    )}
                  </View>

                  {/* Tutor y último mensaje */}
                  <View style={styles.convLastMessageRow}>
                    <MaterialIcons name="person" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
                    <Text style={[styles.convTutorName, { color: theme.titleColor }]} numberOfLines={1}>
                      {conv.parentName || 'Familia'}:
                    </Text>
                    <Text style={[styles.convLastMessageSnippet, { color: theme.subColor }]} numberOfLines={1}>
                      {conv.lastMessage || 'Consulta iniciada'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* ── MODAL DE CHAT INTERACTIVO CON LA FAMILIA ── */}
      <Modal
        visible={!!activeConversation}
        animationType="slide"
        onRequestClose={() => setActiveConversation(null)}
      >
        <KeyboardAvoidingView
          style={[styles.modalScreenContainer, { backgroundColor: theme.bg }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header del Chat */}
          <View style={[styles.chatModalHeader, { backgroundColor: theme.cardBg, borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={styles.chatBackButton}
              onPress={() => setActiveConversation(null)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={22} color={theme.titleColor} />
            </TouchableOpacity>

            <View style={styles.chatHeaderAvatar}>
              <Text style={styles.chatHeaderAvatarText}>
                {getInitials(activeConversation?.studentName)}
              </Text>
            </View>

            <View style={styles.chatHeaderInfo}>
              <View style={styles.chatHeaderTitleRow}>
                <Text style={[styles.chatHeaderStudentName, { color: theme.titleColor }]} numberOfLines={1}>
                  {activeConversation?.studentName}
                </Text>
                <View style={styles.chatSubjectTag}>
                  <Text style={styles.chatSubjectTagText}>
                    {activeConversation?.subjectName}
                  </Text>
                </View>
              </View>
              <Text style={[styles.chatHeaderTutorMeta, { color: theme.subColor }]} numberOfLines={1}>
                Tutor: {activeConversation?.parentName}
              </Text>
            </View>

            <View style={[styles.institutionalBadge, { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
              <MaterialIcons name="verified" size={14} color="#10B981" />
              <Text style={[styles.institutionalBadgeText, { color: theme.subColor }]}>Oficial</Text>
            </View>
          </View>

          {/* Banner de Trazabilidad Institucional */}
          <View style={[styles.traceabilityNotice, { backgroundColor: isDarkMode ? 'rgba(217, 119, 6, 0.12)' : '#FEF3C7', borderColor: 'rgba(217, 119, 6, 0.3)' }]}>
            <MaterialIcons name="lock" size={16} color="#D97706" style={{ marginRight: 6, marginTop: 1 }} />
            <Text style={[styles.traceabilityNoticeText, { color: isDarkMode ? '#FCD34D' : '#92400E' }]}>
              <Text style={{ fontWeight: '800' }}>Comunicación Pedagógica Institucional:</Text> Las respuestas emitidas por el equipo docente quedan registradas de manera oficial con fecha y hora para garantizar transparencia y seguimiento del alumno.
            </Text>
          </View>

          {/* Lista de Mensajes */}
          <ScrollView
            ref={chatScrollRef}
            style={styles.chatMessagesArea}
            contentContainerStyle={styles.chatMessagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyMessagesBox}>
                <MaterialIcons name="chat-bubble-outline" size={32} color="#64748B" />
                <Text style={[styles.emptyMessagesTitle, { color: theme.titleColor }]}>
                  No hay mensajes previos
                </Text>
                <Text style={[styles.emptyMessagesSub, { color: theme.subColor }]}>
                  Escriba un mensaje debajo para responder a la familia.
                </Text>
              </View>
            ) : (
              messages.map((msg, index) => {
                const isDocente =
                  msg.senderRole === 'Docente' ||
                  msg.senderRole === 'Staff' ||
                  msg.senderId === user?.uid ||
                  msg.senderId === 'teacher-fontana';

                return (
                  <View
                    key={msg.id || index}
                    style={[
                      styles.messageRow,
                      isDocente ? styles.messageRowRight : styles.messageRowLeft,
                    ]}
                  >
                    <Text style={[styles.messageAuthorMeta, { color: theme.subColor }]}>
                      {isDocente ? `Usted (${user?.nombre || 'Docente'})` : msg.senderName || 'Tutor'}{' '}
                      · {typeof msg.createdAt === 'string' ? msg.createdAt : 'reciente'}
                    </Text>

                    <View
                      style={[
                        styles.messageBubble,
                        isDocente
                          ? styles.messageBubbleDocente
                          : [
                              styles.messageBubbleTutor,
                              {
                                backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                                borderColor: theme.border,
                              },
                            ],
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageBubbleText,
                          { color: isDocente ? '#FFFFFF' : theme.titleColor },
                        ]}
                      >
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Sugerencias de Respuestas Rápidas */}
          <View style={[styles.quickResponsesBar, { backgroundColor: theme.cardBg, borderTopColor: theme.border }]}>
            <Text style={[styles.quickResponsesLabel, { color: theme.subColor }]}>
              SUGERENCIAS:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickChipsContent}>
              {QUICK_RESPONSES.map((qr, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.quickChipBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                  onPress={() => handleUseQuickResponse(qr)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickChipBtnText, { color: theme.titleColor }]}>
                    {qr}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Formulario de Respuesta */}
          <View style={[styles.chatInputBar, { backgroundColor: theme.cardBg, borderTopColor: theme.border }]}>
            <TextInput
              style={[
                styles.chatInputBox,
                {
                  backgroundColor: theme.inputBg,
                  color: theme.titleColor,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Escriba su respuesta a la familia..."
              placeholderTextColor="#64748B"
              multiline
              value={inputText}
              onChangeText={setInputText}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isSending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isSending}
              activeOpacity={0.8}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="send" size={16} color="#FFFFFF" />
                  <Text style={styles.sendButtonText}>Responder</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── MODAL SELECTOR DE MATERIAS ── */}
      <Modal
        visible={isSubjectPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSubjectPickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setIsSubjectPickerOpen(false)}
        >
          <View style={[styles.pickerCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.pickerTitle, { color: theme.titleColor }]}>Filtrar por Materia</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  selectedSubjectFilter === 'all' && styles.pickerItemActive,
                  { borderBottomColor: theme.border },
                ]}
                onPress={() => {
                  setSelectedSubjectFilter('all');
                  setIsSubjectPickerOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    { color: selectedSubjectFilter === 'all' ? '#EA580C' : theme.titleColor },
                  ]}
                >
                  Todas las materias
                </Text>
                {selectedSubjectFilter === 'all' && (
                  <MaterialIcons name="check" size={18} color="#EA580C" />
                )}
              </TouchableOpacity>

              {uniqueSubjects.map((subName) => (
                <TouchableOpacity
                  key={subName}
                  style={[
                    styles.pickerItem,
                    selectedSubjectFilter === subName && styles.pickerItemActive,
                    { borderBottomColor: theme.border },
                  ]}
                  onPress={() => {
                    setSelectedSubjectFilter(subName);
                    setIsSubjectPickerOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      { color: selectedSubjectFilter === subName ? '#EA580C' : theme.titleColor },
                    ]}
                  >
                    {subName}
                  </Text>
                  {selectedSubjectFilter === subName && (
                    <MaterialIcons name="check" size={18} color="#EA580C" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 28,
  },
  // ── CABECERA ──
  headerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 240,
  },
  headerIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrapper: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 15,
  },
  officialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    gap: 6,
  },
  officialDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  officialPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },

  // ── FILTROS Y BÚSQUEDA ──
  filterBarCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  unreadCounterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  unreadCounterText: {
    fontSize: 10,
    fontWeight: '800',
  },
  subjectDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    maxWidth: 180,
  },
  subjectDropdownText: {
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },

  // ── LISTADO CONVERSACIONES ──
  conversationsCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  conversationItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  conversationItemUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
    backgroundColor: 'rgba(249, 115, 22, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  unreadAvatarDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EA580C',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  convDetailsCol: {
    flex: 1,
  },
  convTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  convStudentName: {
    fontSize: 13,
    fontWeight: '700',
  },
  convDateText: {
    fontSize: 10,
    fontWeight: '600',
  },
  convMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  subjectPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  courseLabelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  convLastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  convTutorName: {
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 160,
  },
  convLastMessageSnippet: {
    fontSize: 11,
    flex: 1,
  },

  // ── VACÍO ──
  emptyBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },

  // ── MODAL CHAT ──
  modalScreenContainer: {
    flex: 1,
  },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  chatBackButton: {
    padding: 4,
  },
  chatHeaderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatHeaderStudentName: {
    fontSize: 14,
    fontWeight: '800',
    maxWidth: 160,
  },
  chatSubjectTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  chatSubjectTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F97316',
  },
  chatHeaderTutorMeta: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  institutionalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  institutionalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  traceabilityNotice: {
    margin: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  traceabilityNoticeText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  chatMessagesArea: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: 14,
    gap: 14,
  },
  emptyMessagesBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMessagesTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyMessagesSub: {
    fontSize: 11,
    marginTop: 4,
  },
  messageRow: {
    maxWidth: '85%',
  },
  messageRowLeft: {
    alignSelf: 'flex-start',
  },
  messageRowRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageAuthorMeta: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  messageBubbleDocente: {
    backgroundColor: '#EA580C',
    borderBottomRightRadius: 2,
  },
  messageBubbleTutor: {
    borderWidth: 1,
    borderBottomLeftRadius: 2,
  },
  messageBubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  quickResponsesBar: {
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quickResponsesLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  quickChipsContent: {
    gap: 8,
    paddingRight: 12,
  },
  quickChipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickChipBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chatInputBar: {
    borderTopWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  chatInputBox: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
  },
  sendButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#EA580C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── MODAL PICKER MATERIAS ──
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  pickerItemActive: {
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
  },
  pickerItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
