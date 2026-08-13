import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { ShieldCheck, Hash } from 'lucide-react-native';

export const RegisteredProductsScreen = () => {
  const { registeredProducts, fetchApprovedProducts } = useAppStore();
  const { colors } = useTheme();

  // Refresh from the shared backend every time this screen is focused,
  // so it reflects approvals made from any device, not just this one.
  useFocusEffect(
    useCallback(() => {
      fetchApprovedProducts();
    }, [fetchApprovedProducts])
  );

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
          renderItem={({ item }) => {
            // Backward-compat: older/offline-fallback data may still have
            // a single txId instead of items[] — treat that as one unit.
            const units = item.items && item.items.length > 0
              ? item.items
              : [{ itemId: item.id, txHash: item.txId || '' }];
            const firstTx = units[0]?.txHash || '';

            return (
              <Card style={styles.card} variant="elevated">
                <View style={styles.row}>
                   <ShieldCheck size={28} color={colors.success} />
                   <View style={styles.details}>
                      <Text style={[styles.title, { color: colors.text }]}>{item.productName}</Text>
                      <Text style={[styles.sub, { color: colors.textSecondary }]}>
                        {item.category} • Batch: {item.batchNumber} • {units.length} unit{units.length > 1 ? 's' : ''}
                      </Text>
                   </View>
                </View>
                <View style={styles.txBox}>
                   <Hash size={16} color={colors.textSecondary} />
                   <Text style={[styles.txid, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="middle">
                     {firstTx}{units.length > 1 ? `  (+${units.length - 1} more)` : ''}
                   </Text>
                   <View style={[styles.badge, { backgroundColor: item.onChain ? colors.success : colors.warning }]}>
                     <Text style={styles.badgeText}>{item.onChain ? 'On-chain' : 'Offline'}</Text>
                   </View>
                </View>
              </Card>
            );
          }}
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
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 8 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#2D3748' },
});