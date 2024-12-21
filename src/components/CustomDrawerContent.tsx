import { useUser } from "@/contexts/UserContext";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";

export default function CustomDrawerContent(props: any) {
  const { logout } = useUser();
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label={"Logout"} onPress={logout} />
    </DrawerContentScrollView>
  );
}
