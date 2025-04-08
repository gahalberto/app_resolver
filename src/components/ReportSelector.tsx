import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { reportService } from '@/services/reportService';
import { useUser } from '@/contexts/UserContext';
import { FileText, Share2, Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { themes } from '@/styles/themes';

interface ReportSelectorProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const ReportSelector: React.FC<ReportSelectorProps> = ({
  onSuccess,
  onError,
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reportPath, setReportPath] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'fixed' | 'freelancer'>('fixed');

  const handleGenerateReport = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não identificado. Por favor, faça login novamente.');
      return;
    }

    setLoading(true);
    try {
      const month = getMonth(selectedDate) + 1; // getMonth retorna 0-11
      const year = getYear(selectedDate);

      let filePath;
      if (reportType === 'fixed') {
        filePath = await reportService.generateFixedJobReport({
          userId: user.id,
          month,
          year,
          token: user.token
        });
      } else {
        filePath = await reportService.generateFreelancerJobReport({
          userId: user.id,
          month,
          year,
          token: user.token
        });
      }

      setReportPath(filePath);
      Alert.alert('Sucesso', 'Relatório gerado com sucesso!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório. Tente novamente mais tarde.');
      if (onError && error instanceof Error) onError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareReport = async () => {
    if (!reportPath) {
      Alert.alert('Erro', 'Nenhum relatório disponível para compartilhar.');
      return;
    }

    try {
      await reportService.sharePdf(reportPath);
    } catch (error) {
      console.error('Erro ao compartilhar relatório:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o relatório.');
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: currentTheme.surface }]}>
        <View style={styles.cardHeader}>
          <FileText size={24} color={currentTheme.primary} />
          <Text style={[styles.cardTitle, { color: currentTheme.text }]}>
            Gerar Relatório
          </Text>
        </View>
        
        <Text style={[styles.cardDescription, { color: currentTheme.textSecondary }]}>
          Escolha o tipo de relatório e o mês para gerar um relatório detalhado.
        </Text>
        
        <View style={styles.reportTypeContainer}>
          <TouchableOpacity
            style={[
              styles.reportTypeButton,
              reportType === 'fixed' && { backgroundColor: currentTheme.primary }
            ]}
            onPress={() => setReportType('fixed')}
          >
            <Text style={[
              styles.reportTypeText,
              reportType === 'fixed' && { color: '#FFFFFF' }
            ]}>
              Trabalho Fixo
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.reportTypeButton,
              reportType === 'freelancer' && { backgroundColor: currentTheme.primary }
            ]}
            onPress={() => setReportType('freelancer')}
          >
            <Text style={[
              styles.reportTypeText,
              reportType === 'freelancer' && { color: '#FFFFFF' }
            ]}>
              Trabalho Freelancer
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={20} color={currentTheme.textSecondary} style={styles.dateIcon} />
          <Text style={[styles.dateText, { color: currentTheme.text }]}>
            {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.primary }]}
            onPress={handleGenerateReport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <FileText size={18} color="#FFFFFF" />
                <Text style={styles.buttonText}>Gerar Relatório</Text>
              </>
            )}
          </TouchableOpacity>
          
          {reportPath && (
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: currentTheme.primary }]}
              onPress={handleShareReport}
            >
              <Share2 size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Compartilhar</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={[styles.infoTitle, { color: currentTheme.text }]}>
            {reportType === 'fixed' ? 'Relatório de Trabalho Fixo' : 'Relatório de Trabalho Freelancer'}
          </Text>
          <Text style={[styles.infoText, { color: currentTheme.textSecondary }]}>
            {reportType === 'fixed' ? (
              '• Informações do mashguiach\n• Resumo por estabelecimento\n• Detalhes dos dias trabalhados\n• Total de horas'
            ) : (
              '• Informações do mashguiach\n• Resumo de eventos e serviços\n• Detalhes dos trabalhos realizados\n• Total de horas'
            )}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  reportTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  reportTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 