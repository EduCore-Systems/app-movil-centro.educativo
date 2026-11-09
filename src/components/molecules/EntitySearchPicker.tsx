import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface PickerItem {
  id: string;
  title: string;
  subtitle?: string;
}

interface EntitySearchPickerProps {
  label: string;
  placeholder: string;
  items: PickerItem[];
  selectedId: string;
  onSelectItem: (id: string) => void;
  isDarkMode?: boolean;
}

export const EntitySearchPicker: React.FC<EntitySearchPickerProps> = ({
  label,
  placeholder,
  items,
  selectedId,
  onSelectItem,
  isDarkMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedItem = items.find((i) => i.id === selectedId);

  const filteredItems = items.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.subtitle && i.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  const theme = {
    btnBg: isDarkMode ? '#1E293B' : '#0F172A',
    btnBorder: isDarkMode ? '#475569' : '#1E293B',
    btnText: isDarkMode ? '#F8FAFC' : '#FFFFFF',
    modalBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    subColor: isDarkMode ? '#94A3B8' : '#64748B',
    inputBg: isDarkMode ? '#1E293B' : '#F8FAFC',
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.inputLabel, { color: theme.subColor }]}>{label.toUpperCase()}</Text>

      <TouchableOpacity
        style={[styles.selectBtn, { backgroundColor: theme.btnBg, borderColor: theme.btnBorder }]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.85}
      >
        <Text style={[styles.selectBtnText, { color: theme.btnText }]} numberOfLines={1}>
          {selectedItem ? selectedItem.title : placeholder}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={22} color={theme.btnText} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.modalBg, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.titleColor }]}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <MaterialIcons name="close" size={22} color={theme.subColor} />
              </TouchableOpacity>
            </View>

            {/* Input de Búsqueda */}
            <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <MaterialIcons name="search" size={20} color={theme.subColor} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: theme.titleColor }]}
                placeholder="Filtrar por nombre o DNI..."
                placeholderTextColor={theme.subColor}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <MaterialIcons name="close" size={18} color={theme.subColor} />
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {filteredItems.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={[styles.emptyText, { color: theme.subColor }]}>
                    No se encontraron coincidencias.
                  </Text>
                </View>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = item.id === selectedId;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.itemRow,
                        isSelected && styles.itemRowActive,
                        { borderColor: theme.border },
                      ]}
                      onPress={() => {
                        onSelectItem(item.id);
                        setIsOpen(false);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.itemTitle,
                            { color: isSelected ? '#EA580C' : theme.titleColor },
                            isSelected && { fontWeight: '800' },
                          ]}
                        >
                          {item.title}
                        </Text>
                        {item.subtitle ? (
                          <Text style={[styles.itemSub, { color: theme.subColor }]}>{item.subtitle}</Text>
                        ) : null}
                      </View>
                      {isSelected && <MaterialIcons name="check" size={20} color="#EA580C" />}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EntitySearchPicker;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  selectBtnText: {
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
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#33415522',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  itemRowActive: {
    borderColor: '#EA580C',
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
