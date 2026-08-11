import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SealBadge } from '../../components/SealBadge';
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
          <SealBadge size={76}>
            <QrCode size={32} color="#1A1300" />
          </SealBadge>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Scan Product</Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
            Verify cosmetics authenticity instantly.
          </Text>
          <Button
            title="Scan QR Code"
            onPress={() => navigation.navigate('Scanner')}
            style={{ marginTop: 18, width: '100%' }}
          />
        </Card>

        <View style={styles.grid}>
          <Card
            style={styles.gridCard}
            variant="outlined"
            onPress={() => navigation.navigate('History')}
          >
            <View style={[styles.iconChip, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary }]}>
              <ClipboardList size={20} color={colors.primary} />
            </View>
            <Text style={[styles.gridTitle, { color: colors.text }]}>History</Text>
            <Text style={[styles.gridSub, { color: colors.textSecondary }]}>
              {scanHistory.length} Scan{scanHistory.length === 1 ? '' : 's'}
            </Text>
          </Card>

          <Card
            style={styles.gridCard}
            variant="outlined"
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[styles.iconChip, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.secondary }]}>
              <User size={20} color={colors.secondary} />
            </View>
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
  cardTitle: { fontSize: 19, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  cardSub: { fontSize: 14, textAlign: 'center' },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  gridCard: {
    width: '48%',
    alignItems: 'flex-start',
    padding: 18,
  },
  iconChip: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  gridTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  gridSub: { fontSize: 12 },
});
