import { View, Text, SafeAreaView } from "react-native";
import { Header } from "@/components/Header";

export default function MyJobsPage() {
  return (
    <SafeAreaView className="flex-1 bg-bkblue-800">
      <Header title="Meus Freelas" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl">Meus Freelas</Text>
      </View>
    </SafeAreaView>
  );
} 