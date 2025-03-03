import { View, Text, TouchableOpacity } from "react-native";
import { Menu } from "lucide-react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { colors } from "@/styles/colors";

type HeaderProps = {
  title?: string;
};

export function Header({ title }: HeaderProps) {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center px-4 py-4 bg-bkblue-900 border-b border-bkblue-700">
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        className="p-2 -ml-2"
      >
        <Menu size={24} color={colors.bkGolden[300]} />
      </TouchableOpacity>
      
      {title && (
        <Text className="flex-1 text-white text-lg font-medium ml-4">
          {title}
        </Text>
      )}
    </View>
  );
} 