import { View, Text, SafeAreaView } from "react-native";
import { Header } from "@/components/Header";

export default function MyJobsPage() {
  return (
    <SafeAreaView className="flex-1 bg-bkblue-800">
      <Header title="Meus Freelas" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl">Meus Freelas</Text>
        <Text className="text-zinc-400 mt-2">Você não possui freelas em andamento</Text>
      </View>
    </SafeAreaView>
  );
} 