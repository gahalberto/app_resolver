import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MapPin, Search } from 'lucide-react-native';

interface AddressFormProps {
  address: {
    address_zipcode: string;
    address_street: string;
    address_number: string;
    address_neighbor: string;
    address_city: string;
    address_state: string;
  };
  onChange: (field: string, value: string) => void;
  theme: any;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onChange,
  theme
}) => {
  const [loading, setLoading] = useState(false);

  const searchCEP = async () => {
    if (!address.address_zipcode || address.address_zipcode.length < 8) {
      Alert.alert("Erro", "Por favor, digite um CEP válido");
      return;
    }

    try {
      setLoading(true);
      const cep = address.address_zipcode.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert("Erro", "CEP não encontrado");
        return;
      }

      // Preencher os campos com os dados retornados
      onChange('address_street', data.logradouro || '');
      onChange('address_neighbor', data.bairro || '');
      onChange('address_city', data.localidade || '');
      onChange('address_state', data.uf || '');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      Alert.alert("Erro", "Não foi possível buscar o CEP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.surfaceLight }]}>
        <MapPin size={20} color={theme.primary} />
        <Text style={[styles.headerText, { color: theme.text }]}>Endereço</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>CEP</Text>
        <View style={styles.cepContainer}>
          <TextInput
            style={[
              styles.input, 
              styles.cepInput,
              { backgroundColor: theme.surface, color: theme.text, borderColor: theme.surfaceLight }
            ]}
            value={address.address_zipcode}
            onChangeText={(text) => onChange('address_zipcode', text)}
            placeholder="CEP"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            maxLength={9}
          />
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: theme.primary }]}
            onPress={searchCEP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Search size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Rua</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.surfaceLight }]}
          value={address.address_street}
          onChangeText={(text) => onChange('address_street', text)}
          placeholder="Rua"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Número</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.surfaceLight }]}
            value={address.address_number}
            onChangeText={(text) => onChange('address_number', text)}
            placeholder="Número"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.formGroup, { flex: 2 }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Bairro</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.surfaceLight }]}
            value={address.address_neighbor}
            onChangeText={(text) => onChange('address_neighbor', text)}
            placeholder="Bairro"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 2, marginRight: 8 }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Cidade</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.surfaceLight }]}
            value={address.address_city}
            onChangeText={(text) => onChange('address_city', text)}
            placeholder="Cidade"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Estado</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.surfaceLight }]}
            value={address.address_state}
            onChangeText={(text) => onChange('address_state', text)}
            placeholder="Estado"
            placeholderTextColor={theme.textSecondary}
            maxLength={2}
            autoCapitalize="characters"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cepInput: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddressForm; 