import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PackagePlus, Factory, Box, AlertCircle } from 'lucide-react-native';

type Props = BottomTabScreenProps<any, 'Dashboard'>;

export const ManufacturerDashboard: React.FC<Props> = ({ navigation }) => {
  const { user, myProducts } = useAppStore();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Maker Portal" userName={user?.name} />
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <Card style={styles.infoCard} variant="outlined">
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
              <Factory size={24} color="#000" />
            </View>
            <View style={styles.infoText}>
              <Text style={[styles.companyName, { color: colors.text }]}>{user?.companyName}</Text>
              <Text style={[
                styles.statusText, 
                { color: user?.isApproved ? colors.success : colors.warning }
              ]}>
                {user?.isApproved ? 'Verified Manufacturer' : 'Pending Verification'}
              </Text>
            </View>
          </View>
        </Card>

        {!user?.isApproved && (
           <View style={styles.warningBox}>
             <AlertCircle size={20} color={colors.warning} />
             <Text style={[styles.warningText, { color: colors.warning }]}>
               Your account is pending admin approval. You can draft products, but they will not be registered on the blockchain yet.
             </Text>
           </View>
        )}

        <Card style={styles.actionCard}>
          <View style={[styles.largeIconBox, { backgroundColor: colors.primary }]}>
            <PackagePlus size={32} color="#000" />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Register Product</Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Submit a new cosmetic product for blockchain registry.</Text>
          <Button 
            title="Request Registration" 
            onPress={() => navigation.navigate('RegisterProduct')} 
            style={{ marginTop: 16, width: '100%' }}
          />
        </Card>

        <Card 
          style={styles.gridCard} 
          variant="outlined"
          onPress={() => navigation.navigate('Products')}
        >
          <Box size={28} color={colors.primary} />
          <Text style={[styles.gridTitle, { color: colors.text }]}>My Products</Text>
          <Text style={[styles.gridSub, { color: colors.textSecondary }]}>
            {myProducts.length} Items Listed
          </Text>
        </Card>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  infoCard: { padding: 16, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  infoText: { flex: 1 },
  companyName: { fontSize: 18, fontWeight: 'bold' },
  statusText: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  warningBox: { flexDirection: 'row', padding: 12, backgroundColor: 'rgba(251, 211, 141, 0.2)', borderRadius: 8, marginBottom: 16 },
  warningText: { flex: 1, marginLeft: 8, fontSize: 12 },
  actionCard: { alignItems: 'center', padding: 24, marginBottom: 16 },
  largeIconBox: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  cardSub: { fontSize: 14, textAlign: 'center' },
  gridCard: { alignItems: 'center', padding: 20, marginBottom: 16 },
  gridTitle: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  gridSub: { fontSize: 12 },
});
