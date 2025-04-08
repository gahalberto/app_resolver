import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = "@planner:userId";

// Configuração da API com timeout para evitar esperas longas
export const api = axios.create({
  // Usando a URL de produção por padrão
  baseURL: "https://byk.ong.br/api",
  // Adicionando timeout de 10 segundos para evitar esperas longas
  timeout: 10000,
  // Configurações adicionais para melhorar o desempenho
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para adicionar userId em todas as requisições
api.interceptors.request.use(async (config) => {
  try {
    // Se já existir userId no payload, não alterar
    if (config.method === 'post' && config.data && config.data.userId) {
      return config;
    }
    
    // Obter dados do usuário do AsyncStorage
    const userDataStr = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      
      // Para requisições POST
      if (config.method === 'post') {
        // Se não existir data, criar objeto vazio
        if (!config.data) {
          config.data = {};
        }
        
        // Se for string JSON, converter para objeto
        if (typeof config.data === 'string') {
          config.data = JSON.parse(config.data);
        }
        
        // Adicionar userId se não existir
        if (!config.data.userId && userData.id) {
          config.data.userId = userData.id;
        }
      }
      
      // Para requisições GET
      if (config.method === 'get') {
        if (!config.params) {
          config.params = {};
        }
        
        // Adicionar userId se não existir
        if (!config.params.userId && userData.id) {
          config.params.userId = userData.id;
        }
      }
    }
    
    return config;
  } catch (error) {
    console.error('Erro no interceptor:', error);
    return config;
  }
});

// // Configuração da API com timeout para evitar esperas longas
// export const api = axios.create({
//   // Usando a URL de produção por padrão
//   baseURL: "http://192.168.0.26:3000/api",
//   // Adicionando timeout de 10 segundos para evitar esperas longas
//   timeout: 10000,
//   // Configurações adicionais para melhorar o desempenho
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//   }
// });


// Para usar a versão local, descomente estas linhas e comente as de cima
// export const api = axios.create({
//   baseURL: "http://192.168.0.11:3000/api",
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//   }
// });
