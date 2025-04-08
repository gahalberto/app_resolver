import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { userStorage } from "@/storage/user";
import { api } from "@/server/api";
import { router } from "expo-router";

interface User {
  id: string;
  name: string;
  email: string;
  token: string;  // Usamos token internamente, mesmo que a API retorne como authToken
  roleId: string; // Garantimos que roleId seja tratado como string
}

interface RegisterProps {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface UserContextData {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterProps) => Promise<void>; // Adiciona função de registro
}

const UserContext = createContext<UserContextData | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await userStorage.get();
      if (storedUser) {
        // Garantir que o roleId seja uma string
        if (typeof storedUser.roleId !== 'string') {
          storedUser.roleId = storedUser.roleId.toString();
        }
        
        setUser(storedUser);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedUser.token}`;
        
        console.log("Usuário carregado do storage:", storedUser);
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    console.log("Email:", email);
    try {
      const response = await api.post("/login", { email, password });
      console.log("Resposta do login:", response.data);
      
      // Extrair dados da resposta
      const { user, token } = response.data;
      
      // Verificar se o token está no objeto user como authToken
      const userToken = token || user.authToken;
      
      if (!userToken) {
        throw new Error("Token não encontrado na resposta");
      }

      const userData = { 
        ...user, 
        token: userToken, // Garantir que o token esteja no formato esperado
        roleId: user.roleId.toString() // Garantir que roleId seja string
      };
      
      setUser(userData);
      api.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
      await userStorage.save(userData);

      console.log("Login roleId:", userData.roleId);
      
      // Redirecionar com base no roleId
      if (userData.roleId == "3") {
        console.log("Redirecionando para /admin");
        router.push("/admin" as any);
      } else {
        console.log("Redirecionando para /mashguiach");
        router.push("/mashguiach" as any);
      }
    } catch (error) {
      console.error("Erro no login:", error);
      throw new Error("Falha ao autenticar");
    }
  };

  // Registro (Com login automático)
  const register = async ({ name, phone, email, password }: RegisterProps) => {
    try {
      const response = await api.post("/register", {
        name,
        phone,
        email,
        password,
      });
      
      console.log("Resposta do registro:", response.data);
      
      const { user, token } = response.data;
      
      // Verificar se o token está no objeto user como authToken
      const userToken = token || user.authToken;
      
      if (!userToken) {
        throw new Error("Token não encontrado na resposta");
      }

      const userData = { 
        ...user, 
        token: userToken, // Garantir que o token esteja no formato esperado
        roleId: user.roleId.toString() // Garantir que roleId seja string
      };
      
      setUser(userData);
      api.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
      await userStorage.save(userData);

      router.push("/mashguiach");
    } catch (error) {
      console.error("Erro no registro:", error);
      throw error;
    }
  };

  const logout = async () => {
    await userStorage.remove();
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    router.push("/");
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de UserProvider");
  }
  return context;
};
