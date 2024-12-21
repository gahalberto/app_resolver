import { useUser } from "@/contexts/UserContext";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";

export default function HomePage() {
  const { user, logout, isLoading } = useUser();

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (!user) {
    return (
      <View>
        <Text>Você não está logado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView>
      <Text>Bem-vindo, {user.name}!</Text>
      <Button title="Logout" onPress={logout} />
    </SafeAreaView>
  );
}
