import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { QrCode, ClipboardList, User } from 'lucide-react-native';

type Props = BottomTabScreenProps<any, 'Dashboard'>;

export const UserDashboard: React.FC<Props> = ({ navigation }) => {
  const { user, scanHistory } = useAppStore();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Dashboard" userName={user?.name} />
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <Card style={styles.actionCard}>
          <View style={[styles.iconBox, { backgroundColor: colors.primary }]}>
            <QrCode size={32} color="#000" />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Scan Product</Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Verify cosmetics authenticity instantly.</Text>
          <Button 
            title="Scan QR Code" 
            onPress={() => navigation.navigate('Scanner')} 
            style={{ marginTop: 16, width: '100%' }}
          />
        </Card>

        <View style={styles.grid}>
          <Card 
            style={styles.gridCard} 
            variant="outlined"
            onPress={() => navigation.navigate('History')}
          >
            <ClipboardList size={28} color={colors.primary} />
            <Text style={[styles.gridTitle, { color: colors.text }]}>History</Text>
            <Text style={[styles.gridSub, { color: colors.textSecondary }]}>
              {scanHistory.length} Scans
            </Text>
          </Card>

          <Card 
            style={styles.gridCard} 
            variant="outlined"
            onPress={() => navigation.navigate('Profile')}
          >
            <User size={28} color={colors.secondary} />
            <Text style={[styles.gridTitle, { color: colors.text }]}>Profile</Text>
            <Text style={[styles.gridSub, { color: colors.textSecondary }]}>
              Account Details
            </Text>
          </Card>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  actionCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  iconBox: {
    width: 64, height: 64,
    borderRadius: 32,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  cardSub: { fontSize: 14, textAlign: 'center' },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  gridCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
  },
  gridTitle: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  gridSub: { fontSize: 12 },
});
