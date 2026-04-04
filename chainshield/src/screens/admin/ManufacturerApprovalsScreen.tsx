import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Users } from 'lucide-react-native';

export const ManufacturerApprovalsScreen = () => {
  const { pendingManufacturers, approveManufacturer, rejectManufacturer } = useAppStore();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Maker Approvals" showProfile={false} />
      {pendingManufacturers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No pending requests.</Text>
        </View>
      ) : (
        <FlatList
          data={pendingManufacturers}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card} variant="elevated">
              <View style={styles.row}>
                 <Users size={24} color={colors.textSecondary} />
                 <View style={styles.details}>
                    <Text style={[styles.company, { color: colors.text }]}>{item.companyName}</Text>
                    <Text style={[styles.rep, { color: colors.textSecondary }]}>{item.name} • {item.email}</Text>
                 </View>
              </View>
              <View style={styles.actions}>
                <Button 
                  title="Approve" 
                  onPress={() => approveManufacturer(item.id)} 
                  style={styles.actionBtn}
                />
                <Button 
                  title="Reject" 
                  variant="outline"
                  onPress={() => rejectManufacturer(item.id)} 
                  style={styles.actionBtn}
                />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16 },
  card: { padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  details: { marginLeft: 12, flex: 1 },
  company: { fontSize: 16, fontWeight: 'bold' },
  rep: { fontSize: 12, marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 0.48, height: 40 },
});
