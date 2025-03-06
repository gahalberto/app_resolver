import React from 'react';
import { View, Text, SafeAreaView, Platform, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { themes } from '@/styles/themes';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function PageLayout({ children, title }: PageLayoutProps) {
  const { theme } = useTheme();
  const currentTheme = themes[theme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
      paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.surface,
    },
    title: {
      color: currentTheme.text,
      fontSize: 24,
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
} 