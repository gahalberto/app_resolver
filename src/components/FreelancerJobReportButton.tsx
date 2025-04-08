import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { reportService } from '@/services/reportService';
import { useUser } from '@/contexts/UserContext';
import { FileText, Share2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { themes } from '@/styles/themes';

interface FreelancerJobReportButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const FreelancerJobReportButton: React.FC<FreelancerJobReportButtonProps> = ({
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

  const handleGenerateReport = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não identificado. Por favor, faça login novamente.');
      return;
    }

    setLoading(true);
    try {
      const month = getMonth(selectedDate) + 1; // getMonth retorna 0-11
      const year = getYear(selectedDate);

      const filePath = await reportService.generateFreelancerJobReport({
        userId: user.id,
        month,
        year,
        token: user.token
      });

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
            Relatório de Trabalho Freelancer
          </Text>
        </View>
        
        <Text style={[styles.cardDescription, { color: currentTheme.textSecondary }]}>
          Gere um relatório detalhado dos seus trabalhos freelancer para o mês selecionado.
        </Text>
        
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
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
  dateSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    textAlign: 'center',
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
}); 