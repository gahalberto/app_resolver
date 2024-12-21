import { Button } from "@/components/button";
import { useUser } from "@/contexts/UserContext";
import { userStorage } from "@/storage/user";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function Dashboard() {
  const user = useUser();

  function handleLogout() {
    userStorage.remove();
    router.back();
  }

  return (
    <View>
      <Text>Bem-vindo ao Dashboard Sr. {user.user?.email}</Text>
      <Button onPress={handleLogout}>
        <Button.Title>Fazer logout</Button.Title>
      </Button>
    </View>
  );
}
