import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Users, Package, ShieldCheck, Activity } from 'lucide-react-native';

type Props = BottomTabScreenProps<any, 'Dashboard'>;

export const AdminDashboard: React.FC<Props> = ({ navigation }) => {
  const { user, pendingManufacturers, pendingProducts, registeredProducts } = useAppStore();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Admin Portal" userName={user?.name} />
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions Required</Text>
        
        <View style={styles.grid}>
          <Card 
            style={styles.gridCard} 
            variant="elevated"
            onPress={() => navigation.navigate('ManufacturerApprovals')}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.warning }]}>
              <Users size={24} color="#000" />
            </View>
            <Text style={[styles.gridTitle, { color: colors.text }]}>Makers</Text>
            <Text style={[styles.gridSub, { color: colors.textSecondary }]}>
               {pendingManufacturers.length} Pending
            </Text>
          </Card>

          <Card 
            style={styles.gridCard} 
            variant="elevated"
            onPress={() => navigation.navigate('ProductApprovals')}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.warning }]}>
              <Package size={24} color="#000" />
            </View>
            <Text style={[styles.gridTitle, { color: colors.text }]}>Products</Text>
             <Text style={[styles.gridSub, { color: colors.textSecondary }]}>
               {pendingProducts.length} Pending
            </Text>
          </Card>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>System Overview</Text>

        <Card 
          style={styles.listCard} 
          variant="outlined"
          onPress={() => navigation.navigate('RegisteredProducts')}
        >
          <View style={styles.row}>
            <ShieldCheck size={28} color={colors.success} />
            <View style={styles.listText}>
              <Text style={[styles.listTitle, { color: colors.text }]}>Registered Products</Text>
              <Text style={[styles.listSub, { color: colors.textSecondary }]}>{registeredProducts.length} active on blockchain</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.listCard} variant="outlined">
          <View style={styles.row}>
            <Activity size={28} color={colors.primary} />
            <View style={styles.listText}>
              <Text style={[styles.listTitle, { color: colors.text }]}>Total Authentications</Text>
              <Text style={[styles.listSub, { color: colors.textSecondary }]}>1,432 successful checks</Text>
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  gridCard: { width: '48%', alignItems: 'center', padding: 20 },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  gridTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  gridSub: { fontSize: 12, fontWeight: 'bold' },
  listCard: { padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  listText: { marginLeft: 16 },
  listTitle: { fontSize: 16, fontWeight: 'bold' },
  listSub: { fontSize: 12, marginTop: 4 },
});
