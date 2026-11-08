import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export interface GroupedRow {
  id: string;
  cells: (string | React.ReactNode)[];
}

interface GroupedListReportProps {
  title: string;
  columns: string[];
  rows: GroupedRow[];
  isDarkMode?: boolean;
}

export const GroupedListReport: React.FC<GroupedListReportProps> = ({
  title,
  columns,
  rows,
  isDarkMode = false,
}) => {
  const theme = {
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    titleColor: isDarkMode ? '#F8FAFC' : '#0F172A',
    headerBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    headerText: isDarkMode ? '#94A3B8' : '#64748B',
    badgeBg: isDarkMode ? '#334155' : '#FFFFFF',
    badgeBorder: isDarkMode ? '#475569' : '#E2E8F0',
    badgeText: isDarkMode ? '#94A3B8' : '#64748B',
    rowBorder: isDarkMode ? '#33415550' : '#F1F5F9',
    textColor: isDarkMode ? '#F1F5F9' : '#334155',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      {/* Header con Título y Badge de Total */}
      <View style={[styles.headerRow, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.titleColor }]}>{title}</Text>
        <View style={[styles.totalBadge, { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder }]}>
          <Text style={[styles.totalBadgeText, { color: theme.badgeText }]}>
            Total: {rows.length} {rows.length === 1 ? 'registro' : 'registros'}
          </Text>
        </View>
      </View>

      {/* Tabla con Scroll Horizontal y Vertical */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} nestedScrollEnabled={true}>
        <View style={styles.tableWrapper}>
          {/* Fila de Encabezados */}
          <View style={[styles.theadRow, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
            {columns.map((col, idx) => (
              <View key={idx} style={[styles.thCell, idx === 0 && { width: 170 }, idx > 0 && { width: 150 }]}>
                <Text style={[styles.thText, { color: theme.headerText }]}>{col}</Text>
              </View>
            ))}
          </View>

          {/* Filas de Datos */}
          {rows.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={[styles.emptyText, { color: theme.headerText }]}>
                No hay datos disponibles para este reporte.
              </Text>
            </View>
          ) : (
            rows.map((row, rIdx) => (
              <View
                key={row.id || String(rIdx)}
                style={[
                  styles.tbodyRow,
                  { borderBottomColor: theme.rowBorder },
                  rIdx % 2 === 1 && { backgroundColor: isDarkMode ? '#0F172A25' : '#F8FAFC50' },
                ]}
              >
                {row.cells.map((cell, cIdx) => (
                  <View
                    key={cIdx}
                    style={[styles.tdCell, cIdx === 0 && { width: 170 }, cIdx > 0 && { width: 150 }]}
                  >
                    {typeof cell === 'string' ? (
                      <Text
                        style={[
                          styles.tdText,
                          { color: theme.textColor },
                          cIdx === 0 && { fontWeight: '700', color: theme.titleColor },
                        ]}
                        numberOfLines={2}
                      >
                        {cell}
                      </Text>
                    ) : (
                      cell
                    )}
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default GroupedListReport;

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  totalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tableWrapper: {
    minWidth: '100%',
  },
  theadRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  thCell: {
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  thText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tbodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  tdCell: {
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  tdText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyRow: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
