import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { CheckCircle, XCircle } from 'lucide-react-native';

export const HistoryScreen = () => {
  const { scanHistory } = useAppStore();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Scan History" showProfile={false} />
      {scanHistory.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No scans yet.</Text>
        </View>
      ) : (
        <FlatList
          data={scanHistory}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card} variant="elevated">
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  {item.status === 'AUTHENTIC' ? (
                    <CheckCircle size={24} color={colors.success} />
                  ) : (
                    <XCircle size={24} color={colors.error} />
                  )}
                </View>
                <View style={styles.details}>
                  <Text style={[styles.title, { color: colors.text }]}>{item.productName}</Text>
                  <Text style={[styles.date, { color: colors.textSecondary }]}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.statusBox}>
                  <Text style={[
                      styles.statusText, 
                      { color: item.status === 'AUTHENTIC' ? colors.success : colors.error }
                    ]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16 },
  card: { padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { marginRight: 12 },
  details: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 12, marginTop: 4 },
  statusBox: { alignItems: 'flex-end', marginLeft: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
});
