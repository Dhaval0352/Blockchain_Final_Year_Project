import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { User } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  userName?: string;
  showProfile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, userName, showProfile = true }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        {showProfile && (
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <User size={20} color="#000" />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {userName && (
             <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
               Hi, {userName}
             </Text>
          )}
        </View>
      </View>
      <ThemeToggle />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});
