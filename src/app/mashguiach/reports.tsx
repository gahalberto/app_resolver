import { View, Text, SafeAreaView } from "react-native";
import { Header } from "@/components/Header";

export default function ReportsPage() {
  return (
    <SafeAreaView className="flex-1 bg-bkblue-800">
      <Header title="Relatórios" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl">Relatórios</Text>
        <Text className="text-zinc-400 mt-2">Nenhum relatório disponível</Text>
      </View>
    </SafeAreaView>
  );
} 