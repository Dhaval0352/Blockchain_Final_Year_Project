import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Share, Download } from 'lucide-react-native';
import { ProductItem } from '../../store/appStore';

type Props = NativeStackScreenProps<any, 'QRView'>;

// Everything the scanner needs to look this ONE physical unit up and
// confirm the code hasn't been copied onto a different item: the unit's
// own unique id plus its own on-chain transaction hash. Keys stay
// {id, txId} — ScannerScreen.tsx already parses this exact shape, so
// nothing there needs to change even though these now come from
// product.items[i] (per-unit) instead of a single product-level id/txId.
export function buildQrPayload(item: { itemId: string; txHash?: string }): string {
  return JSON.stringify({ id: item.itemId, txId: item.txHash });
}

export const QRViewScreen: React.FC<Props> = ({ route }) => {
  const { colors } = useTheme();
  // Assume generic navigation passing params
  const { product } = route.params as any;

  // Backward-compat: older mock/offline data may still have a single
  // txId instead of items[] — treat that as one item so this screen
  // never crashes on legacy data.
  const items: ProductItem[] =
    product.items && product.items.length > 0
      ? product.items
      : [{ itemId: product.id, txHash: product.txId }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scroll}>
      <Text style={[styles.title, { color: colors.text }]}>{product.productName}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Batch: {product.batchNumber} · {items.length} unit{items.length > 1 ? 's' : ''}
      </Text>

      {items.map((item, index) => (
        <Card key={item.itemId} style={styles.card} variant="elevated">
          <Text style={[styles.unitLabel, { color: colors.textSecondary }]}>
            Unit {index + 1} of {items.length}
          </Text>

          <View style={styles.qrContainer}>
            <View style={[styles.qrBox, { borderColor: colors.primary }]}>
              <QRCode
                value={buildQrPayload(item)}
                size={160}
                color={colors.text}
                backgroundColor={colors.surface}
              />
            </View>
          </View>

          <Text style={[styles.itemId, { color: colors.textSecondary }]}>ID: {item.itemId}</Text>
          <Text style={[styles.txid, { color: colors.textSecondary }]}>Tx: {item.txHash}</Text>

          <View style={styles.actions}>
            <Button
              title="Save to Gallery"
              icon={<Download size={18} color="#000" style={{ marginRight: 8 }} />}
              onPress={() => alert('Saved')}
              style={styles.actionBtn}
            />
            <Button
              title="Share"
              variant="outline"
              icon={<Share size={18} color={colors.primary} style={{ marginRight: 8 }} />}
              onPress={() => alert('Shared')}
              style={styles.actionBtn}
            />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 24, textAlign: 'center' },
  card: { alignItems: 'center', padding: 24, marginBottom: 20 },
  unitLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  qrContainer: { marginVertical: 16, alignItems: 'center' },
  qrBox: { padding: 14, borderWidth: 2, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemId: { fontSize: 11, fontFamily: 'monospace', marginTop: 8 },
  txid: { fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
  actions: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  actionBtn: { flex: 0.48, paddingHorizontal: 0 },
});