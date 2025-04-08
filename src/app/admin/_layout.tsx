import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { colors } from "@/styles/colors";
import { UserProvider } from "@/contexts/UserContext";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import {
  Home,
  Calendar,
  Users,
  Building2,
  Clock,
  LogOut,
  Sun,
  Moon,
  CalendarClock,
  Briefcase,
  FileText
} from "lucide-react-native";
import { router } from "expo-router";

function AdminDrawerContent(props: any) {
  const { user, logout } = useUser();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: Home,
      route: "/admin",
    },
    {
      label: "Calendário",
      icon: Calendar,
      route: "/admin/calendar",
    },
    {
      label: "Eventos",
      icon: CalendarClock,
      route: "/admin/events",
    },
    {
      label: "Serviços",
      icon: Briefcase,
      route: "/admin/services",
    },
    {
      label: "Mashguichim",
      icon: Users,
      route: "/admin/mashguichim",
    },
    {
      label: "Relatórios",
      icon: FileText,
      route: "/admin/reports/fixed-job",
    },
    {
      label: "Usuários",
      icon: Users,
      route: "/admin/users",
    },
    {
      label: "Estabelecimentos",
      icon: Building2,
      route: "/admin/establishments",
    },
    {
      label: "Banco de Horas",
      icon: Clock,
      route: "/admin/hour-bank",
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.surfaceLight,
      marginBottom: 8,
    },
    userInfo: {
      marginTop: 8,
    },
    userName: {
      color: currentTheme.text,
      fontSize: 18,
      fontWeight: '600',
    },
    userEmail: {
      color: currentTheme.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },
    roleTag: {
      backgroundColor: currentTheme.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    roleText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '500',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginHorizontal: 8,
      marginVertical: 4,
      borderRadius: 8,
    },
    menuItemActive: {
      backgroundColor: currentTheme.surface,
    },
    menuItemText: {
      marginLeft: 12,
      color: currentTheme.text,
      fontSize: 16,
    },
    menuItemTextActive: {
      color: currentTheme.primary,
      fontWeight: '600',
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: currentTheme.surfaceLight,
    },
    themeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginBottom: 12,
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
    },
    themeButtonText: {
      marginLeft: 12,
      color: currentTheme.primary,
      fontSize: 16,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: currentTheme.error,
      borderRadius: 8,
    },
    logoutText: {
      marginLeft: 12,
      color: '#ffffff',
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleTag}>
              <Text style={styles.roleText}>Administrador</Text>
            </View>
          </View>
        </View>

        {menuItems.map((item, index) => {
          const isActive = props.state.index === index;
          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => router.navigate(item.route as any)}
            >
              <Icon
                size={24}
                color={isActive ? currentTheme.primary : currentTheme.textSecondary}
              />
              <Text
                style={[
                  styles.menuItemText,
                  isActive && styles.menuItemTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.themeButton}
          onPress={toggleTheme}
        >
          {isDarkMode ? (
            <Sun size={24} color={currentTheme.primary} />
          ) : (
            <Moon size={24} color={currentTheme.primary} />
          )}
          <Text style={styles.themeButtonText}>
            {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={24} color="#ffffff" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <Drawer
          drawerContent={(props) => <AdminDrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerStyle: {
              backgroundColor: colors.bkblue[800],
              width: 320,
            },
          }}
        >
          <Drawer.Screen
            name="(tabs)"
            options={{
              drawerLabel: "Dashboard",
              headerShown: false,
            }}
          />
          <Drawer.Screen
            name="calendar"
            options={{
              drawerLabel: "Calendário",
            }}
          />
          <Drawer.Screen
            name="events"
            options={{
              drawerLabel: "Eventos",
            }}
          />
          <Drawer.Screen
            name="mashguichim"
            options={{
              drawerLabel: "Mashguichim",
            }}
          />
          <Drawer.Screen
            name="users"
            options={{
              drawerLabel: "Usuários",
            }}
          />
          <Drawer.Screen
            name="establishments"
            options={{
              drawerLabel: "Estabelecimentos",
            }}
          />
          <Drawer.Screen
            name="hour-bank"
            options={{
              drawerLabel: "Banco de Horas",
            }}
          />
        </Drawer>
      </UserProvider>
    </GestureHandlerRootView>
  );
}