import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Platform,
  ScrollView,
  Modal,
  FlatList
} from "react-native";
import { api } from "@/server/api";
import * as Location from 'expo-location';
import { colors } from "@/styles/colors";
import { Header } from "@/components/Header";
import { useUser } from "@/contexts/UserContext";
import { PageLayout } from "@/components/PageLayout";
import { Calendar, Clock, ChevronDown, ChevronLeft, ChevronRight, LogIn, LogOut } from "lucide-react-native";

// Interface para os dados do relatório
interface TimeEntryReport {
  userId: string;
  month: number;
  year: number;
  data: {
    entriesByDay: {
      [date: string]: {
        entrada: string;
        entradaId: number;
        saida?: string;
        saidaId?: number;
      };
    };
    hoursWorkedByDay: {
      [date: string]: number;
    };
    totalHoursWorked: number;
    hourlyRate: number;
    totalAmount: number;
  };
}

export default function TimeRegisterPage() {
  const { user, isLoading } = useUser();
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasEntryToday, setHasEntryToday] = useState(false);
  const [hasExitToday, setHasExitToday] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  
  // Estados para o relatório
  const [activeTab, setActiveTab] = useState<'register' | 'report'>('register');
  const [reportData, setReportData] = useState<TimeEntryReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'report' && user?.id) {
      fetchTimeEntryReport();
    }
  }, [activeTab, selectedMonth, selectedYear, user]);

  const checkUserStatus = async () => {
    if (!user?.id) return;

    try {
      setIsCheckingStatus(true);
      
      // Verificar se o usuário já registrou entrada hoje
      const entryResponse = await api.get('/time-entries', {
        params: { 
          userId: user.id,
          type: 'ENTRADA',
          action: 'check-entrance',
        }
      });
      setHasEntryToday(!!entryResponse.data);

      // Verificar se o usuário já registrou saída hoje
      const exitResponse = await api.get('/time-entries', {
        params: { 
          userId: user.id,
          type: 'SAIDA',
          action: 'check-exit',
        }
      });
      setHasExitToday(!!exitResponse.data);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleRegisterEntry = async () => {
    if (!user) return;
    
    try {
      setIsRegistering(true);
      
      // Solicitar permissão de localização
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da sua localização para registrar o ponto.');
        setIsRegistering(false);
        return;
      }
      
      // Obter localização atual
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Registrar entrada com o formato correto
      await api.post('/time-entries', {
        userId: user.id,
        type: "ENTRADA",
        latitude,
        longitude
      });
      
      setHasEntryToday(true);
      Alert.alert('Sucesso', 'Entrada registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar entrada:', error);
      Alert.alert('Erro', 'Não foi possível registrar sua entrada. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRegisterExit = async () => {
    if (!user) return;
    
    try {
      setIsRegistering(true);
      
      // Solicitar permissão de localização
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da sua localização para registrar o ponto.');
        setIsRegistering(false);
        return;
      }
      
      // Obter localização atual
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Registrar saída com o formato correto
      await api.post('/time-entries', {
        userId: user.id,
        type: "SAIDA",
        latitude,
        longitude
      });
      
      setHasExitToday(true);
      Alert.alert('Sucesso', 'Saída registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      Alert.alert('Erro', 'Não foi possível registrar sua saída. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  const fetchTimeEntryReport = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingReport(true);
      
      const response = await api.get('/time-entries/report', {
        params: {
          userId: user.id,
          month: selectedMonth,
          year: selectedYear
        }
      });
      
      setReportData(response.data);
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      Alert.alert('Erro', 'Não foi possível carregar o relatório. Tente novamente.');
    } finally {
      setIsLoadingReport(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  const renderRegisterTab = () => {
    if (isLoading || isCheckingStatus) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.bkGolden[300]} />
        </View>
      );
    }

    if (!user) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-white text-lg text-center">
            Você precisa estar logado para registrar seu ponto.
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 p-4">
        <View className="items-center mb-8">
          <Text className="text-white text-xl mb-2">Olá, {user.name}</Text>
          <Text className="text-zinc-400 text-center">
            Registre sua entrada e saída diária aqui.
          </Text>
        </View>

        <View className="bg-bkblue-700 rounded-lg p-6 mb-6">
          <Text className="text-white text-lg font-medium mb-4 text-center">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>

          <View className="flex-row justify-around mb-6">
            <View className="items-center">
              <Clock size={24} color={colors.zinc[400]} />
              <Text className="text-zinc-400 mt-1">
                {new Date().toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>

          <View className="space-y-4">
            <TouchableOpacity
              className={`py-3 px-4 rounded-md flex-row items-center justify-center ${
                hasEntryToday 
                  ? 'bg-bkblue-600' 
                  : 'bg-bkGolden-300'
              }`}
              onPress={handleRegisterEntry}
              disabled={isRegistering || hasEntryToday}
            >
              {isRegistering ? (
                <ActivityIndicator size="small" color={hasEntryToday ? colors.zinc[400] : colors.bkblue[900]} />
              ) : (
                <>
                  <LogIn size={20} color={hasEntryToday ? colors.zinc[400] : colors.bkblue[900]} />
                  <Text 
                    className={`ml-2 font-medium ${
                      hasEntryToday 
                        ? 'text-zinc-400' 
                        : 'text-bkblue-900'
                    }`}
                  >
                    {hasEntryToday ? 'Entrada Registrada' : 'Registrar Entrada'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className={`py-3 px-4 rounded-md flex-row items-center justify-center ${
                !hasEntryToday 
                  ? 'bg-bkblue-600' 
                  : hasExitToday 
                    ? 'bg-bkblue-600' 
                    : 'bg-bkGolden-300'
              }`}
              onPress={handleRegisterExit}
              disabled={isRegistering || !hasEntryToday || hasExitToday}
            >
              {isRegistering ? (
                <ActivityIndicator 
                  size="small" 
                  color={!hasEntryToday || hasExitToday ? colors.zinc[400] : colors.bkblue[900]} 
                />
              ) : (
                <>
                  <LogOut 
                    size={20} 
                    color={!hasEntryToday || hasExitToday ? colors.zinc[400] : colors.bkblue[900]} 
                  />
                  <Text 
                    className={`ml-2 font-medium ${
                      !hasEntryToday || hasExitToday 
                        ? 'text-zinc-400' 
                        : 'text-bkblue-900'
                    }`}
                  >
                    {!hasEntryToday 
                      ? 'Registre a entrada primeiro' 
                      : hasExitToday 
                        ? 'Saída Registrada' 
                        : 'Registrar Saída'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-bkblue-700 rounded-lg p-4">
          <Text className="text-white font-medium mb-2">Dicas:</Text>
          <Text className="text-zinc-400 mb-1">• Registre sua entrada ao chegar ao trabalho</Text>
          <Text className="text-zinc-400 mb-1">• Registre sua saída ao terminar o expediente</Text>
          <Text className="text-zinc-400">• Verifique seu relatório mensal na aba Relatório</Text>
        </View>
      </View>
    );
  };

  const renderReportTab = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.bkGolden[300]} />
        </View>
      );
    }

    if (!user) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-white text-lg text-center">
            Você precisa estar logado para visualizar seu relatório.
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 p-4">
        {/* Seletor de mês e ano */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity 
            className="flex-row items-center bg-bkblue-700 py-2 px-4 rounded-md"
            onPress={() => setShowMonthPicker(true)}
          >
            <Text className="text-white mr-2">{getMonthName(selectedMonth)}</Text>
            <ChevronDown size={16} color={colors.zinc[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center bg-bkblue-700 py-2 px-4 rounded-md"
            onPress={() => setShowYearPicker(true)}
          >
            <Text className="text-white mr-2">{selectedYear}</Text>
            <ChevronDown size={16} color={colors.zinc[400]} />
          </TouchableOpacity>
        </View>

        {isLoadingReport ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.bkGolden[300]} />
          </View>
        ) : reportData ? (
          <ScrollView className="flex-1">
            {/* Resumo do mês */}
            <View className="bg-bkblue-700 rounded-lg p-4 mb-4">
              <Text className="text-white text-lg font-medium mb-2">Resumo do Mês</Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-zinc-400">Total de Horas:</Text>
                <Text className="text-white">{reportData.data.totalHoursWorked.toFixed(2)}h</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-zinc-400">Valor por Hora:</Text>
                <Text className="text-white">{formatCurrency(reportData.data.hourlyRate)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-zinc-400">Total a Receber:</Text>
                <Text className="text-bkGolden-300 font-bold">{formatCurrency(reportData.data.totalAmount)}</Text>
              </View>
            </View>

            {/* Lista de registros por dia */}
            <Text className="text-white text-lg font-medium mb-2">Registros Diários</Text>
            
            {Object.keys(reportData.data.entriesByDay).length > 0 ? (
              Object.entries(reportData.data.entriesByDay)
                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                .map(([date, entry]) => (
                  <View key={date} className="bg-bkblue-700 rounded-lg p-4 mb-3">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-white font-medium">{formatDate(date)}</Text>
                      <View className="bg-bkblue-600 px-2 py-1 rounded">
                        <Text className="text-bkGolden-300">
                          {reportData.data.hoursWorkedByDay[date]?.toFixed(2) || 0}h
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <View className="flex-row items-center">
                        <LogIn size={16} color={colors.lime[300]} />
                        <Text className="text-zinc-300 ml-1">
                          Entrada: {entry.entrada ? formatTime(entry.entrada) : 'N/A'}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <LogOut size={16} color={colors.zinc[400]} />
                        <Text className="text-zinc-300 ml-1">
                          Saída: {entry.saida ? formatTime(entry.saida) : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
            ) : (
              <View className="bg-bkblue-700 rounded-lg p-4 items-center">
                <Text className="text-zinc-400">Nenhum registro encontrado para este período</Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-zinc-400 text-center mb-4">
              Nenhum dado disponível para o período selecionado
            </Text>
            <TouchableOpacity 
              className="bg-bkGolden-300 px-4 py-2 rounded-md"
              onPress={fetchTimeEntryReport}
            >
              <Text className="text-bkblue-900 font-medium">Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modal para seleção de mês */}
        <Modal
          visible={showMonthPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMonthPicker(false)}
        >
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            activeOpacity={1}
            onPress={() => setShowMonthPicker(false)}
          >
            <View className="bg-bkblue-800 m-4 rounded-lg p-4" style={{ marginTop: 100 }}>
              <Text className="text-white text-lg font-medium mb-4 text-center">Selecione o Mês</Text>
              <FlatList
                data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`p-3 rounded-md mb-2 ${selectedMonth === item ? 'bg-bkGolden-300' : 'bg-bkblue-700'}`}
                    onPress={() => {
                      setSelectedMonth(item);
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text 
                      className={`text-center font-medium ${selectedMonth === item ? 'text-bkblue-900' : 'text-white'}`}
                    >
                      {getMonthName(item)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal para seleção de ano */}
        <Modal
          visible={showYearPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowYearPicker(false)}
        >
          <TouchableOpacity 
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            activeOpacity={1}
            onPress={() => setShowYearPicker(false)}
          >
            <View className="bg-bkblue-800 m-4 rounded-lg p-4" style={{ marginTop: 100 }}>
              <Text className="text-white text-lg font-medium mb-4 text-center">Selecione o Ano</Text>
              <FlatList
                data={Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`p-3 rounded-md mb-2 ${selectedYear === item ? 'bg-bkGolden-300' : 'bg-bkblue-700'}`}
                    onPress={() => {
                      setSelectedYear(item);
                      setShowYearPicker(false);
                    }}
                  >
                    <Text 
                      className={`text-center font-medium ${selectedYear === item ? 'text-bkblue-900' : 'text-white'}`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  return (
    <PageLayout title="Registro de Ponto">
      {/* Tabs */}
      <View className="flex-row border-b border-bkblue-700 mb-4">
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === 'register' ? 'border-b-2 border-bkGolden-300' : ''}`}
          onPress={() => setActiveTab('register')}
        >
          <Text 
            className={`text-center font-medium ${
              activeTab === 'register' ? 'text-bkGolden-300' : 'text-zinc-400'
            }`}
          >
            Registrar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === 'report' ? 'border-b-2 border-bkGolden-300' : ''}`}
          onPress={() => setActiveTab('report')}
        >
          <Text 
            className={`text-center font-medium ${
              activeTab === 'report' ? 'text-bkGolden-300' : 'text-zinc-400'
            }`}
          >
            Relatório
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'register' ? renderRegisterTab() : renderReportTab()}
    </PageLayout>
  );
} 