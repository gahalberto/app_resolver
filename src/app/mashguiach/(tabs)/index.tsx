import { useUser } from "@/contexts/UserContext";
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "react-native";
import { colors } from "@/styles/colors";
import { Header } from "@/components/Header";

export default function HomePage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <ActivityIndicator size="large" color={colors.bkGolden[300]} />;
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-lg">Você não está logado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bkblue-800" style={{ paddingBottom: Platform.OS === 'ios' ? 20 : 0 }}>
      <Header title="Dashboard" />
      
      <View className="flex-1 p-4">
        <Text className="text-white text-xl mb-8">Bem-vindo, {user.name}!</Text>
        
        {/* Aqui você pode adicionar cards com informações relevantes do dashboard */}
        <View className="bg-bkblue-700 rounded-lg p-4 mb-4">
          <Text className="text-white text-lg font-medium mb-2">Próximos Eventos</Text>
          <Text className="text-zinc-400">Nenhum evento programado</Text>
        </View>

        <View className="bg-bkblue-700 rounded-lg p-4 mb-4">
          <Text className="text-white text-lg font-medium mb-2">Freelas em Andamento</Text>
          <Text className="text-zinc-400">Nenhum freela em andamento</Text>
        </View>

        <View className="bg-bkblue-700 rounded-lg p-4">
          <Text className="text-white text-lg font-medium mb-2">Relatórios Pendentes</Text>
          <Text className="text-zinc-400">Nenhum relatório pendente</Text>
        </View>
      </View>
    </SafeAreaView>
  );
} 