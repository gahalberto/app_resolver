import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Header } from "@/components/Header";

export default function AdminHourBankPage() {
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
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: currentTheme.textSecondary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Banco de Horas" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Banco de Horas</Text>
          <Text style={styles.subtitle}>
            Esta página permitirá gerenciar o banco de horas dos mashguichim.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}