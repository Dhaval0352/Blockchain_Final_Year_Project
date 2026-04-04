import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
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
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <User size={48} color="#000" />
          </View>
        </View>

        <Card variant="elevated" style={styles.card}>
          <Detail label="Name" value={user.name} colors={colors} />
          <Detail label="Email" value={user.email} colors={colors} />
          <Detail label="Mobile" value={user.mobile} colors={colors} />
          <Detail label="Role" value={user.role || ''} colors={colors} />
          {user.companyName && (
             <Detail label="Company" value={user.companyName} colors={colors} />
          )}
        </Card>

        <View style={styles.footer}>
          <Button title="Logout" variant="outline" onPress={logout} />
        </View>
      </View>
    </View>
  );
};

const Detail = ({ label, value, colors }: any) => (
  <View style={styles.row}>
    <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, flex: 1 },
  avatarContainer: { alignItems: 'center', marginVertical: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc' },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600' },
  footer: { marginTop: 'auto', paddingBottom: 24 },
});
