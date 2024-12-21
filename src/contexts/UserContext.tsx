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
  token: string;
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
        setUser(storedUser);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedUser.token}`;
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/login", { email, password });
      const { user, token } = response.data;

      const userData = { ...user, token };
      setUser(userData);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await userStorage.save(userData);

      router.push("/mashguiach");
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

      const { user, token } = response.data;

      const userData = { ...user, token };
      setUser(userData);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
