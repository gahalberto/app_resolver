import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar, ChevronDown, CheckCircle } from 'lucide-react-native';

interface ServiceTypeSelectorProps {
  label: string;
  value: string;
  onChange: (type: string) => void;
  theme: any;
}

const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({
  label,
  value,
  onChange,
  theme
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PRODUCAO':
        return 'Produção';
      case 'EVENTO':
        return 'Evento';
      case 'SUBSTITUICAO':
        return 'Substituição';
      default:
        return type;
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
          <Calendar size={20} color={theme.textSecondary} />
          <Text style={[styles.buttonText, { color: theme.text }]}>
            {getTypeLabel(value) || "Selecionar tipo"}
          </Text>
        </View>
        <ChevronDown size={20} color={theme.textSecondary} />
      </TouchableOpacity>
      
      {isDropdownVisible && (
        <View style={[styles.dropdown, { backgroundColor: theme.surface, borderColor: theme.surfaceLight }]}>
          <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
            {['PRODUCAO', 'EVENTO', 'SUBSTITUICAO'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.dropdownItem,
                  { borderBottomColor: theme.surfaceLight },
                  value === type && { backgroundColor: theme.primary }
                ]}
                onPress={() => {
                  onChange(type);
                  setIsDropdownVisible(false);
                }}
              >
                <View style={styles.dropdownItemContent}>
                  <Calendar 
                    size={16} 
                    color={value === type ? '#FFF' : theme.textSecondary} 
                  />
                  <Text 
                    style={[
                      styles.dropdownItemText,
                      { color: theme.text },
                      value === type && { color: '#FFF', fontWeight: 'bold' }
                    ]}
                  >
                    {getTypeLabel(type)}
                  </Text>
                </View>
                {value === type && (
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
  },
});

export default ServiceTypeSelector; 