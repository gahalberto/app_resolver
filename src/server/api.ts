import axios from "axios";
// Local 
// export const api = axios.create({
//   baseURL: "http://192.168.0.11:3000/api",
// });

// // Production
export const api = axios.create({
  baseURL: "https://byk.ong.br/api",
});
