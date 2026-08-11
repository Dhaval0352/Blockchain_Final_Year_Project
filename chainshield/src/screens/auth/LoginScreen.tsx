import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppStore, UserRole } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ThemeToggle } from '../../components/ThemeToggle';
import { SealBadge } from '../../components/SealBadge';
import { ShieldCheck, User, Factory, ShieldAlert, Eye, EyeOff } from 'lucide-react-native';
import { loginUser, registerUser } from '../../services/authApi';

export const LoginScreen = () => {
  const { colors } = useTheme();
  const { setAuth } = useAppStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('USER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleOptions: { key: UserRole; label: string; Icon: typeof User }[] = [
    { key: 'USER', label: 'Consumer', Icon: User },
    { key: 'MANUFACTURER', label: 'Maker', Icon: Factory },
    { key: 'ADMIN', label: 'Admin', Icon: ShieldAlert },
  ];

  const handleSubmit = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    const result =
      mode === 'signin'
        ? await loginUser(email.trim(), password)
        : await registerUser({ name: name.trim(), email: email.trim(), password, role, companyName: companyName.trim() });
    setLoading(false);

    if (!result.ok || !result.user || !result.token) {
      setError(result.error || 'Something went wrong. Please try again.');
      return;
    }

    setAuth(
      {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        mobile: result.user.mobile || '',
        role: result.user.role,
        companyName: result.user.companyName,
        isApproved: result.user.isApproved,
      },
      result.token
    );
  };

  const renderRoleSelector = () => (
    <View style={styles.roleContainer}>
      <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>
        {mode === 'signin' ? 'SIGNING IN AS' : 'CREATING ACCOUNT AS'}
      </Text>
      <View style={styles.roleTabs}>
        {roleOptions.map(({ key, label, Icon }) => {
          const active = role === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.roleTab,
                { borderColor: colors.border },
                active && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setRole(key)}
            >
              <Icon size={16} color={active ? '#1A1300' : colors.textSecondary} />
              <Text style={[styles.roleTabText, { color: active ? '#1A1300' : colors.textSecondary }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemeToggle />
        </View>

        <View style={styles.logoContainer}>
          <SealBadge size={92}>
            <ShieldCheck size={34} color="#1A1300" strokeWidth={2.5} />
          </SealBadge>
          <Text style={[styles.eyebrow, { color: colors.secondary }]}>VERIFIED · IMMUTABLE · ON-CHAIN</Text>
          <Text style={[styles.title, { color: colors.text }]}>ChainShield</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Blockchain-based authenticity for cosmetics
          </Text>
        </View>

        <View style={[styles.formContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.methodTabs, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => { setMode('signin'); setError(''); }} style={styles.methodTab}>
              <Text style={[
                styles.methodText,
                { color: mode === 'signin' ? colors.primary : colors.textSecondary },
                mode === 'signin' && styles.methodTextActive,
              ]}>
                Sign In
              </Text>
              {mode === 'signin' && <View style={[styles.methodUnderline, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMode('signup'); setError(''); }} style={styles.methodTab}>
              <Text style={[
                styles.methodText,
                { color: mode === 'signup' ? colors.primary : colors.textSecondary },
                mode === 'signup' && styles.methodTextActive,
              ]}>
                Create Account
              </Text>
              {mode === 'signup' && <View style={[styles.methodUnderline, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          </View>

          {mode === 'signup' && renderRoleSelector()}

          {mode === 'signup' && (
            <Input label="Name" placeholder="Your name" value={name} onChangeText={setName} />
          )}

          {mode === 'signup' && role === 'MANUFACTURER' && (
            <Input
              label="Company Name"
              placeholder="e.g. My Beauty Co."
              value={companyName}
              onChangeText={setCompanyName}
            />
          )}

          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <View>
            <Input
              label="Password"
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {showPassword ? (
                <EyeOff size={18} color={colors.textSecondary} />
              ) : (
                <Eye size={18} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {!!error && (
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          )}

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
          ) : (
            <Button
              title={mode === 'signin' ? 'Sign In' : 'Create Account'}
              onPress={handleSubmit}
              style={{ marginTop: 24 }}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 80, justifyContent: 'flex-start' },
  header: { alignItems: 'flex-end', marginTop: Platform.OS === 'android' ? 24 : 40 },
  logoContainer: { alignItems: 'center', marginBottom: 36, marginTop: 12 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 2, fontFamily: 'monospace', marginTop: 18, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 15, textAlign: 'center', paddingHorizontal: 20 },
  formContainer: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  roleContainer: { marginBottom: 20 },
  roleLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  roleTabs: { flexDirection: 'row', justifyContent: 'space-between' },
  roleTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderWidth: 1, borderRadius: 12, marginHorizontal: 4,
  },
  roleTabText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  methodTabs: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1 },
  methodTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  methodText: { fontSize: 15 },
  methodTextActive: { fontWeight: '700' },
  methodUnderline: { height: 2, width: '60%', borderRadius: 1, marginTop: 8 },
  eyeButton: { position: 'absolute', right: 14, top: 38 },
  errorText: { fontSize: 13, marginTop: 12, textAlign: 'center' },
});
