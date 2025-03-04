import { Tabs } from "expo-router/tabs";
import { colors } from "@/styles/colors";
import { Home, Timer, UserCircle } from "lucide-react-native";
import { Text, Platform } from "react-native";

export default function TabsLayout() {
  // Adiciona mais espaço na parte inferior para iPhones com notch/home indicator
  const bottomTabHeight = Platform.OS === 'ios' ? 80 : 60;
  const bottomPadding = Platform.OS === 'ios' ? 20 : 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bkblue[900],
          borderTopColor: colors.bkblue[700],
          height: bottomTabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.bkGolden[300],
        tabBarInactiveTintColor: colors.zinc[400],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Dashboard</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="time-register"
        options={{
          title: "Ponto",
          tabBarIcon: ({ color, size }) => (
            <Timer size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Ponto</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <UserCircle size={size} color={color} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 12 }}>Perfil</Text>
          ),
        }}
      />
    </Tabs>
  );
} 