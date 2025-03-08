import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, ScrollView, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { api } from "@/server/api";
import { useUser } from "@/contexts/UserContext";
import { Users, Search, X, Edit, Save, ChevronLeft, Eye, EyeOff, Key } from "lucide-react-native";
import { router } from "expo-router";

interface Mashguiach {
  id: string;
  name: string;
  email: string;
  phone: string;
  synagogueId: string | null;
  roleId: number;
  status: boolean;
  jewishName: string | null;
  address_neighbor: string;
  address_number: string;
  address_state: string;
  address_street: string;
  address_zicode: string;
  address_city: string;
  address_lat: string | null;
  address_lng: string | null;
  pixKey: string;
  avatar_url: string;
}

// Interface para os dados de atualização que podem incluir senha
interface UpdateUserData extends Partial<Mashguiach> {
  id: string;
  password?: string;
}

export default function MashguichimPage() {
  const { theme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  const [mashguichim, setMashguichim] = useState<Mashguiach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMashguiach, setSelectedMashguiach] = useState<Mashguiach | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedMashguiach, setEditedMashguiach] = useState<Partial<Mashguiach>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    fetchMashguichim();
  }, [user]);

  const fetchMashguichim = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/getAllMashguichim', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      setMashguichim(response.data.mashguichim);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar mashguichim:", err);
      setError("Não foi possível carregar a lista de mashguichim");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const filteredMashguichim = mashguichim.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phone.includes(searchQuery)
  );

  const openEditModal = (mashguiach: Mashguiach) => {
    setSelectedMashguiach(mashguiach);
    setEditedMashguiach({
      name: mashguiach.name,
      email: mashguiach.email,
      phone: mashguiach.phone,
      jewishName: mashguiach.jewishName,
      address_street: mashguiach.address_street,
      address_number: mashguiach.address_number,
      address_neighbor: mashguiach.address_neighbor,
      address_city: mashguiach.address_city,
      address_state: mashguiach.address_state,
      address_zicode: mashguiach.address_zicode,
      pixKey: mashguiach.pixKey,
    });
    setModalVisible(true);
    setNewPassword('');
    setChangePassword(false);
    setShowPassword(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMashguiach(null);
    setEditedMashguiach({});
    setNewPassword('');
    setChangePassword(false);
    setShowPassword(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedMashguiach(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!selectedMashguiach) return;

    try {
      setLoading(true);

      // Preparar dados para envio
      const userData: UpdateUserData = {
        id: selectedMashguiach.id,
        ...editedMashguiach
      };

      // Adicionar senha se estiver alterando
      if (changePassword && newPassword.trim()) {
        userData.password = newPassword.trim();
      }

      // Usar o endpoint correto para salvar usuário
      const response = await api.put('/admin/saveUser', userData, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      if (response.data.success) {
        // Atualiza a lista local
        setMashguichim(prev =>
          prev.map(item =>
            item.id === selectedMashguiach.id
              ? { ...item, ...editedMashguiach }
              : item
          )
        );

        Alert.alert("Sucesso", "Dados do mashguiach atualizados com sucesso");
        closeModal();
        setError(null);
      } else {
        throw new Error(response.data.message || "Erro ao atualizar usuário");
      }
    } catch (err) {
      console.error("Erro ao atualizar mashguiach:", err);
      setError("Não foi possível atualizar os dados do mashguiach");
      Alert.alert("Erro", "Não foi possível atualizar os dados do mashguiach");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    content: {
      padding: 16,
      flex: 1,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: currentTheme.textSecondary,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      height: 48,
      color: currentTheme.text,
      paddingLeft: 8,
    },
    listContainer: {
      flex: 1,
    },
    itemContainer: {
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(186, 154, 95, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    itemContent: {
      flex: 1,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.text,
      marginBottom: 4,
    },
    itemEmail: {
      fontSize: 14,
      color: currentTheme.textSecondary,
      marginBottom: 2,
    },
    itemPhone: {
      fontSize: 14,
      color: currentTheme.textSecondary,
    },
    editButton: {
      padding: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: currentTheme.error,
      textAlign: 'center',
      marginTop: 20,
    },
    emptyText: {
      color: currentTheme.textSecondary,
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
    },
    modalContent: {
      backgroundColor: currentTheme.background,
      borderRadius: 12,
      margin: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.surfaceLight,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.text,
    },
    closeButton: {
      padding: 4,
    },
    modalBody: {
      padding: 16,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      color: currentTheme.textSecondary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      padding: 12,
      color: currentTheme.text,
      borderWidth: 1,
      borderColor: currentTheme.surfaceLight,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: currentTheme.surfaceLight,
    },
    saveButton: {
      backgroundColor: currentTheme.primary,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 8,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    backButtonText: {
      color: currentTheme.primary,
      marginLeft: 4,
      fontSize: 16,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    passwordInput: {
      flex: 1,
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      padding: 12,
      color: currentTheme.text,
      borderWidth: 1,
      borderColor: currentTheme.surfaceLight,
    },
    passwordToggle: {
      position: 'absolute',
      right: 12,
      padding: 4,
    },
    passwordSection: {
      marginTop: 16,
      marginBottom: 16,
      padding: 16,
      backgroundColor: currentTheme.surfaceLight,
      borderRadius: 8,
    },
    passwordHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    passwordTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.text,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    switchLabel: {
      marginRight: 8,
      fontSize: 14,
      color: currentTheme.textSecondary,
    },
  });

  const renderItem = ({ item }: { item: Mashguiach }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => openEditModal(item)}
    >
      <View style={styles.itemIcon}>
        <Users size={24} color={currentTheme.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemEmail}>{item.email}</Text>
        <Text style={styles.itemPhone}>{item.phone}</Text>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => openEditModal(item)}
      >
        <Edit size={20} color={currentTheme.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading && mashguichim.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Mashguichim" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={{ color: currentTheme.text, marginTop: 16 }}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mashguichim" />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color={currentTheme.primary} />
          <Text style={styles.backButtonText}>Voltar para Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Mashguichim</Text>
          <Text style={styles.subtitle}>Gerenciar mashguichim do sistema</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={currentTheme.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, email ou telefone"
            placeholderTextColor={currentTheme.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredMashguichim.length === 0 ? (
          <Text style={styles.emptyText}>
            {searchQuery ? "Nenhum mashguiach encontrado" : "Não há mashguichim cadastrados"}
          </Text>
        ) : (
          <FlatList
            data={filteredMashguichim}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Mashguiach</Text>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <X size={24} color={currentTheme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nome</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMashguiach.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    placeholder="Nome completo"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nome Judaico</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMashguiach.jewishName || ''}
                    onChangeText={(text) => handleInputChange('jewishName', text)}
                    placeholder="Nome judaico"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMashguiach.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    placeholder="Email"
                    placeholderTextColor={currentTheme.textSecondary}
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Telefone</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMashguiach.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    placeholder="Telefone"
                    placeholderTextColor={currentTheme.textSecondary}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Chave PIX</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMashguiach.pixKey}
                    onChangeText={(text) => handleInputChange('pixKey', text)}
                    placeholder="Chave PIX"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>

                <View style={styles.passwordSection}>
                  <View style={styles.passwordHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Key size={20} color={currentTheme.primary} />
                      <Text style={[styles.passwordTitle, { marginLeft: 8 }]}>Alterar Senha</Text>
                    </View>
                    <View style={styles.switchContainer}>
                      <Text style={styles.switchLabel}>Alterar</Text>
                      <Switch
                        value={changePassword}
                        onValueChange={setChangePassword}
                        trackColor={{ false: currentTheme.surfaceLight, true: `${currentTheme.primary}80` }}
                        thumbColor={changePassword ? currentTheme.primary : '#f4f3f4'}
                      />
                    </View>
                  </View>

                  {changePassword && (
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Nova Senha</Text>
                      <View style={styles.passwordContainer}>
                        <TextInput
                          style={styles.passwordInput}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="Digite a nova senha"
                          placeholderTextColor={currentTheme.textSecondary}
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                          style={styles.passwordToggle}
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={20} color={currentTheme.textSecondary} />
                          ) : (
                            <Eye size={20} color={currentTheme.textSecondary} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                <Text style={[styles.label, { marginTop: 8, fontWeight: '600' }]}>Endereço</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>CEP</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMashguiach.address_zicode}
                    onChangeText={(text) => handleInputChange('address_zicode', text)}
                    placeholder="CEP"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Rua</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMashguiach.address_street}
                    onChangeText={(text) => handleInputChange('address_street', text)}
                    placeholder="Rua"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Número</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMashguiach.address_number}
                    onChangeText={(text) => handleInputChange('address_number', text)}
                    placeholder="Número"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Bairro</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMashguiach.address_neighbor}
                    onChangeText={(text) => handleInputChange('address_neighbor', text)}
                    placeholder="Bairro"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Cidade</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMashguiach.address_city}
                    onChangeText={(text) => handleInputChange('address_city', text)}
                    placeholder="Cidade"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Estado</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMashguiach.address_state}
                    onChangeText={(text) => handleInputChange('address_state', text)}
                    placeholder="Estado"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Save size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}