import { Font, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Appointment } from './types';

// Register Cyrillic fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
});

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
};

function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' ₸';
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 9,
    padding: 30,
    color: '#1a2e1a',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#00afbe',
    paddingBottom: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00afbe',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#4a6b4a',
    marginTop: 2,
  },
  headerMeta: {
    textAlign: 'right',
    fontSize: 8,
    color: '#7a9a7a',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00afbe',
    marginTop: 14,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#c8ddc8',
    paddingBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  card: {
    width: '23%',
    backgroundColor: '#f4f8f4',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#c8ddc8',
  },
  cardValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#00afbe',
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 7.5,
    color: '#7a9a7a',
  },
  table: {
    width: '100%',
    marginVertical: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e8f0e8',
    minHeight: 18,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#e8f0e8',
    borderBottomWidth: 1.5,
    borderBottomColor: '#c8ddc8',
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#4a6b4a',
    padding: 4,
  },
  tableCell: {
    fontSize: 8,
    padding: 4,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  textRight: { textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justify: 'space-between',
    fontSize: 8,
    color: '#7a9a7a',
    borderTopWidth: 1,
    borderTopColor: '#e8f0e8',
    paddingTop: 6,
  },
});

export interface DirectorPDFReportProps {
  from: string;
  to: string;
  stats: {
    total: number;
    revenue: number;
    completed: number;
    avgRevenue: number;
  };
  byDoctor: Array<{
    name: string;
    records: number;
    revenue: number;
    specialization?: string | null;
  }>;
  byProcedure: Array<{ name: string; value: number }>;
  byStatus: Array<{ name: string; value: number; color?: string }>;
  appointments: Appointment[];
}

export function DirectorPDFDocument({
  from,
  to,
  stats,
  byDoctor,
  byProcedure,
  byStatus,
  appointments,
}: DirectorPDFReportProps) {
  const generatedAt = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Document title={`Отчет_клиники_${from}_${to}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Клиника Алихан</Text>
            <Text style={styles.headerSubtitle}>Финансово-аналитический отчет руководителя</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text>Период: {from} — {to}</Text>
            <Text>Сформировано: {generatedAt}</Text>
          </View>
        </View>

        {/* Summary Stat Cards */}
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{stats.total}</Text>
            <Text style={styles.cardLabel}>Всего записей</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{fmt(stats.revenue)}</Text>
            <Text style={styles.cardLabel}>Выручка за период</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{stats.completed}</Text>
            <Text style={styles.cardLabel}>Завершено приёмов</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{fmt(stats.avgRevenue)}</Text>
            <Text style={styles.cardLabel}>Средний чек</Text>
          </View>
        </View>

        {/* Doctor Performance */}
        <Text style={styles.sectionTitle}>Показатели врачей</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCellHeader, styles.flex2]}>Врач</Text>
            <Text style={[styles.tableCellHeader, styles.flex2]}>Специализация</Text>
            <Text style={[styles.tableCellHeader, styles.flex1, styles.textRight]}>Записей</Text>
            <Text style={[styles.tableCellHeader, styles.flex2, styles.textRight]}>Выручка</Text>
          </View>
          {byDoctor.map((doc, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.flex2, { fontWeight: 'bold' }]}>{doc.name}</Text>
              <Text style={[styles.tableCell, styles.flex2, { color: '#4a6b4a' }]}>{doc.specialization || '—'}</Text>
              <Text style={[styles.tableCell, styles.flex1, styles.textRight]}>{doc.records}</Text>
              <Text style={[styles.tableCell, styles.flex2, styles.textRight, { fontWeight: 'bold', color: '#00afbe' }]}>{fmt(doc.revenue)}</Text>
            </View>
          ))}
        </View>

        {/* Two-column layout for Procedures & Statuses */}
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
          {/* Procedures */}
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>По процедурам</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCellHeader, styles.flex3]}>Процедура</Text>
                <Text style={[styles.tableCellHeader, styles.flex1, styles.textRight]}>Записей</Text>
              </View>
              {byProcedure.slice(0, 10).map((p, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.flex3]}>{p.name}</Text>
                  <Text style={[styles.tableCell, styles.flex1, styles.textRight, { fontWeight: 'bold' }]}>{p.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Statuses */}
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>По статусам</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCellHeader, styles.flex3]}>Статус</Text>
                <Text style={[styles.tableCellHeader, styles.flex1, styles.textRight]}>Записей</Text>
              </View>
              {byStatus.map((s, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.flex3]}>{s.name}</Text>
                  <Text style={[styles.tableCell, styles.flex1, styles.textRight, { fontWeight: 'bold' }]}>{s.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Footer on page */}
        <View style={styles.footer} fixed>
          <Text>Клиника Алихан — Конфиденциально</Text>
          <Text render={({ pageNumber, totalPages }) => `Страница ${pageNumber} из ${totalPages}`} />
        </View>
      </Page>

      {/* Page 2+: Appointments Table */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Детализация записей</Text>
          <Text style={styles.headerMeta}>Всего записей в выгрузке: {appointments.length}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCellHeader, { width: '13%' }]}>Дата / Время</Text>
            <Text style={[styles.tableCellHeader, { width: '22%' }]}>Пациент</Text>
            <Text style={[styles.tableCellHeader, { width: '22%' }]}>Врач</Text>
            <Text style={[styles.tableCellHeader, { width: '23%' }]}>Процедура</Text>
            <Text style={[styles.tableCellHeader, { width: '10%', textAlign: 'right' }]}>Цена</Text>
            <Text style={[styles.tableCellHeader, { width: '10%', textAlign: 'right' }]}>Статус</Text>
          </View>
          {appointments.slice(0, 200).map((a, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={[styles.tableCell, { width: '13%' }]}>{a.date.slice(5)} {a.time}</Text>
              <Text style={[styles.tableCell, { width: '22%', fontWeight: 'bold' }]}>{a.patientName}</Text>
              <Text style={[styles.tableCell, { width: '22%' }]}>{a.doctor.name.split(' ').slice(0, 2).join(' ')}</Text>
              <Text style={[styles.tableCell, { width: '23%' }]}>{a.procedure?.name || '—'}</Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'right', fontWeight: 'bold' }]}>{a.price ? `${a.price} ₸` : '—'}</Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'right', fontSize: 7 }]}>{STATUS_LABELS[a.status] || a.status}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text>Клиника Алихан — Реестр записей</Text>
          <Text render={({ pageNumber, totalPages }) => `Страница ${pageNumber} из ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
