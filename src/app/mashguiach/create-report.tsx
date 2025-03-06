import React, { useState } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Share
} from "react-native";
import { Header } from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { useUser } from "@/contexts/UserContext";
import { api } from "@/server/api";
import { format, addMonths, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Download,
  Share2,
  CheckCircle
} from "lucide-react-native";
import { router } from "expo-router";

export default function CreateReportPage() {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [dateSelectionMode, setDateSelectionMode] = useState<'start' | 'end'>('start');
  
  const handlePreviousMonth = () => {
    if (dateSelectionMode === 'start') {
      setStartDate(prevDate => subMonths(prevDate, 1));
    } else {
      setEndDate(prevDate => subMonths(prevDate, 1));
    }
  };
  
  const handleNextMonth = () => {
    if (dateSelectionMode === 'start') {
      setStartDate(prevDate => addMonths(prevDate, 1));
    } else {
      setEndDate(prevDate => addMonths(prevDate, 1));
    }
  };
  
  const toggleDateSelectionMode = () => {
    setDateSelectionMode(prev => prev === 'start' ? 'end' : 'start');
  };
  
  const generateReport = async () => {
    if (!reportTitle.trim()) {
      Alert.alert('Erro', 'Por favor, informe um título para o relatório');
      return;
    }
    
    try {
      setLoading(true);
      
      // Formatar datas para o formato esperado pela API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      // Simular chamada à API para gerar relatório
      // Na implementação real, você faria uma chamada à API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso
      setSuccess(true);
      
      // Resetar estado de sucesso após alguns segundos
      setTimeout(() => {
        setSuccess(false);
        // Navegar para a tela de relatórios
        router.push('/mashguiach/reports');
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const shareReport = async () => {
    try {
      await Share.share({
        message: `Relatório: ${reportTitle}\nPeríodo: ${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}\n\n${reportDescription || 'Sem descrição adicional'}`,
        title: 'Compartilhar Relatório',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    dateSelector: {
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    dateSelectorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    dateTitle: {
      fontSize: 16,
      fontWeight: '500',
    },
    monthSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthText: {
      fontSize: 16,
      fontWeight: '500',
      marginHorizontal: 12,
    },
    dateRangeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    dateBox: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    dateBoxActive: {
      borderWidth: 2,
    },
    dateBoxText: {
      fontSize: 14,
      marginTop: 4,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      marginBottom: 8,
    },
    input: {
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      padding: 12,
      color: currentTheme.text,
    },
    textArea: {
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      padding: 12,
      color: currentTheme.text,
      height: 100,
      textAlignVertical: 'top',
    },
    button: {
      backgroundColor: currentTheme.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 8,
    },
    buttonText: {
      color: '#000',
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
    },
    secondaryButton: {
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
    },
    secondaryButtonText: {
      color: currentTheme.text,
      fontWeight: '600',
      fontSize: 16,
      marginLeft: 8,
    },
    successContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    successText: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 16,
    },
  });
  
  if (success) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
        <Header title="Criar Relatório" />
        <View style={styles.successContainer}>
          <CheckCircle size={64} color={currentTheme.primary} />
          <Text style={[styles.successText, { color: currentTheme.text }]}>
            Relatório gerado com sucesso!
          </Text>
          <Text style={{ color: currentTheme.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
            Você será redirecionado para a tela de relatórios em instantes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <Header title="Criar Relatório" />
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          Gerar Novo Relatório
        </Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Período do Relatório
          </Text>
          
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity 
              style={[
                styles.dateBox, 
                { backgroundColor: currentTheme.surface },
                dateSelectionMode === 'start' && [styles.dateBoxActive, { borderColor: currentTheme.primary }]
              ]}
              onPress={() => setDateSelectionMode('start')}
            >
              <Text style={[styles.dateBoxText, { color: currentTheme.textSecondary }]}>Data Inicial</Text>
              <Text style={[styles.dateBoxText, { color: currentTheme.text, fontWeight: '500' }]}>
                {format(startDate, 'dd/MM/yyyy')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.dateBox, 
                { backgroundColor: currentTheme.surface },
                dateSelectionMode === 'end' && [styles.dateBoxActive, { borderColor: currentTheme.primary }]
              ]}
              onPress={() => setDateSelectionMode('end')}
            >
              <Text style={[styles.dateBoxText, { color: currentTheme.textSecondary }]}>Data Final</Text>
              <Text style={[styles.dateBoxText, { color: currentTheme.text, fontWeight: '500' }]}>
                {format(endDate, 'dd/MM/yyyy')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateSelector}>
            <View style={styles.dateSelectorHeader}>
              <TouchableOpacity onPress={handlePreviousMonth} style={{ padding: 8 }}>
                <ChevronLeft size={24} color={currentTheme.text} />
              </TouchableOpacity>
              
              <View style={styles.monthSelector}>
                <Calendar size={20} color={currentTheme.primary} />
                <Text style={[styles.monthText, { color: currentTheme.text }]}>
                  {format(dateSelectionMode === 'start' ? startDate : endDate, "MMMM 'de' yyyy", { locale: ptBR })}
                </Text>
              </View>
              
              <TouchableOpacity onPress={handleNextMonth} style={{ padding: 8 }}>
                <ChevronRight size={24} color={currentTheme.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[{ color: currentTheme.textSecondary, textAlign: 'center' }]}>
              Selecione {dateSelectionMode === 'start' ? 'a data inicial' : 'a data final'} do relatório
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Informações do Relatório
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>
              Título do Relatório *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Relatório Mensal de Março"
              placeholderTextColor={currentTheme.textSecondary}
              value={reportTitle}
              onChangeText={setReportTitle}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>
              Descrição (opcional)
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="Adicione uma descrição ou observações para este relatório..."
              placeholderTextColor={currentTheme.textSecondary}
              value={reportDescription}
              onChangeText={setReportDescription}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={generateReport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <FileText size={20} color="#000" />
              <Text style={styles.buttonText}>Gerar Relatório</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={shareReport}
          disabled={loading}
        >
          <Share2 size={20} color={currentTheme.text} />
          <Text style={styles.secondaryButtonText}>Compartilhar</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
} 