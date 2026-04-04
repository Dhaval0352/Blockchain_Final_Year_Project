import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Clock, CheckCircle, XCircle } from 'lucide-react-native';

type Props = NativeStackScreenProps<any, 'Products'>;

export const MyProductsScreen: React.FC<Props> = ({ navigation }) => {
  const { myProducts } = useAppStore();
  const { colors } = useTheme();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock size={20} color={colors.warning} />;
      case 'APPROVED': return <CheckCircle size={20} color={colors.success} />;
      case 'REJECTED': return <XCircle size={20} color={colors.error} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return colors.warning;
      case 'APPROVED': return colors.success;
      case 'REJECTED': return colors.error;
      default: return colors.text;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="My Products" showProfile={false} />
      <FlatList
        data={myProducts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card} variant="elevated">
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>{item.productName}</Text>
              <View style={styles.statusBadge}>
                {getStatusIcon(item.status)}
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={[styles.batch, { color: colors.textSecondary }]}>Batch: {item.batchNumber}</Text>
            
            {item.status === 'APPROVED' && (
              <Button 
                title="View QR Code" 
                variant="outline" 
                style={styles.qrBtn} 
                onPress={() => navigation.navigate('QRView', { product: item })}
              />
            )}
            {item.status === 'REJECTED' && (
              <Text style={[styles.reason, { color: colors.error }]}>Reason: Information incomplete.</Text>
            )}
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: { padding: 16, marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  batch: { fontSize: 12, marginTop: 4 },
  qrBtn: { height: 40, marginTop: 12 },
  reason: { fontSize: 12, marginTop: 8 },
});
