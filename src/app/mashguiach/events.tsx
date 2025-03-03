import { View, Text, SafeAreaView } from "react-native";
import { Header } from "@/components/Header";

export default function EventsPage() {
  return (
    <SafeAreaView className="flex-1 bg-bkblue-800">
      <Header title="Calendário de Eventos" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl">Calendário de Eventos</Text>
      </View>
    </SafeAreaView>
  );
} 