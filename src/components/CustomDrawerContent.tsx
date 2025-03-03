import { useUser } from "@/contexts/UserContext";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { colors } from "@/styles/colors";
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
} from "lucide-react-native";
import { router } from "expo-router";

export default function CustomDrawerContent(props: any) {
  const { user, logout } = useUser();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

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
      label: "Meus Freelas",
      icon: ClipboardList,
      route: "/mashguiach/my-jobs",
    },
    {
      label: "Criar Relatório",
      icon: FileText,
      route: "/mashguiach/create-report",
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
    <View className="flex-1">
      {/* Cabeçalho com Logo e Informações do Usuário */}
      <View className="px-4 pt-8 pb-6 bg-bkblue-900 border-b border-bkblue-700">
        <View className="items-center mb-4">
          <Image
            source={require("@/assets/logo.png")}
            className="w-32 h-32"
            resizeMode="contain"
          />
        </View>
        <View className="mt-2">
          <Text className="text-white text-lg font-bold">{user?.name}</Text>
          <Text className="text-zinc-400 text-sm">{user?.email}</Text>
        </View>
      </View>

      <DrawerContentScrollView {...props} className="flex-1">
        <View className="flex-1 px-2">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route)}
              className={`flex-row items-center px-4 py-3 mb-1 rounded-lg
                ${props.state.index === index ? "bg-bkGolden-300/20" : ""}`}
            >
              <item.icon
                size={20}
                color={
                  props.state.index === index
                    ? colors.bkGolden[300]
                    : colors.zinc[400]
                }
              />
              <Text
                className={`ml-3 text-base
                  ${
                    props.state.index === index
                      ? "text-bkGolden-300 font-medium"
                      : "text-zinc-400"
                  }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* Botão de Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        className="flex-row items-center px-6 py-4 border-t border-bkblue-700"
      >
        <LogOut size={20} color={colors.zinc[400]} />
        <Text className="ml-3 text-zinc-400 text-base">Sair</Text>
      </TouchableOpacity>
    </View>
  );
}
