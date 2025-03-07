import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Header } from "@/components/Header";
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Building2, 
  DollarSign,
  Filter
} from "lucide-react-native";

export default function AdminReportsPage() {
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
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    filterText: {
      color: currentTheme.text,
      marginLeft: 8,
    },
    card: {
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    reportItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.surfaceLight,
    },
    reportInfo: {
      flex: 1,
      marginLeft: 12,
    },
    reportTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: currentTheme.text,
      marginBottom: 4,
    },
    reportDate: {
      fontSize: 14,
      color: currentTheme.textSecondary,
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    downloadText: {
      color: '#fff',
      marginLeft: 4,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.text,
      marginBottom: 16,
      marginTop: 8,
    },
  });

  const reports = [
    {
      id: '1',
      title: 'Relatório de Eventos Mensais',
      date: '01/03/2023',
      icon: Calendar,
    },
    {
      id: '2',
      title: 'Relatório de Usuários Ativos',
      date: '15/03/2023',
      icon: Users,
    },
    {
      id: '3',
      title: 'Relatório de Estabelecimentos',
      date: '22/03/2023',
      icon: Building2,
    },
    {
      id: '4',
      title: 'Relatório Financeiro',
      date: '28/03/2023',
      icon: DollarSign,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Relatórios" />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatórios</Text>
          <Text style={styles.subtitle}>Acesse e baixe relatórios do sistema</Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={16} color={currentTheme.textSecondary} />
            <Text style={styles.filterText}>Filtrar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.filterButton}>
            <Calendar size={16} color={currentTheme.textSecondary} />
            <Text style={styles.filterText}>Março 2023</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Relatórios Recentes</Text>
          
          {reports.map(report => {
            const ReportIcon = report.icon;
            
            return (
              <View key={report.id} style={styles.reportItem}>
                <ReportIcon size={24} color={currentTheme.primary} />
                
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportDate}>Gerado em {report.date}</Text>
                </View>
                
                <TouchableOpacity style={styles.downloadButton}>
                  <Download size={16} color="#fff" />
                  <Text style={styles.downloadText}>PDF</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Gerar Novo Relatório</Text>
          
          <TouchableOpacity 
            style={[styles.reportItem, { borderBottomWidth: 0 }]}
          >
            <FileText size={24} color={currentTheme.primary} />
            
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>Relatório Personalizado</Text>
              <Text style={styles.reportDate}>Selecione parâmetros e gere um relatório</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.downloadButton, { backgroundColor: currentTheme.success }]}
            >
              <Text style={styles.downloadText}>Criar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Adicionar padding no final para não ficar colado com a borda inferior */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
} 