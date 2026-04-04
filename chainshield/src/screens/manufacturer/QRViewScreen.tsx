import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { QrCode, Share, Download } from 'lucide-react-native';

type Props = NativeStackScreenProps<any, 'QRView'>;

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
          {/* Real implementation would use react-native-qrcode-svg or similar */}
          <View style={[styles.qrMock, { borderColor: colors.primary }]}>
            <QrCode size={120} color={colors.text} />
            <Text style={[styles.qrMockText, { color: colors.textSecondary }]}>Mock QR Code</Text>
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
  qrMock: { width: 200, height: 200, borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  qrMockText: { marginTop: 16, fontSize: 12 },
  txid: { fontSize: 12, fontFamily: 'monospace' },
  actions: { marginTop: 24, flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 0.48, paddingHorizontal: 0 }, // flex overrides width, so this works better
});
