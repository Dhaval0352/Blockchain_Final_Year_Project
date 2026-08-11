import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SealBadge } from '../../components/SealBadge';
import { User } from 'lucide-react-native';

export const ProfileScreen = () => {
  const { user, logout } = useAppStore();
  const { colors } = useTheme();

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="My Profile" showProfile={false} />
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <SealBadge size={96}>
            <User size={40} color="#1A1300" />
          </SealBadge>
          <View style={[styles.rolePill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.rolePillText, { color: colors.textSecondary }]}>{user.role}</Text>
          </View>
        </View>

        <Card variant="outlined" style={[styles.card, { borderColor: colors.border }]}>
          <Detail label="Name" value={user.name} colors={colors} />
          <Detail label="Email" value={user.email} colors={colors} />
          <Detail label="Mobile" value={user.mobile} colors={colors} />
          {user.companyName && (
            <Detail label="Company" value={user.companyName} colors={colors} last />
          )}
        </Card>

        <View style={styles.footer}>
          <Button title="Logout" variant="outline" onPress={logout} />
        </View>
      </View>
    </View>
  );
};

const Detail = ({ label, value, colors, last }: any) => (
  <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
    <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.value, { color: colors.text, fontFamily: 'monospace' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, flex: 1 },
  avatarContainer: { alignItems: 'center', marginVertical: 24 },
  rolePill: { marginTop: 14, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  rolePillText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  card: { padding: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12 },
  label: { fontSize: 13 },
  value: { fontSize: 13, fontWeight: '600' },
  footer: { marginTop: 'auto', paddingBottom: 24 },
});
