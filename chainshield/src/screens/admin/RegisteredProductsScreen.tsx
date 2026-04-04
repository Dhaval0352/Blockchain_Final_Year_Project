import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { ShieldCheck, Hash } from 'lucide-react-native';

export const RegisteredProductsScreen = () => {
  const { registeredProducts } = useAppStore();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Registered Products" showProfile={false} />
      {registeredProducts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No products registered yet.</Text>
        </View>
      ) : (
        <FlatList
          data={registeredProducts}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card} variant="elevated">
              <View style={styles.row}>
                 <ShieldCheck size={28} color={colors.success} />
                 <View style={styles.details}>
                    <Text style={[styles.title, { color: colors.text }]}>{item.productName}</Text>
                    <Text style={[styles.sub, { color: colors.textSecondary }]}>{item.category} • Batch: {item.batchNumber}</Text>
                 </View>
              </View>
              <View style={styles.txBox}>
                 <Hash size={16} color={colors.textSecondary} />
                 <Text style={[styles.txid, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="middle">
                   {item.txId}
                 </Text>
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
  card: { padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  details: { marginLeft: 16, flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  sub: { fontSize: 12, marginTop: 4 },
  txBox: { flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 8 },
  txid: { fontSize: 12, marginLeft: 8, fontFamily: 'monospace', flex: 1 },
});
