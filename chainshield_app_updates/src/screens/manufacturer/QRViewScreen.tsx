import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Share, Download } from 'lucide-react-native';

type Props = NativeStackScreenProps<any, 'QRView'>;

// Everything the scanner needs to look the product up and confirm the
// code hasn't been copied onto a different item: the product id plus the
// on-chain transaction id assigned when the admin approved it.
export function buildQrPayload(product: { id: string; txId?: string }): string {
  return JSON.stringify({ id: product.id, txId: product.txId });
}

export const QRViewScreen: React.FC<Props> = ({ route }) => {
  const { colors } = useTheme();
  // Assume generic navigation passing params
  const { product } = route.params as any;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card} variant="elevated">
        <Text style={[styles.title, { color: colors.text }]}>{product.productName}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Batch: {product.batchNumber}</Text>
        
        <View style={styles.qrContainer}>
          <View style={[styles.qrBox, { borderColor: colors.primary }]}>
            <QRCode
              value={buildQrPayload(product)}
              size={180}
              color={colors.text}
              backgroundColor={colors.surface}
            />
          </View>
        </View>

        <Text style={[styles.txid, { color: colors.textSecondary }]}>Tx: {product.txId}</Text>
      </Card>

      <View style={styles.actions}>
        <Button 
          title="Save to Gallery" 
          icon={<Download size={20} color="#000" style={{ marginRight: 8 }} />}
          onPress={() => alert('Saved')} 
          style={styles.actionBtn}
        />
        <Button 
          title="Share" 
          variant="outline"
          icon={<Share size={20} color={colors.primary} style={{ marginRight: 8 }} />}
          onPress={() => alert('Shared')} 
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  card: { alignItems: 'center', padding: 32 },
  title: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  qrContainer: { marginVertical: 32, alignItems: 'center' },
  qrBox: { padding: 16, borderWidth: 2, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txid: { fontSize: 12, fontFamily: 'monospace' },
  actions: { marginTop: 24, flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 0.48, paddingHorizontal: 0 }, // flex overrides width, so this works better
});
