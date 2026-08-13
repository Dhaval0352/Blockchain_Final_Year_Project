import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Box } from 'lucide-react-native';

export const ProductApprovalsScreen = () => {
  const { pendingProducts, approveProduct, rejectProduct, fetchPendingProducts } = useAppStore();
  const { colors } = useTheme();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pull the shared pending list from the backend every time this screen
  // is focused, so an admin sees submissions made from ANY device, not
  // just ones created on this phone.
  useFocusEffect(
    useCallback(() => {
      setRefreshing(true);
      fetchPendingProducts().finally(() => setRefreshing(false));
    }, [fetchPendingProducts])
  );

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    await approveProduct(id);
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    await rejectProduct(id);
    setLoadingId(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Product Approvals" showProfile={false} />
      {refreshing && pendingProducts.length === 0 ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : pendingProducts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No pending product registrations.</Text>
        </View>
      ) : (
        <FlatList
          data={pendingProducts}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card} variant="elevated">
              <View style={styles.row}>
                 <Box size={24} color={colors.primary} />
                 <View style={styles.details}>
                    <Text style={[styles.title, { color: colors.text }]}>{item.productName}</Text>
                    <Text style={[styles.sub, { color: colors.textSecondary }]}>{item.category} • Batch: {item.batchNumber}</Text>
                    <Text style={[styles.sub, { color: colors.textSecondary }]}>Quantity: {item.quantity} unit{item.quantity > 1 ? 's' : ''}</Text>
                 </View>
              </View>
              <View style={styles.descBox}>
                 <Text style={[styles.desc, { color: colors.textSecondary }]}>{item.description}</Text>
              </View>
              <View style={styles.actions}>
                <Button 
                  title="Mint & Register" 
                  onPress={() => handleApprove(item.id)} 
                  loading={loadingId === item.id}
                  disabled={loadingId !== null && loadingId !== item.id}
                  style={[styles.actionBtn, { flex: 0.6 }]}
                />
                <Button 
                  title="Reject" 
                  variant="outline"
                  onPress={() => handleReject(item.id)} 
                  disabled={loadingId !== null}
                  style={[styles.actionBtn, { flex: 0.35 }]}
                />
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
  details: { marginLeft: 12, flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  sub: { fontSize: 12, marginTop: 4 },
  descBox: { marginVertical: 12, padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 8 },
  desc: { fontSize: 12, fontStyle: 'italic' },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { height: 40 },
});