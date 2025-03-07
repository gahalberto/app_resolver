import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, ChevronDown } from 'lucide-react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CustomDateTimePickerProps {
  label: string;
  value: string | null;
  onChange: (date: Date) => void;
  theme: any;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  label,
  value,
  onChange,
  theme
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (error) {
      return '';
    }
  };

  const handleConfirm = (date: Date) => {
    setIsVisible(false);
    onChange(date);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.surface }]}
        onPress={() => setIsVisible(true)}
      >
        <View style={styles.buttonContent}>
          <Clock size={20} color={theme.textSecondary} />
          <Text style={[styles.buttonText, { color: theme.text }]}>
            {value ? formatTime(value) : "Selecionar data e hora"}
          </Text>
        </View>
        <ChevronDown size={20} color={theme.textSecondary} />
      </TouchableOpacity>
      
      <DateTimePickerModal
        isVisible={isVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={() => setIsVisible(false)}
        date={value ? new Date(value) : new Date()}
        locale="pt-BR"
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default CustomDateTimePicker; 