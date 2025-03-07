import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, X, Edit, Save } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { themes } from '../../styles/themes';
import { Header } from '../../components/Header';
import { BASEURL } from '../../config';
import { api } from '../../server/api';
import { useUser } from '../../contexts/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  email: string;
  phone: string;
  manager_id: string | null;
  manager_name: string | null;
  obs: string | null;
  active: boolean;
}

interface UpdateStoreData {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  email?: string;
  phone?: string;
  manager_id?: string | null;
  manager_name?: string | null;
  obs?: string | null;
  active?: boolean;
}

export default function EstablishmentsPage() {
  const { theme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [editedStore, setEditedStore] = useState<UpdateStoreData | null>(null);

  useEffect(() => {
    fetchStores();
  }, [user]);

  useEffect(() => {
    filterStores();
  }, [searchQuery, stores]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/getAllStores', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      if (response.data && Array.isArray(response.data)) {
        setStores(response.data);
        setFilteredStores(response.data);
      } else {
        setStores([]);
        setFilteredStores([]);
      }
    } catch (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os estabelecimentos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const filterStores = () => {
    if (!searchQuery.trim()) {
      setFilteredStores(stores);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = stores.filter(
      (store) =>
        store.name.toLowerCase().includes(query) ||
        store.email.toLowerCase().includes(query) ||
        store.phone.toLowerCase().includes(query) ||
        store.city.toLowerCase().includes(query)
    );
    setFilteredStores(filtered);
  };

  const openEditModal = (store: Store) => {
    setSelectedStore(store);
    setEditedStore({
      id: store.id,
      name: store.name,
      address: store.address,
      city: store.city,
      state: store.state,
      zip_code: store.zip_code,
      email: store.email,
      phone: store.phone,
      manager_id: store.manager_id,
      manager_name: store.manager_name,
      obs: store.obs,
      active: store.active,
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedStore(null);
    setEditedStore(null);
    setModalVisible(false);
  };

  const handleSave = async () => {
    if (!editedStore) return;

    try {
      setLoading(true);
      const response = await api.post('/admin/saveStore', editedStore, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (response.data && response.data.success) {
        Alert.alert('Sucesso', 'Estabelecimento atualizado com sucesso!');
        fetchStores(); // Recarrega a lista de estabelecimentos
        closeModal();
      } else {
        Alert.alert('Erro', response.data?.message || 'Não foi possível atualizar o estabelecimento');
      }
    } catch (error) {
      console.error('Erro ao salvar estabelecimento:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Estabelecimentos" />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={currentTheme.primary} />
          <Text style={styles.backButtonText}>Voltar para Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Search size={20} color={currentTheme.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar estabelecimentos..."
            placeholderTextColor={currentTheme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={currentTheme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {loading && stores.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={currentTheme.primary} />
            <Text style={{ color: currentTheme.text, marginTop: 16 }}>
              Carregando estabelecimentos...
            </Text>
          </View>
        ) : filteredStores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: currentTheme.textSecondary, textAlign: 'center' }}>
              Nenhum estabelecimento encontrado.
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.storesList}>
            {filteredStores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={styles.storeCard}
                onPress={() => openEditModal(store)}
              >
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.storeDetail}>
                    {store.city}, {store.state}
                  </Text>
                  <Text style={styles.storeDetail}>
                    {store.email}
                  </Text>
                  <Text style={styles.storeDetail}>
                    {store.phone}
                  </Text>
                </View>
                <Edit size={20} color={currentTheme.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {modalVisible && selectedStore && editedStore && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Editar Estabelecimento
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <X size={24} color={currentTheme.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nome</Text>
                  <TextInput
                    style={styles.input}
                    value={editedStore.name}
                    onChangeText={(text) => setEditedStore({ ...editedStore, name: text })}
                    placeholder="Nome do estabelecimento"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Endereço</Text>
                  <TextInput
                    style={styles.input}
                    value={editedStore.address}
                    onChangeText={(text) => setEditedStore({ ...editedStore, address: text })}
                    placeholder="Endereço"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>

                <View style={styles.rowContainer}>
                  <View style={[styles.formGroup, { flex: 2, marginRight: 8 }]}>
                    <Text style={styles.label}>Cidade</Text>
                    <TextInput
                      style={styles.input}
                      value={editedStore.city}
                      onChangeText={(text) => setEditedStore({ ...editedStore, city: text })}
                      placeholder="Cidade"
                      placeholderTextColor={currentTheme.textSecondary}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Estado</Text>
                    <TextInput
                      style={styles.input}
                      value={editedStore.state}
                      onChangeText={(text) => setEditedStore({ ...editedStore, state: text })}
                      placeholder="Estado"
                      placeholderTextColor={currentTheme.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>CEP</Text>
                  <TextInput
                    style={styles.input}
                    value={editedStore.zip_code}
                    onChangeText={(text) => setEditedStore({ ...editedStore, zip_code: text })}
                    placeholder="CEP"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={editedStore.email}
                    onChangeText={(text) => setEditedStore({ ...editedStore, email: text })}
                    placeholder="Email"
                    placeholderTextColor={currentTheme.textSecondary}
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Telefone</Text>
                  <TextInput
                    style={styles.input}
                    value={editedStore.phone}
                    onChangeText={(text) => setEditedStore({ ...editedStore, phone: text })}
                    placeholder="Telefone"
                    placeholderTextColor={currentTheme.textSecondary}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nome do Gerente</Text>
                  <TextInput
                    style={styles.input}
                    value={editedStore.manager_name || ''}
                    onChangeText={(text) => setEditedStore({ ...editedStore, manager_name: text })}
                    placeholder="Nome do gerente"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Observações</Text>
                  <TextInput
                    style={styles.textarea}
                    value={editedStore.obs || ''}
                    onChangeText={(text) => setEditedStore({ ...editedStore, obs: text })}
                    placeholder="Observações"
                    placeholderTextColor={currentTheme.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Save size={20} color="white" style={styles.saveIcon} />
                      <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 16,
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#BA9A5F',
    marginLeft: 4,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  storesList: {
    flex: 1,
  },
  storeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  storeDetail: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 2,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#000',
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#FFF',
  },
  textarea: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#FFF',
    minHeight: 100,
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BA9A5F',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 