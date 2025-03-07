import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { reportService } from '@/services/reportService';
import { useUser } from '@/contexts/UserContext';
import { FileText, Share2 } from 'lucide-react-native';

interface FixedJobReportButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const FixedJobReportButton: React.FC<FixedJobReportButtonProps> = ({
  onSuccess,
  onError,
}) => {
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

      const filePath = await reportService.generateFixedJobReport({
        userId: user.id,
        month,
        year,
      });

      setReportPath(filePath);
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
      <Text style={styles.title}>Relatório de Trabalho Fixo</Text>
      
      <TouchableOpacity 
        style={styles.dateSelector} 
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>
          {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
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
          style={[styles.button, styles.generateButton]} 
          onPress={handleGenerateReport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <FileText size={20} color="#fff" />
              <Text style={styles.buttonText}>Gerar Relatório</Text>
            </>
          )}
        </TouchableOpacity>

        {reportPath && (
          <TouchableOpacity 
            style={[styles.button, styles.shareButton]} 
            onPress={handleShareReport}
          >
            <Share2 size={20} color="#fff" />
            <Text style={styles.buttonText}>Compartilhar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dateSelector: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
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
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  generateButton: {
    backgroundColor: '#4a6da7',
  },
  shareButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 