import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { colors } from "@/styles/colors";
import { UserProvider } from "@/contexts/UserContext";
import CustomDrawerContent from "@/components/CustomDrawerContent";

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
          <Drawer.Screen
            name="(tabs)"
            options={{
              drawerLabel: "Principal",
              headerShown: false,
            }}
          />
          <Drawer.Screen
            name="courses"
            options={{
              drawerLabel: "Cursos",
            }}
          />
          <Drawer.Screen
            name="events"
            options={{
              drawerLabel: "Calendário de Eventos",
            }}
          />
          <Drawer.Screen
            name="available-jobs"
            options={{
              drawerLabel: "Freelas Disponíveis",
            }}
          />
          <Drawer.Screen
            name="my-jobs"
            options={{
              drawerLabel: "Meus Freelas",
            }}
          />
          <Drawer.Screen
            name="create-report"
            options={{
              drawerLabel: "Criar Relatório",
            }}
          />
          <Drawer.Screen
            name="reports"
            options={{
              drawerLabel: "Relatórios",
            }}
          />
          <Drawer.Screen
            name="fixed-job-report"
            options={{
              drawerLabel: "Relatório de Trabalho Fixo",
            }}
          />
        </Drawer>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
