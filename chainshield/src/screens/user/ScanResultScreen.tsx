import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { ScanResult } from '../../store/appStore';

type Props = NativeStackScreenProps<any, 'ScanResult'>;

export const ScanResultScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  // Assume generic navigation passing params
  const { result } = route.params as { result: ScanResult };

  const isAuthentic = result.status === 'AUTHENTIC';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scroll}>
      <Card style={[styles.resultCard, { backgroundColor: isAuthentic ? colors.success : colors.error }]}>
        {isAuthentic ? (
          <CheckCircle size={64} color="#000" />
        ) : (
          <XCircle size={64} color="#000" />
        )}
        <Text style={styles.resultTitle}>
          {isAuthentic ? 'Authentic Product' : 'Fake / Unregistered'}
        </Text>
        <Text style={styles.resultSub}>
          {isAuthentic 
            ? 'This product is verified on the blockchain.' 
            : 'Warning: This product could not be verified.'}
        </Text>
      </Card>

      {isAuthentic && result.suspicious && (
        <View style={styles.warningBox}>
          <AlertTriangle size={20} color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.warning }]}>
            {result.suspicionMessage}
          </Text>
        </View>
      )}
      
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Details</Text>
      <Card variant="outlined">
        <DetailRow label="Product Name" value={result.productName} colors={colors} />
        {isAuthentic && (
          <>
            <DetailRow label="Batch Number" value={result.batchNumber || ''} colors={colors} />
            <DetailRow label="Manufacturer" value={result.manufacturerName || ''} colors={colors} />
            <DetailRow label="Mfg Date" value={result.mfgDate || ''} colors={colors} />
            <DetailRow label="Exp Date" value={result.expDate || ''} colors={colors} />
          </>
        )}
      </Card>

      {isAuthentic && (
        <Card variant="elevated" style={styles.blockchainCard}>
          <ShieldCheck size={24} color={colors.primary} />
          <View style={styles.blockchainText}>
             <Text style={[styles.bcTitle, { color: colors.text }]}>Blockchain Verified</Text>
             <Text style={[styles.bcHash, { color: colors.textSecondary }]}>Tx: {result.txId}</Text>
          </View>
        </Card>
      )}

      <View style={styles.actions}>
        <Button 
          title="Scan Another" 
          onPress={() => navigation.goBack()} 
          style={{ flex: 1, marginRight: 8 }}
        />
        {!isAuthentic && (
          <Button 
            title="Report Setup" 
            variant="outline"
            onPress={() => alert('Reported')} 
            style={{ flex: 1, marginLeft: 8 }}
          />
        )}
      </View>
    </ScrollView>
  );
};

const DetailRow = ({ label, value, colors }: { label: string, value: string, colors: any }) => (
  <View style={styles.row}>
    <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  resultCard: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 16,
    borderWidth: 0,
  },
  resultTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 16, color: '#000' },
  resultSub: { fontSize: 14, color: '#000', marginTop: 8, textAlign: 'center' },
  warningBox: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: 'rgba(251, 211, 141, 0.2)', // light warning
    borderRadius: 8, marginBottom: 16
  },
  warningText: { marginLeft: 8, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc' },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '500' },
  blockchainCard: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  blockchainText: { marginLeft: 12 },
  bcTitle: { fontWeight: '600' },
  bcHash: { fontSize: 12, fontFamily: 'monospace', marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: 24, marginBottom: 32 }
});
