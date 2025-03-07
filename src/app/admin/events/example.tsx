import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { themes } from '@/styles/themes';
import { Header } from '@/components/Header';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';
import { ChevronLeft, Calendar, Users } from 'lucide-react-native';

export default function ExamplePage() {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  
  // Estado para os campos do evento (não do serviço)
  const [title, setTitle] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [responsable, setResponsable] = useState<string>('');
  const [responsableTelephone, setResponsableTelephone] = useState<string>('');
  const [nrPax, setNrPax] = useState<string>('0');
  const [eventType, setEventType] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [menuUrl, setMenuUrl] = useState<string>('');
  const [address, setAddress] = useState({
    address_zipcode: '',
    address_street: '',
    address_number: '',
    address_neighbor: '',
    address_city: '',
    address_state: '',
  });

  const handleAddressChange = (field: string, value: string) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Header title="Editar Evento" />
      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color={currentTheme.primary} />
          <Text style={[styles.backButtonText, { color: currentTheme.primary }]}>Voltar</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: currentTheme.text }]}>
          Editar Evento
        </Text>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Título do Evento</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Título do evento"
            placeholderTextColor={currentTheme.textSecondary}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Nome do Cliente</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
            value={clientName}
            onChangeText={setClientName}
            placeholder="Nome do cliente"
            placeholderTextColor={currentTheme.textSecondary}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Responsável</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
            value={responsable}
            onChangeText={setResponsable}
            placeholder="Nome do responsável"
            placeholderTextColor={currentTheme.textSecondary}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Telefone do Responsável</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
            value={responsableTelephone}
            onChangeText={setResponsableTelephone}
            placeholder="Telefone do responsável"
            placeholderTextColor={currentTheme.textSecondary}
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Número de Participantes</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
            value={nrPax}
            onChangeText={setNrPax}
            placeholder="Número de participantes"
            placeholderTextColor={currentTheme.textSecondary}
            keyboardType="number-pad"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Tipo de Evento</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
            value={eventType}
            onChangeText={setEventType}
            placeholder="Tipo de evento (ex: Casamento, Aniversário)"
            placeholderTextColor={currentTheme.textSecondary}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Tipo de Serviço</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
            value={serviceType}
            onChangeText={setServiceType}
            placeholder="Tipo de serviço"
            placeholderTextColor={currentTheme.textSecondary}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>URL do Menu</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
            value={menuUrl}
            onChangeText={setMenuUrl}
            placeholder="URL do menu"
            placeholderTextColor={currentTheme.textSecondary}
          />
        </View>
        
        <View style={[styles.switchContainer, { backgroundColor: currentTheme.surface, borderColor: currentTheme.surfaceLight }]}>
          <Text style={[styles.switchLabel, { color: currentTheme.text }]}>
            Evento Aprovado
          </Text>
          <TouchableOpacity
            onPress={() => setIsApproved(!isApproved)}
          >
            <View style={{
              width: 50,
              height: 24,
              borderRadius: 12,
              backgroundColor: isApproved ? currentTheme.success : currentTheme.surfaceLight,
              justifyContent: 'center',
              paddingHorizontal: 2,
            }}>
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#FFFFFF',
                alignSelf: isApproved ? 'flex-end' : 'flex-start',
              }} />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.sectionHeader}>
          <Calendar size={20} color={currentTheme.primary} />
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Endereço do Evento</Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>CEP</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
            value={address.address_zipcode}
            onChangeText={(text) => handleAddressChange('address_zipcode', text)}
            placeholder="CEP"
            placeholderTextColor={currentTheme.textSecondary}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Rua</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
            value={address.address_street}
            onChangeText={(text) => handleAddressChange('address_street', text)}
            placeholder="Rua"
            placeholderTextColor={currentTheme.textSecondary}
          />
        </View>
        
        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Número</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
              value={address.address_number}
              onChangeText={(text) => handleAddressChange('address_number', text)}
              placeholder="Número"
              placeholderTextColor={currentTheme.textSecondary}
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 2 }]}>
            <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Bairro</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
              value={address.address_neighbor}
              onChangeText={(text) => handleAddressChange('address_neighbor', text)}
              placeholder="Bairro"
              placeholderTextColor={currentTheme.textSecondary}
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 2, marginRight: 8 }]}>
            <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Cidade</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
              value={address.address_city}
              onChangeText={(text) => handleAddressChange('address_city', text)}
              placeholder="Cidade"
              placeholderTextColor={currentTheme.textSecondary}
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Estado</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.surfaceLight }]}
              value={address.address_state}
              onChangeText={(text) => handleAddressChange('address_state', text)}
              placeholder="Estado"
              placeholderTextColor={currentTheme.textSecondary}
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: currentTheme.primary }]}
          onPress={() => {
            // Aqui você implementaria a lógica para salvar os dados
            console.log({
              title,
              clientName,
              responsable,
              responsableTelephone,
              nrPax,
              eventType,
              serviceType,
              isApproved,
              menuUrl,
              address
            });
          }}
        >
          <Text style={styles.saveButtonText}>Salvar Alterações</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 