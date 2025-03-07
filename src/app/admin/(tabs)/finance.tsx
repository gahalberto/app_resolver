import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Header } from "@/components/Header";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet,
  ArrowRight,
  Calendar,
  PieChart
} from "lucide-react-native";

export default function AdminFinancePage() {
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
    balanceCard: {
      backgroundColor: currentTheme.primary,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
    },
    balanceTitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 8,
    },
    balanceValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 16,
    },
    balanceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    balanceItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    balanceItemText: {
      color: '#FFFFFF',
      marginLeft: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statCard: {
      width: '48%',
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 16,
    },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    statTitle: {
      fontSize: 14,
      color: currentTheme.textSecondary,
      marginLeft: 8,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.text,
    },
    card: {
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.text,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewAllText: {
      fontSize: 14,
      color: currentTheme.primary,
      marginRight: 4,
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.surfaceLight,
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(186, 154, 95, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    transactionInfo: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: currentTheme.text,
    },
    transactionDate: {
      fontSize: 14,
      color: currentTheme.textSecondary,
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: '600',
    },
    incomeText: {
      color: '#22c55e',
    },
    expenseText: {
      color: '#ef4444',
    },
    chartPlaceholder: {
      height: 200,
      backgroundColor: currentTheme.surfaceLight,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
  });

  const transactions = [
    {
      id: '1',
      title: 'Pagamento de Evento',
      date: '28/03/2023',
      amount: 'R$ 1.250,00',
      type: 'income',
    },
    {
      id: '2',
      title: 'Pagamento de Mashguiach',
      date: '27/03/2023',
      amount: 'R$ 450,00',
      type: 'expense',
    },
    {
      id: '3',
      title: 'Pagamento de Evento',
      date: '25/03/2023',
      amount: 'R$ 980,00',
      type: 'income',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Finanças" />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Finanças</Text>
          <Text style={styles.subtitle}>Gerencie receitas e despesas</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Saldo Total</Text>
          <Text style={styles.balanceValue}>R$ 15.750,00</Text>
          
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <TrendingUp size={16} color="#FFFFFF" />
              <Text style={styles.balanceItemText}>Receitas: R$ 18.200,00</Text>
            </View>
            
            <View style={styles.balanceItem}>
              <TrendingDown size={16} color="#FFFFFF" />
              <Text style={styles.balanceItemText}>Despesas: R$ 2.450,00</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Calendar size={20} color={currentTheme.primary} />
              <Text style={styles.statTitle}>Este Mês</Text>
            </View>
            <Text style={styles.statValue}>R$ 5.280,00</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <TrendingUp size={20} color="#22c55e" />
              <Text style={styles.statTitle}>Crescimento</Text>
            </View>
            <Text style={styles.statValue}>+12%</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Transações Recentes</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Ver Todas</Text>
              <ArrowRight size={16} color={currentTheme.primary} />
            </TouchableOpacity>
          </View>
          
          {transactions.map(transaction => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                {transaction.type === 'income' ? (
                  <TrendingUp size={20} color={currentTheme.primary} />
                ) : (
                  <TrendingDown size={20} color={currentTheme.error} />
                )}
              </View>
              
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              
              <Text 
                style={[
                  styles.transactionAmount,
                  transaction.type === 'income' ? styles.incomeText : styles.expenseText
                ]}
              >
                {transaction.type === 'income' ? '+' : '-'} {transaction.amount}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Distribuição de Receitas</Text>
          <View style={styles.chartPlaceholder}>
            <PieChart size={48} color={currentTheme.textSecondary} />
            <Text style={{ color: currentTheme.textSecondary, marginTop: 8 }}>
              Gráfico de Distribuição
            </Text>
          </View>
        </View>

        {/* Adicionar padding no final para não ficar colado com a borda inferior */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
} 