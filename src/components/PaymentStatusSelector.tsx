import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { DollarSign, ChevronDown, CheckCircle } from 'lucide-react-native';

interface PaymentStatusSelectorProps {
  label: string;
  value: string;
  onChange: (status: string) => void;
  theme: any;
}

const PaymentStatusSelector: React.FC<PaymentStatusSelectorProps> = ({
  label,
  value,
  onChange,
  theme
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Pendente';
      case 'Paid':
        return 'Pago';
      case 'Canceled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return theme.warning;
      case 'Paid':
        return theme.success;
      case 'Canceled':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.surface }]}
        onPress={() => setIsDropdownVisible(!isDropdownVisible)}
      >
        <View style={styles.buttonContent}>
          <DollarSign size={20} color={getStatusColor(value)} />
          <Text style={[styles.buttonText, { color: getStatusColor(value) }]}>
            {getStatusLabel(value) || "Selecionar status"}
          </Text>
        </View>
        <ChevronDown size={20} color={theme.textSecondary} />
      </TouchableOpacity>
      
      {isDropdownVisible && (
        <View style={[styles.dropdown, { backgroundColor: theme.surface, borderColor: theme.surfaceLight }]}>
          <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
            {['Pending', 'Paid', 'Canceled'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.dropdownItem,
                  { borderBottomColor: theme.surfaceLight },
                  value === status && { backgroundColor: theme.primary }
                ]}
                onPress={() => {
                  onChange(status);
                  setIsDropdownVisible(false);
                }}
              >
                <View style={styles.dropdownItemContent}>
                  <DollarSign 
                    size={16} 
                    color={value === status ? '#FFF' : getStatusColor(status)} 
                  />
                  <Text 
                    style={[
                      styles.dropdownItemText,
                      { color: value === status ? '#FFF' : getStatusColor(status) }
                    ]}
                  >
                    {getStatusLabel(status)}
                  </Text>
                </View>
                {value === status && (
                  <CheckCircle size={16} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
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
    fontWeight: '500',
  },
  dropdown: {
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default PaymentStatusSelector; 