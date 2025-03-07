import { Tabs } from "expo-router";
import { colors } from "@/styles/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Home, BarChart3, PieChart, TrendingUp } from "lucide-react-native";

export default function TabsLayout() {
  const { theme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: currentTheme.background,
          borderTopColor: currentTheme.surface,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: currentTheme.primary,
        tabBarInactiveTintColor: currentTheme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Análises",
          tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Relatórios",
          tabBarIcon: ({ color }) => <PieChart size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finanças",
          tabBarIcon: ({ color }) => <TrendingUp size={22} color={color} />,
        }}
      />
    </Tabs>
  );
} 