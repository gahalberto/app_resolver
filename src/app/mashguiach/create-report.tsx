import { View, Text, SafeAreaView } from "react-native";
import { Header } from "@/components/Header";

export default function CreateReportPage() {
  return (
    <SafeAreaView className="flex-1 bg-bkblue-800">
      <Header title="Criar Relatório" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl">Criar Relatório</Text>
        <Text className="text-zinc-400 mt-2">Formulário para criação de relatórios</Text>
      </View>
    </SafeAreaView>
  );
} 