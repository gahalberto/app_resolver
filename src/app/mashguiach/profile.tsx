import { View, Text, SafeAreaView } from "react-native";
import { Header } from "@/components/Header";

export default function ProfilePage() {
  return (
    <SafeAreaView className="flex-1 bg-bkblue-800">
      <Header title="Meu Perfil" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl">Meu Perfil</Text>
      </View>
    </SafeAreaView>
  );
} 