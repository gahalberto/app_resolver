import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Header } from "@/components/Header";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react-native";

export default function AdminAnalyticsPage() {
  const { theme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    content: {
      padding: 16,
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
    card: {
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.text,
      marginBottom: 16,
    },
    chartPlaceholder: {
      height: 200,
      backgroundColor: currentTheme.surfaceLight,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statCard: {
      width: '48%',
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.text,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 14,
      color: currentTheme.textSecondary,
      marginTop: 4,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(186, 154, 95, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Análises" />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Análises</Text>
          <Text style={styles.subtitle}>Visualize métricas e tendências</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <TrendingUp size={20} color={currentTheme.primary} />
            </View>
            <Text style={styles.statValue}>+12%</Text>
            <Text style={styles.statLabel}>Crescimento Mensal</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <Users size={20} color={currentTheme.primary} />
            </View>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Novos Usuários</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <Calendar size={20} color={currentTheme.primary} />
            </View>
            <Text style={styles.statValue}>18</Text>
            <Text style={styles.statLabel}>Eventos Realizados</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <BarChart3 size={20} color={currentTheme.primary} />
            </View>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Taxa de Aprovação</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Eventos por Mês</Text>
          <View style={styles.chartPlaceholder}>
            <BarChart3 size={48} color={currentTheme.textSecondary} />
            <Text style={{ color: currentTheme.textSecondary, marginTop: 8 }}>
              Gráfico de Eventos
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Usuários Ativos</Text>
          <View style={styles.chartPlaceholder}>
            <TrendingUp size={48} color={currentTheme.textSecondary} />
            <Text style={{ color: currentTheme.textSecondary, marginTop: 8 }}>
              Gráfico de Usuários
            </Text>
          </View>
        </View>

        {/* Adicionar padding no final para não ficar colado com a borda inferior */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
} 