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
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [timeEntryStatus, setTimeEntryStatus] = useState<any>(null);
  
  // Estados para o relatório
  const [activeTab, setActiveTab] = useState<'register' | 'report'>('register');
  const [reportData, setReportData] = useState<TimeEntryReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkUserStatus();
    }
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
      console.log('Verificando status do usuário:', user.id);
      
      // Adicionar timestamp para evitar cache (304 Not Modified)
      const timestamp = new Date().getTime();
      
      const response = await api.get('/time-entries', {
        params: { 
          userId: user.id,
          _t: timestamp // Parâmetro para evitar cache
        }
      });
      
      console.log('Resposta do status do usuário:', response.data);
      setTimeEntryStatus(response.data);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Verifica se a entrada aberta é de um dia diferente
  const isEntryFromDifferentDay = () => {
    if (!timeEntryStatus || !timeEntryStatus.lastEntry || !timeEntryStatus.lastEntry.entrace) {
      return false;
    }

    const entryDate = new Date(timeEntryStatus.lastEntry.entrace);
    const today = new Date();
    
    return entryDate.getDate() !== today.getDate() || 
           entryDate.getMonth() !== today.getMonth() || 
           entryDate.getFullYear() !== today.getFullYear();
  };

  const handleRegisterEntry = async () => {
    if (!user) return;
    
    try {
      setIsRegistering(true);
      console.log('Registrando entrada para trabalho fixo');
      
      // Verificar se existe uma entrada aberta de um dia diferente
      const hasPreviousDayOpenEntry = isEntryFromDifferentDay() && timeEntryStatus?.status?.hasOpenEntry;
      
      // Se existir uma entrada aberta de dia anterior, fechar antes
      if (hasPreviousDayOpenEntry) {
        console.log('Fechando entrada anterior não finalizada do dia', 
          new Date(timeEntryStatus?.lastEntry?.entrace).toLocaleDateString('pt-BR'));
        
        const timestamp = new Date().getTime();
        
        // Registrar saída automática para a entrada anterior
        const closeResponse = await api.post('/time-entries', {
          userId: user.id,
          type: "SAIDA",
          autoClose: true, // Flag para indicar fechamento automático
          _t: timestamp
        });
        
        console.log('Resposta do fechamento automático:', closeResponse.data);
      }
      
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
      console.log('Localização obtida:', { latitude, longitude });
      
      // Adicionar timestamp para evitar cache (304 Not Modified)
      const timestamp = new Date().getTime();
      
      // Registrar entrada
      const response = await api.post('/time-entries', {
        userId: user.id,
        type: "ENTRADA",
        latitude,
        longitude,
        _t: timestamp // Parâmetro para evitar cache
      });
      
      console.log('Resposta do registro de entrada:', response.data);
      
      await checkUserStatus();
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
      console.log('Registrando saída para trabalho fixo');
      
      // Adicionar timestamp para evitar cache (304 Not Modified)
      const timestamp = new Date().getTime();
      
      // Registrar saída
      const response = await api.post('/time-entries', {
        userId: user.id,
        type: "SAIDA",
        _t: timestamp // Parâmetro para evitar cache
      });
      
      console.log('Resposta do registro de saída:', response.data);
      
      await checkUserStatus();
      Alert.alert('Sucesso', 'Saída registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      Alert.alert('Erro', 'Não foi possível registrar sua saída. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRegisterLunchEntry = async () => {
    if (!user) return;
    
    try {
      setIsRegistering(true);
      console.log('Registrando entrada do almoço');
      
      // Adicionar timestamp para evitar cache (304 Not Modified)
      const timestamp = new Date().getTime();
      
      const response = await api.post('/time-entries', {
        userId: user.id,
        type: "ALMOCO_ENTRADA",
        _t: timestamp // Parâmetro para evitar cache
      });
      
      console.log('Resposta do registro de entrada do almoço:', response.data);
      
      await checkUserStatus();
      Alert.alert('Sucesso', 'Entrada do almoço registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar entrada do almoço:', error);
      Alert.alert('Erro', 'Não foi possível registrar sua entrada do almoço. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRegisterLunchExit = async () => {
    if (!user) return;
    
    try {
      setIsRegistering(true);
      console.log('Registrando saída do almoço');
      
      // Adicionar timestamp para evitar cache (304 Not Modified)
      const timestamp = new Date().getTime();
      
      const response = await api.post('/time-entries', {
        userId: user.id,
        type: "ALMOCO_SAIDA",
        _t: timestamp // Parâmetro para evitar cache
      });
      
      console.log('Resposta do registro de saída do almoço:', response.data);
      
      await checkUserStatus();
      Alert.alert('Sucesso', 'Saída do almoço registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar saída do almoço:', error);
      Alert.alert('Erro', 'Não foi possível registrar sua saída do almoço. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  const fetchTimeEntryReport = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingReport(true);
      console.log('Buscando relatório de ponto para:', {
        user_id: user.id,
        month: selectedMonth,
        year: selectedYear
      });
      
      // Adicionar timestamp para evitar cache (304 Not Modified)
      const timestamp = new Date().getTime();
      
      const response = await api.get('/time-entries/report', {
        params: {
          user_id: user.id,
          month: selectedMonth,
          year: selectedYear,
          _t: timestamp // Parâmetro para evitar cache
        }
      });
      
      console.log('Resposta do relatório:', JSON.stringify(response.data, null, 2));
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
      console.log('Renderizando estado de carregamento');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.bkGolden[300]} />
        </View>
      );
    }

    if (!user) {
      console.log('Renderizando estado de não logado');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
            Você precisa estar logado para registrar seu ponto.
          </Text>
        </View>
      );
    }

    // Obter status do usuário
    let hasOpenEntry = false;
    let isOnLunch = false;
    let hasEntryFromDifferentDay = false;
    
    if (timeEntryStatus && timeEntryStatus.status) {
      hasOpenEntry = timeEntryStatus.status.hasOpenEntry || false;
      isOnLunch = timeEntryStatus.status.isOnLunch || false;
      hasEntryFromDifferentDay = isEntryFromDifferentDay();
    }
    
    console.log('Status do registro de ponto:', { hasOpenEntry, isOnLunch, hasEntryFromDifferentDay });

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View className="items-center mb-8">
          <Text className="text-white text-xl mb-2">Olá, {user.name}</Text>
          <Text className="text-zinc-400 text-center">Registre seu check-in e check-out diário aqui</Text>
          
          {/* Botão de atualização manual */}
          <TouchableOpacity 
            className="bg-bkGolden-300 py-2 px-4 rounded mt-4 flex-row items-center"
            onPress={checkUserStatus}
            disabled={isCheckingStatus}
          >
            {isCheckingStatus ? (
              <ActivityIndicator size="small" color="#232c59" />
            ) : (
              <Text className="text-bkblue-900 font-medium">Atualizar Status</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="bg-bkblue-800 rounded-lg p-4 mb-4">
          <Text className="text-white text-lg font-medium mb-4 text-center">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>

          <TouchableOpacity 
            className={`flex-row items-center justify-center bg-bkGolden-300 p-3 rounded-md mb-3 ${hasOpenEntry && !hasEntryFromDifferentDay ? 'opacity-50' : ''}`}
            onPress={handleRegisterEntry}
            disabled={isRegistering || (hasOpenEntry && !hasEntryFromDifferentDay)}
          >
            {isRegistering ? (
              <ActivityIndicator size="small" color="#232c59" />
            ) : (
              <>
                <LogIn size={20} color="#232c59" />
                <Text className="text-bkblue-900 font-medium ml-2">
                  {hasOpenEntry && !hasEntryFromDifferentDay ? 
                    'Entrada Registrada' : 
                    hasEntryFromDifferentDay ? 
                    'Registrar Nova Entrada (Dia Diferente)' : 
                    'Registrar Entrada'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className={`flex-row items-center justify-center bg-bkGolden-300 p-3 rounded-md mb-3 ${!hasOpenEntry || isOnLunch ? 'opacity-50' : ''}`}
            onPress={handleRegisterLunchEntry}
            disabled={isRegistering || !hasOpenEntry || isOnLunch}
          >
            {isRegistering ? (
              <ActivityIndicator size="small" color="#232c59" />
            ) : (
              <>
                <Clock size={20} color="#232c59" />
                <Text className="text-bkblue-900 font-medium ml-2">
                  {!hasOpenEntry 
                    ? 'Registre a entrada primeiro' 
                    : isOnLunch 
                      ? 'Almoço em andamento' 
                      : 'Registrar Entrada do Almoço'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className={`flex-row items-center justify-center bg-bkGolden-300 p-3 rounded-md mb-3 ${!isOnLunch ? 'opacity-50' : ''}`}
            onPress={handleRegisterLunchExit}
            disabled={isRegistering || !isOnLunch}
          >
            {isRegistering ? (
              <ActivityIndicator size="small" color="#232c59" />
            ) : (
              <>
                <Clock size={20} color="#232c59" />
                <Text className="text-bkblue-900 font-medium ml-2">
                  {!isOnLunch ? 'Não está em horário de almoço' : 'Registrar Saída do Almoço'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className={`flex-row items-center justify-center bg-bkGolden-300 p-3 rounded-md ${!hasOpenEntry ? 'opacity-50' : ''}`}
            onPress={handleRegisterExit}
            disabled={isRegistering || !hasOpenEntry}
          >
            {isRegistering ? (
              <ActivityIndicator size="small" color="#232c59" />
            ) : (
              <>
                <LogOut size={20} color="#232c59" />
                <Text className="text-bkblue-900 font-medium ml-2">
                  {!hasOpenEntry ? 'Registre a entrada primeiro' : 'Registrar Saída'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="bg-bkblue-800 rounded-lg p-4">
          <Text className="text-white text-lg font-medium mb-2">Informações</Text>
          <Text className="text-zinc-400">• Registre sua entrada ao chegar ao trabalho</Text>
          <Text className="text-zinc-400">• Registre sua saída ao terminar o expediente</Text>
          <Text className="text-zinc-400">• Verifique seu relatório mensal na aba Relatório</Text>
        </View>
      </ScrollView>
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
        
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}
      </View>
      
      {activeTab === 'register' ? renderRegisterTab() : renderReportTab()}
    </PageLayout>
  );
} 