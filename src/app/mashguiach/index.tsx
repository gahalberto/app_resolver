import { useUser } from "@/contexts/UserContext";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { api } from "@/server/api";
import { useState, useEffect } from "react";
import * as Location from 'expo-location';
import { colors } from "@/styles/colors";
import { Header } from "@/components/Header";

export default function HomePage() {
  const { user, isLoading } = useUser();
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasEntryToday, setHasEntryToday] = useState(false);
  const [hasExitToday, setHasExitToday] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    checkUserStatus();
  }, [user]);

  const checkUserStatus = async () => {
    if (!user?.id) return;

    try {
      setIsCheckingStatus(true);
      const [entryResponse, exitResponse] = await Promise.all([
        api.get(`/time-entries?userId=${user.id}&action=check-entrance`),
        api.get(`/time-entries?userId=${user.id}&action=check-exit`)
      ]);

      setHasEntryToday(entryResponse.data);
      setHasExitToday(exitResponse.data);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleRegisterEntry = async () => {
    try {
      setIsRegistering(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Erro', 'Precisamos da sua localização para registrar a entrada');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      await api.post('/time-entries', {
        userId: user?.id,
        type: 'ENTRADA',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      Alert.alert('Sucesso', 'Entrada registrada com sucesso!');
      checkUserStatus();
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.error || 'Não foi possível registrar a entrada'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRegisterExit = async () => {
    try {
      setIsRegistering(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Erro', 'Precisamos da sua localização para registrar a saída');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      await api.post('/time-entries', {
        userId: user?.id,
        type: 'SAIDA',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      Alert.alert('Sucesso', 'Saída registrada com sucesso!');
      checkUserStatus();
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.error || 'Não foi possível registrar a saída'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading || isCheckingStatus) {
    return <ActivityIndicator size="large" color={colors.bkGolden[300]} />;
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-lg">Você não está logado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bkblue-800">
      <Header title="Dashboard" />
      
      <View className="flex-1 items-center justify-center gap-4 p-4">
        <Text className="text-white text-xl mb-8">Bem-vindo, {user.name}!</Text>
        
        {!hasEntryToday && (
          <TouchableOpacity
            onPress={handleRegisterEntry}
            disabled={isRegistering}
            className={`bg-bkGolden-300 py-4 px-8 rounded-lg w-64 items-center ${isRegistering ? 'opacity-50' : ''}`}
          >
            {isRegistering ? (
              <ActivityIndicator color={colors.bkblue[800]} />
            ) : (
              <Text className="text-bkblue-800 font-bold text-lg">
                Registrar Entrada
              </Text>
            )}
          </TouchableOpacity>
        )}

        {hasEntryToday && !hasExitToday && (
          <TouchableOpacity
            onPress={handleRegisterExit}
            disabled={isRegistering}
            className={`bg-bkGolden-300 py-4 px-8 rounded-lg w-64 items-center ${isRegistering ? 'opacity-50' : ''}`}
          >
            {isRegistering ? (
              <ActivityIndicator color={colors.bkblue[800]} />
            ) : (
              <Text className="text-bkblue-800 font-bold text-lg">
                Registrar Saída
              </Text>
            )}
          </TouchableOpacity>
        )}

        {hasEntryToday && hasExitToday && (
          <View className="items-center">
            <Text className="text-white text-lg text-center">
              Você já registrou entrada e saída hoje!
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
