import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { PageLayout } from "@/components/PageLayout";
import { useUser } from "@/contexts/UserContext";
import { colors } from "@/styles/colors";
import { api } from "@/server/api";
import { userStorage } from "@/storage/user";
import { Edit2, Save, User, Mail, Phone, Lock } from "lucide-react-native";

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Buscar dados adicionais do usuário quando a página carregar
  useEffect(() => {
    if (user?.id) {
      fetchUserDetails();
    }
  }, [user]);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`/users/${user?.id}`);
      const userDetails = response.data;
      
      setUserData(prev => ({
        ...prev,
        name: userDetails.name || user?.name || "",
        email: userDetails.email || user?.email || "",
        phone: userDetails.phone || "",
      }));
    } catch (error) {
      console.error("Erro ao buscar detalhes do usuário:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validações
    if (!userData.name.trim()) {
      Alert.alert("Erro", "O nome é obrigatório");
      return;
    }

    if (!userData.email.trim()) {
      Alert.alert("Erro", "O email é obrigatório");
      return;
    }

    // Validação de senha
    if (userData.newPassword) {
      if (!userData.currentPassword) {
        Alert.alert("Erro", "Informe sua senha atual para alterá-la");
        return;
      }

      if (userData.newPassword.length < 6) {
        Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres");
        return;
      }

      if (userData.newPassword !== userData.confirmPassword) {
        Alert.alert("Erro", "As senhas não coincidem");
        return;
      }
    }

    setIsSaving(true);

    try {
      // Dados a serem enviados
      const updateData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      };

      // Adicionar dados de senha apenas se estiver alterando
      if (userData.newPassword) {
        Object.assign(updateData, {
          currentPassword: userData.currentPassword,
          newPassword: userData.newPassword,
        });
      }

      // Enviar requisição para atualizar o perfil
      const response = await api.put(`/users/${user.id}`, updateData);
      
      // Atualizar dados do usuário no storage
      const updatedUser = {
        ...user,
        name: userData.name,
        email: userData.email,
      };
      
      await userStorage.save(updatedUser);

      // Limpar campos de senha
      setUserData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setIsEditing(false);
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert("Erro", "Não foi possível atualizar o perfil. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Meu Perfil">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.bkGolden[300]} />
        </View>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout title="Meu Perfil">
        <View className="flex-1 items-center justify-center">
          <Text className="text-white text-lg">Você não está logado</Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Meu Perfil">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4">
          {/* Cabeçalho do perfil */}
          <View className="items-center py-6">
            <View className="w-24 h-24 rounded-full bg-bkblue-700 items-center justify-center mb-4">
              <User size={48} color={colors.bkGolden[300]} />
            </View>
            <Text className="text-white text-xl font-bold">{user.name}</Text>
            <Text className="text-zinc-400">{user.email}</Text>
          </View>

          {/* Botão de editar/salvar */}
          <View className="items-end mb-6">
            {!isEditing ? (
              <TouchableOpacity 
                className="flex-row items-center bg-bkGolden-300 px-4 py-2 rounded-md"
                onPress={() => setIsEditing(true)}
              >
                <Edit2 size={18} color={colors.bkblue[900]} />
                <Text className="text-bkblue-900 font-medium ml-2">Editar Perfil</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                className="flex-row items-center bg-bkGolden-300 px-4 py-2 rounded-md"
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.bkblue[900]} />
                ) : (
                  <>
                    <Save size={18} color={colors.bkblue[900]} />
                    <Text className="text-bkblue-900 font-medium ml-2">Salvar</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Formulário de perfil */}
          <View className="mb-6">
            <Text className="text-white text-lg font-medium mb-4">Informações Pessoais</Text>
            
            {/* Nome */}
            <View className="mb-4">
              <Text className="text-zinc-400 mb-1">Nome</Text>
              <View className="flex-row items-center bg-bkblue-700 rounded-md px-3 py-2">
                <User size={20} color={colors.zinc[400]} />
                <TextInput
                  className="flex-1 text-white ml-2"
                  value={userData.name}
                  onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
                  editable={isEditing}
                  placeholderTextColor={colors.zinc[500]}
                  placeholder="Seu nome"
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-zinc-400 mb-1">Email</Text>
              <View className="flex-row items-center bg-bkblue-700 rounded-md px-3 py-2">
                <Mail size={20} color={colors.zinc[400]} />
                <TextInput
                  className="flex-1 text-white ml-2"
                  value={userData.email}
                  onChangeText={(text) => setUserData(prev => ({ ...prev, email: text }))}
                  editable={isEditing}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.zinc[500]}
                  placeholder="Seu email"
                />
              </View>
            </View>

            {/* Telefone */}
            <View className="mb-4">
              <Text className="text-zinc-400 mb-1">Telefone</Text>
              <View className="flex-row items-center bg-bkblue-700 rounded-md px-3 py-2">
                <Phone size={20} color={colors.zinc[400]} />
                <TextInput
                  className="flex-1 text-white ml-2"
                  value={userData.phone}
                  onChangeText={(text) => setUserData(prev => ({ ...prev, phone: text }))}
                  editable={isEditing}
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.zinc[500]}
                  placeholder="Seu telefone"
                />
              </View>
            </View>
          </View>

          {/* Seção de alteração de senha - visível apenas no modo de edição */}
          {isEditing && (
            <View className="mb-6">
              <Text className="text-white text-lg font-medium mb-4">Alterar Senha</Text>
              
              {/* Senha atual */}
              <View className="mb-4">
                <Text className="text-zinc-400 mb-1">Senha Atual</Text>
                <View className="flex-row items-center bg-bkblue-700 rounded-md px-3 py-2">
                  <Lock size={20} color={colors.zinc[400]} />
                  <TextInput
                    className="flex-1 text-white ml-2"
                    value={userData.currentPassword}
                    onChangeText={(text) => setUserData(prev => ({ ...prev, currentPassword: text }))}
                    secureTextEntry
                    placeholderTextColor={colors.zinc[500]}
                    placeholder="Sua senha atual"
                  />
                </View>
              </View>

              {/* Nova senha */}
              <View className="mb-4">
                <Text className="text-zinc-400 mb-1">Nova Senha</Text>
                <View className="flex-row items-center bg-bkblue-700 rounded-md px-3 py-2">
                  <Lock size={20} color={colors.zinc[400]} />
                  <TextInput
                    className="flex-1 text-white ml-2"
                    value={userData.newPassword}
                    onChangeText={(text) => setUserData(prev => ({ ...prev, newPassword: text }))}
                    secureTextEntry
                    placeholderTextColor={colors.zinc[500]}
                    placeholder="Nova senha"
                  />
                </View>
              </View>

              {/* Confirmar nova senha */}
              <View className="mb-4">
                <Text className="text-zinc-400 mb-1">Confirmar Nova Senha</Text>
                <View className="flex-row items-center bg-bkblue-700 rounded-md px-3 py-2">
                  <Lock size={20} color={colors.zinc[400]} />
                  <TextInput
                    className="flex-1 text-white ml-2"
                    value={userData.confirmPassword}
                    onChangeText={(text) => setUserData(prev => ({ ...prev, confirmPassword: text }))}
                    secureTextEntry
                    placeholderTextColor={colors.zinc[500]}
                    placeholder="Confirme a nova senha"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Informações adicionais */}
          <View className="mb-8">
            <Text className="text-white text-lg font-medium mb-4">Informações da Conta</Text>
            
            <View className="bg-bkblue-700 rounded-lg p-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-zinc-400">ID do Usuário</Text>
                <Text className="text-white">{user.id}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-zinc-400">Tipo de Conta</Text>
                <Text className="text-white">Mashguiach</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageLayout>
  );
} 