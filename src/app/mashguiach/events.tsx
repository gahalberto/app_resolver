import { View, Text } from "react-native";
import { PageLayout } from "@/components/PageLayout";

export default function EventsPage() {
  return (
    <PageLayout title="Calendário de Eventos">
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl">Calendário de Eventos</Text>
        <Text className="text-zinc-400 mt-2">Nenhum evento programado</Text>
      </View>
    </PageLayout>
  );
} 