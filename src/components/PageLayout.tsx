import { SafeAreaView, Platform, View } from "react-native";
import { Header } from "./Header";
import { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <SafeAreaView 
      className="flex-1 bg-bkblue-800" 
      style={{ paddingBottom: Platform.OS === 'ios' ? 20 : 0 }}
    >
      <Header title={title} />
      <View className="flex-1">
        {children}
      </View>
    </SafeAreaView>
  );
} 