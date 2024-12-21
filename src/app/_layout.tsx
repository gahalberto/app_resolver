import "@/styles/global.css";
import "@/utils/dayjsLocaleConfig";

// Dourado = #ba9a5f
// Azul = #232c59

import { Slot } from "expo-router";
import { View, StatusBar } from "react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Loading } from "@/components/loading";
import { UserProvider } from "@/contexts/UserContext";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return <Loading />;
  }

  return (
    <UserProvider>
      <View className="flex-1 bg-bkblue-800">
        <StatusBar
          barStyle={"light-content"}
          backgroundColor={"transparent"}
          translucent
        />
        <Slot />
      </View>
    </UserProvider>
  );
}
