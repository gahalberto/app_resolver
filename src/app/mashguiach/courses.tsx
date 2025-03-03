import { View, Text, SafeAreaView } from "react-native";
import { Header } from "@/components/Header";

export default function CoursesPage() {
  return (
    <SafeAreaView className="flex-1 bg-bkblue-800">
      <Header title="Cursos" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl">Cursos</Text>
      </View>
    </SafeAreaView>
  );
}
