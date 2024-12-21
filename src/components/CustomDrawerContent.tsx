import { useUser } from "@/contexts/UserContext";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Text, View } from "react-native";

export default function CustomDrawerContent(props: any) {
  const { logout } = useUser();
  return (
    <View className="flex-1">
      <DrawerContentScrollView {...props} scrollEnabled={false}>
        <DrawerItemList {...props} />
        <DrawerItem label={() => <Text>Sair</Text>} onPress={logout} />
      </DrawerContentScrollView>
    </View>
  );
}
