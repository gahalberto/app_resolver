import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave usada para armazenar o token no AsyncStorage
const TOKEN_KEY = '@App:token';
const USER_DATA_KEY = '@App:userData';

// Salvar token no AsyncStorage
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Erro ao salvar token:', error);
  }
};

// Obter token do AsyncStorage
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Erro ao recuperar token:', error);
    return null;
  }
};

// Remover token do AsyncStorage (logout)
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Erro ao remover token:', error);
  }
};

// Verificar se o usuário está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token;
};

// Salvar dados do usuário
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(userData);
    await AsyncStorage.setItem(USER_DATA_KEY, jsonValue);
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
  }
};

// Obter dados do usuário
export const getUserData = async (): Promise<any | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_DATA_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Erro ao recuperar dados do usuário:', error);
    return null;
  }
};

// Remover dados do usuário
export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Erro ao remover dados do usuário:', error);
  }
};

// Realizar logout completo
export const logout = async (): Promise<void> => {
  try {
    await Promise.all([removeToken(), removeUserData()]);
  } catch (error) {
    console.error('Erro ao realizar logout:', error);
  }
}; 