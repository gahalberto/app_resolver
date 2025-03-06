import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { themes } from '@/styles/themes';
import { Menu, Sun, Moon } from 'lucide-react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const navigation = useNavigation();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: currentTheme.background,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.surface,
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuButton: {
      marginRight: 16,
    },
    title: {
      color: currentTheme.text,
      fontSize: 20,
      fontWeight: '600',
    },
    themeButton: {
      padding: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <Menu size={24} color={currentTheme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>

      <TouchableOpacity
        style={styles.themeButton}
        onPress={toggleTheme}
      >
        {isDarkMode ? (
          <Sun size={24} color={currentTheme.primary} />
        ) : (
          <Moon size={24} color={currentTheme.primary} />
        )}
      </TouchableOpacity>
    </View>
  );
} 