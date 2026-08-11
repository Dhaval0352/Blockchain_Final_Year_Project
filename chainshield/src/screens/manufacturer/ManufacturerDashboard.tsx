import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SealBadge } from '../../components/SealBadge';
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
            <View style={[styles.iconChip, { backgroundColor: colors.secondary }]}>
              <Factory size={20} color="#0F1A17" />
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
          <View style={[styles.warningBox, { backgroundColor: colors.warning + '26', borderColor: colors.warning + '55' }]}>
            <AlertCircle size={18} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.warning }]}>
              Your account is pending admin approval. You can draft products, but they will not be registered on the blockchain yet.
            </Text>
          </View>
        )}

        <Card style={styles.actionCard}>
          <SealBadge size={72}>
            <PackagePlus size={30} color="#1A1300" />
          </SealBadge>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Register Product</Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
            Submit a new cosmetic product for blockchain registry.
          </Text>
          <Button
            title="Request Registration"
            onPress={() => navigation.navigate('RegisterProduct')}
            style={{ marginTop: 18, width: '100%' }}
          />
        </Card>

        <Card
          style={styles.listCard}
          variant="outlined"
          onPress={() => navigation.navigate('Products')}
        >
          <View style={styles.row}>
            <View style={[styles.iconChip, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary }]}>
              <Box size={20} color={colors.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={[styles.listTitle, { color: colors.text }]}>My Products</Text>
              <Text style={[styles.listSub, { color: colors.textSecondary }]}>
                {myProducts.length} item{myProducts.length === 1 ? '' : 's'} listed
              </Text>
            </View>
          </View>
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
  iconChip: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  infoText: { flex: 1 },
  companyName: { fontSize: 17, fontWeight: 'bold' },
  statusText: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  warningBox: { flexDirection: 'row', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  warningText: { flex: 1, marginLeft: 8, fontSize: 12, lineHeight: 17 },
  actionCard: { alignItems: 'center', padding: 24, marginBottom: 16 },
  cardTitle: { fontSize: 19, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  cardSub: { fontSize: 14, textAlign: 'center' },
  listCard: { padding: 16, marginBottom: 16 },
  listTitle: { fontSize: 15, fontWeight: '700' },
  listSub: { fontSize: 12, marginTop: 3 },
});
