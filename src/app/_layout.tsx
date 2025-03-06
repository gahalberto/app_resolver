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
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import PermissionsManager from "@/components/PermissionsManager";
import * as Notifications from 'expo-notifications';

// Configuração das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function Layout() {
  const { theme } = useTheme();
  const currentTheme = themes[theme];

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <StatusBar
        barStyle={theme === 'dark' ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <Slot />
    </View>
  );
}

export default function RootLayout() {
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
    <ThemeProvider>
      <UserProvider>
        <PermissionsManager>
          <Layout />
        </PermissionsManager>
      </UserProvider>
    </ThemeProvider>
  );
}
