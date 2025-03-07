import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Header } from "@/components/Header";

export default function AdminUsersPage() {
  const { theme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    content: {
      flex: 1,
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: currentTheme.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Usuários" />
      <View style={styles.content}>
        <Text style={styles.title}>Gerenciamento de Usuários</Text>
        <Text style={styles.subtitle}>
          Esta página permitirá gerenciar todos os usuários do sistema.
        </Text>
      </View>
    </SafeAreaView>
  );
} 