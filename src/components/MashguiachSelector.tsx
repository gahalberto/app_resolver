import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { User, ChevronDown, CheckCircle, Shuffle } from 'lucide-react-native';
import { api } from '../server/api';
import { getToken } from '../services/authService';

interface Mashguiach {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

interface MashguiachSelectorProps {
  label: string;
  value: string | null;
  onChange: (mashguiachId: string) => void;
  theme: any;
  startDateTime: string | null;
  endDateTime: string | null;
  currentMashguiach?: Mashguiach | null;
  token: string | null;
  accepted?: boolean;
  onAcceptedChange?: (accepted: boolean) => void;
}

const MashguiachSelector: React.FC<MashguiachSelectorProps> = ({
  label,
  value,
  onChange,
  theme,
  startDateTime,
  endDateTime,
  currentMashguiach,
  token,
  accepted = false,
  onAcceptedChange
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [availableMashguiachim, setAvailableMashguiachim] = useState<Mashguiach[]>([]);
  const [loading, setLoading] = useState(false);
  const [canSelect, setCanSelect] = useState(false);

  useEffect(() => {
    setCanSelect(!!startDateTime && !!endDateTime);
    
    if (startDateTime && endDateTime && isDropdownVisible) {
      fetchAvailableMashguiachim();
    }
  }, [startDateTime, endDateTime, isDropdownVisible]);

  const fetchAvailableMashguiachim = async () => {
    if (!startDateTime || !endDateTime || !token) return;
    
    try {
      setLoading(true);
      const response = await api.get('/admin/getMashguichimAvalaible', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          startDateTime,
          endDateTime
        }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        setAvailableMashguiachim(response.data.data);
      }
    } catch (err) {
      console.error("Erro ao buscar mashguiachim disponíveis:", err);
      Alert.alert("Erro", "Não foi possível carregar os mashguiachim disponíveis");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedMashguiachName = () => {
    if (!value) return "Selecione um mashguiach";
    
    if (value === 'random') return "Aleatório";
    
    const selectedMashguiach = availableMashguiachim.find(m => m.id === value);
    if (selectedMashguiach) return selectedMashguiach.name;
    
    // Se o mashguiach selecionado não estiver na lista de disponíveis
    // (pode acontecer se ele for o atualmente atribuído e não estiver disponível agora)
    if (currentMashguiach && currentMashguiach.id === value) {
      return currentMashguiach.name + " (atual)";
    }
    
    return "Mashguiach não encontrado";
  };

  const handlePress = () => {
    if (canSelect) {
      setIsDropdownVisible(!isDropdownVisible);
    } else {
      Alert.alert(
        "Atenção",
        "Por favor, selecione primeiro os horários de início e término para verificar os Mashguiachim disponíveis."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.button, 
          { backgroundColor: theme.surface },
          !canSelect && styles.disabledButton
        ]}
        onPress={handlePress}
      >
        <View style={styles.buttonContent}>
          <User size={20} color={canSelect ? theme.primary : theme.textSecondary} />
          <Text 
            style={[
              styles.buttonText, 
              { color: theme.text },
              value && { color: theme.primary, fontWeight: 'bold' }
            ]}
          >
            {getSelectedMashguiachName()}
          </Text>
        </View>
        <ChevronDown size={20} color={canSelect ? theme.primary : theme.textSecondary} />
      </TouchableOpacity>
      
      {isDropdownVisible && (
        <View style={[styles.dropdown, { backgroundColor: theme.surface, borderColor: theme.surfaceLight }]}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Buscando Mashguiachim disponíveis...
              </Text>
            </View>
          ) : availableMashguiachim.length > 0 ? (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
              <TouchableOpacity
                key="random"
                style={[
                  styles.dropdownItem,
                  { borderBottomColor: theme.surfaceLight },
                  value === 'random' && { backgroundColor: theme.primary }
                ]}
                onPress={() => {
                  onChange('random');
                  setIsDropdownVisible(false);
                }}
              >
                <View style={styles.dropdownItemContent}>
                  <Shuffle 
                    size={16} 
                    color={value === 'random' ? '#FFF' : theme.textSecondary} 
                  />
                  <Text 
                    style={[
                      styles.dropdownItemText,
                      { color: theme.text },
                      value === 'random' && { color: '#FFF', fontWeight: 'bold' }
                    ]}
                  >
                    Aleatório
                  </Text>
                </View>
                {value === 'random' && (
                  <CheckCircle size={16} color="#FFF" />
                )}
              </TouchableOpacity>
              {availableMashguiachim.map((mashguiach) => (
                <TouchableOpacity
                  key={mashguiach.id}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: theme.surfaceLight },
                    value === mashguiach.id && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => {
                    onChange(mashguiach.id);
                    setIsDropdownVisible(false);
                  }}
                >
                  <View style={styles.dropdownItemContent}>
                    <User 
                      size={16} 
                      color={value === mashguiach.id ? '#FFF' : theme.textSecondary} 
                    />
                    <Text 
                      style={[
                        styles.dropdownItemText,
                        { color: theme.text },
                        value === mashguiach.id && { color: '#FFF', fontWeight: 'bold' }
                      ]}
                    >
                      {mashguiach.name}
                    </Text>
                  </View>
                  {value === mashguiach.id && (
                    <CheckCircle size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Nenhum Mashguiach disponível para este horário
              </Text>
            </View>
          )}
        </View>
      )}

      {value && onAcceptedChange && (
        <View style={[styles.acceptedContainer, { backgroundColor: theme.surface, borderColor: theme.surfaceLight }]}>
          <Text style={[styles.acceptedLabel, { color: theme.text }]}>
            Aceito pelo Mashguiach
          </Text>
          <TouchableOpacity
            onPress={() => onAcceptedChange(!accepted)}
          >
            <View style={{
              width: 50,
              height: 24,
              borderRadius: 12,
              backgroundColor: accepted ? theme.success : theme.surfaceLight,
              justifyContent: 'center',
              paddingHorizontal: 2,
            }}>
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#FFFFFF',
                alignSelf: accepted ? 'flex-end' : 'flex-start',
              }} />
            </View>
          </TouchableOpacity>
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
  disabledButton: {
    opacity: 0.5,
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
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  acceptedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  acceptedLabel: {
    fontSize: 14,
  },
});

export default MashguiachSelector; 