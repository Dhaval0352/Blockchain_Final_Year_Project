import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useAppStore, UserRole } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ScanFace, User, Factory, ShieldAlert } from 'lucide-react-native';

export const LoginScreen = () => {
  const { colors } = useTheme();
  const { setUser } = useAppStore();

  const [method, setMethod] = useState<'phone' | 'email'>('email');
  const [role, setRole] = useState<UserRole>('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = () => {
    // Mock authentication
    setUser({
      id: Math.random().toString(),
      name: method === 'email' ? email.split('@')[0] : 'User',
      email: method === 'email' ? email : 'user@example.com',
      mobile: method === 'phone' ? phone : '1234567890',
      role,
      companyName: role === 'MANUFACTURER' ? 'My Beauty Co.' : undefined,
      isApproved: role === 'MANUFACTURER' ? false : undefined,
    });
  };

  const renderRoleSelector = () => (
    <View style={styles.roleContainer}>
      <Text style={[styles.roleLabel, { color: colors.text }]}>I am a:</Text>
      <View style={styles.roleTabs}>
        <TouchableOpacity
          style={[
            styles.roleTab,
            role === 'USER' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setRole('USER')}
        >
          <User size={16} color={role === 'USER' ? '#000' : colors.textSecondary} />
          <Text style={[styles.roleTabText, { color: role === 'USER' ? '#000' : colors.textSecondary }]}>Consumer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleTab,
            role === 'MANUFACTURER' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setRole('MANUFACTURER')}
        >
          <Factory size={16} color={role === 'MANUFACTURER' ? '#000' : colors.textSecondary} />
          <Text style={[styles.roleTabText, { color: role === 'MANUFACTURER' ? '#000' : colors.textSecondary }]}>Maker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleTab,
            role === 'ADMIN' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setRole('ADMIN')}
        >
          <ShieldAlert size={16} color={role === 'ADMIN' ? '#000' : colors.textSecondary} />
          <Text style={[styles.roleTabText, { color: role === 'ADMIN' ? '#000' : colors.textSecondary }]}>Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <ThemeToggle />
        </View>

        <View style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
             <ScanFace size={48} color="#000" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>BlockAuth Cosmetics</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Blockchain-Powered Fake Product Identification</Text>
        </View>

        <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
          {renderRoleSelector()}

          <View style={styles.methodTabs}>
            <TouchableOpacity onPress={() => setMethod('email')} style={styles.methodTab}>
              <Text style={[styles.methodText, { color: method === 'email' ? colors.primary : colors.textSecondary, fontWeight: method === 'email' ? 'bold' : 'normal' }]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMethod('phone')} style={styles.methodTab}>
              <Text style={[styles.methodText, { color: method === 'phone' ? colors.primary : colors.textSecondary, fontWeight: method === 'phone' ? 'bold' : 'normal' }]}>Phone</Text>
            </TouchableOpacity>
          </View>

          {method === 'email' ? (
            <>
              <Input
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </>
          ) : (
            <>
              <Input
                label="Mobile Number"
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              {phone.length > 5 && (
                <Input
                  label="OTP"
                  placeholder="Enter OTP (placeholder)"
                  keyboardType="number-pad"
                />
              )}
            </>
          )}

          <Button title="Sign In / Sign Up" onPress={handleLogin} style={{ marginTop: 24 }} />

          <View style={styles.divider}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={[styles.or, { color: colors.textSecondary }]}>OR</Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>

          <Button
            title="Sign in with Google"
            onPress={handleLogin}
            variant="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'flex-end',
    marginTop: Platform.OS === 'android' ? 24 : 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  methodTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  methodTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  methodText: {
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
  },
  or: {
    marginHorizontal: 16,
    fontWeight: '600',
  },
});
