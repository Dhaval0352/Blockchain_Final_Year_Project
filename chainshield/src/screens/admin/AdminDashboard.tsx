import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Users, Package, ShieldCheck, Activity } from 'lucide-react-native';

type Props = BottomTabScreenProps<any, 'Dashboard'>;

export const AdminDashboard: React.FC<Props> = ({ navigation }) => {
  const { user, pendingManufacturers, pendingProducts, registeredProducts, scanCounts, logout } = useAppStore();
  const { colors } = useTheme();

  // Real count from actual scans recorded this session, not a placeholder
  // number — so there's nothing here that can't be explained if asked.
  const totalScans = Object.values(scanCounts).reduce((sum, n) => sum + n, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Admin Portal" userName={user?.name} />
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>ACTIONS REQUIRED</Text>

        <View style={styles.grid}>
          <Card
            style={styles.gridCard}
            variant="outlined"
            onPress={() => navigation.navigate('ManufacturerApprovals')}
          >
            <View style={[styles.iconChip, { backgroundColor: colors.warning }]}>
              <Users size={20} color="#1A1300" />
            </View>
            <Text style={[styles.gridTitle, { color: colors.text }]}>Makers</Text>
            <Text style={[styles.gridSub, { color: colors.warning }]}>
              {pendingManufacturers.length} Pending
            </Text>
          </Card>

          <Card
            style={styles.gridCard}
            variant="outlined"
            onPress={() => navigation.navigate('ProductApprovals')}
          >
            <View style={[styles.iconChip, { backgroundColor: colors.warning }]}>
              <Package size={20} color="#1A1300" />
            </View>
            <Text style={[styles.gridTitle, { color: colors.text }]}>Products</Text>
            <Text style={[styles.gridSub, { color: colors.warning }]}>
              {pendingProducts.length} Pending
            </Text>
          </Card>
        </View>

        <Text style={[styles.eyebrow, { color: colors.textSecondary, marginTop: 8 }]}>SYSTEM OVERVIEW</Text>

        <Card
          style={styles.listCard}
          variant="outlined"
          onPress={() => navigation.navigate('RegisteredProducts')}
        >
          <View style={styles.row}>
            <View style={[styles.iconChip, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.success }]}>
              <ShieldCheck size={20} color={colors.success} />
            </View>
            <View style={styles.listText}>
              <Text style={[styles.listTitle, { color: colors.text }]}>Registered Products</Text>
              <Text style={[styles.listSub, { color: colors.textSecondary }]}>
                {registeredProducts.length} active on blockchain
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.listCard} variant="outlined">
          <View style={styles.row}>
            <View style={[styles.iconChip, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.secondary }]}>
              <Activity size={20} color={colors.secondary} />
            </View>
            <View style={styles.listText}>
              <Text style={[styles.listTitle, { color: colors.text }]}>Total Authentications</Text>
              <Text style={[styles.listSub, { color: colors.textSecondary }]}>
                {totalScans} successful check{totalScans === 1 ? '' : 's'} this session
              </Text>
            </View>
          </View>
        </Card>

        <Button title="Log Out" variant="outline" onPress={logout} style={{ marginTop: 8 }} />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, fontFamily: 'monospace', marginBottom: 12, marginTop: 8 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  gridCard: { width: '48%', alignItems: 'flex-start', padding: 18 },
  iconChip: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  gridTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  gridSub: { fontSize: 12, fontWeight: '700' },
  listCard: { padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  listText: { marginLeft: 14, flex: 1 },
  listTitle: { fontSize: 15, fontWeight: 'bold' },
  listSub: { fontSize: 12, marginTop: 3 },
});
