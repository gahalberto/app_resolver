import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { Slot } from "expo-router";
import { UserProvider } from "@/contexts/UserContext";
import { View } from "react-native";
import { Home, IceCream } from "lucide-react-native";
import { colors } from "@/styles/colors";
import CustomDrawerContent from "@/components/CustomDrawerContent";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={CustomDrawerContent}
        screenOptions={{
          drawerActiveBackgroundColor: colors.bkblue[600],
          drawerActiveTintColor: colors.bkblue[700],
          drawerInactiveTintColor: colors.bkGolden[100],
          drawerInactiveBackgroundColor: colors.bkblue[700],
          drawerLabelStyle: {
            fontSize: 16,
          },
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: colors.bkblue[700],
          },
          headerTintColor: colors.bkblue[100],
          headerTitleStyle: {
            fontWeight: "bold",
          },

          drawerContentStyle: {
            backgroundColor: colors.bkblue[800],
          },
          drawerStyle: {
            backgroundColor: colors.bkblue[800],
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Início",
            headerTitle: "Dashboard",
            title: "Dashboard",
            drawerIcon: () => <Home size={24} />,
          }}
        />
        <Drawer.Screen
          name="courses"
          options={{
            title: "Cursos",
          }}
        />

        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "Tabs",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
