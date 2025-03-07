import axios from "axios";

// // Configuração da API com timeout para evitar esperas longas
// export const api = axios.create({
//   // Usando a URL de produção por padrão
//   baseURL: "https://byk.ong.br/api",
//   // Adicionando timeout de 10 segundos para evitar esperas longas
//   timeout: 10000,
//   // Configurações adicionais para melhorar o desempenho
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//   }
// });

// Configuração da API com timeout para evitar esperas longas
export const api = axios.create({
  // Usando a URL de produção por padrão
  baseURL: "http://192.168.0.11:3000/api",
  // Adicionando timeout de 10 segundos para evitar esperas longas
  timeout: 10000,
  // Configurações adicionais para melhorar o desempenho
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});


// Para usar a versão local, descomente estas linhas e comente as de cima
// export const api = axios.create({
//   baseURL: "http://192.168.0.11:3000/api",
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//   }
// });
