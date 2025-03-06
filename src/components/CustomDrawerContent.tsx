import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import {
  Home,
  BookOpen,
  Calendar,
  Briefcase,
  ClipboardList,
  FileText,
  Files,
  UserCircle,
  LogOut,
  Sun,
  Moon,
} from "lucide-react-native";
import { router } from "expo-router";

export default function CustomDrawerContent(props: any) {
  const { user, logout } = useUser();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.surface,
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
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: currentTheme.surface,
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

  const menuItems = [
    {
      label: "Dashboard",
      icon: Home,
      route: "/mashguiach",
    },
    {
      label: "Cursos",
      icon: BookOpen,
      route: "/mashguiach/courses",
    },
    {
      label: "Calendário de Eventos",
      icon: Calendar,
      route: "/mashguiach/events",
    },
    {
      label: "Freelas Disponíveis",
      icon: Briefcase,
      route: "/mashguiach/available-jobs",
    },
    {
      label: "Relatórios",
      icon: Files,
      route: "/mashguiach/reports",
    },
    {
      label: "Meu Perfil",
      icon: UserCircle,
      route: "/mashguiach/profile",
    },
  ];

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
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
