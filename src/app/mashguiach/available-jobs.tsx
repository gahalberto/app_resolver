import { View, Text, SafeAreaView } from "react-native";
import { Header } from "@/components/Header";

export default function AvailableJobsPage() {
  return (
    <SafeAreaView className="flex-1 bg-bkblue-800">
      <Header title="Freelas Disponíveis" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl">Freelas Disponíveis</Text>
      </View>
    </SafeAreaView>
  );
} 