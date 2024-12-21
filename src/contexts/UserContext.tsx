import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userStorage } from "@/storage/user";

type User = {
  id: string;
  name: string;
  email: string;
};

type UserContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

// Criar o contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provedor do contexto
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Carregar usuário do AsyncStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await userStorage.get();
      if (storedUser) {
        setUser(storedUser);
      }
    };
    loadUser();
  }, []);

  // Função de login que salva o usuário no contexto e AsyncStorage
  const login = (user: User) => {
    setUser(user);
    AsyncStorage.setItem("@planner:userId", JSON.stringify(user));
  };

  // Função de logout (remove o usuário)
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("@planner:userId");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook personalizado para acessar o contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de UserProvider");
  }
  return context;
};
