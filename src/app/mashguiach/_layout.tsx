import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { colors } from "@/styles/colors";
import CustomDrawerContent from "@/components/CustomDrawerContent";
import { UserProvider } from "@/contexts/UserContext";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerStyle: {
              backgroundColor: colors.bkblue[800],
              width: 320,
            },
          }}
        >
          <Drawer.Screen name="index" />
          <Drawer.Screen name="courses" />
          <Drawer.Screen name="events" />
          <Drawer.Screen name="available-jobs" />
          <Drawer.Screen name="my-jobs" />
          <Drawer.Screen name="create-report" />
          <Drawer.Screen name="reports" />
          <Drawer.Screen name="profile" />
        </Drawer>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
