import { View, Text, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react-native";
import { format, isSameMonth, parseISO, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from '@/server/api';
import { themes } from "@/styles/themes";

interface Mashguiach {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface StoreEvents {
  id: string;
  title: string;
  responsable: string;
  date: string;
  clientName: string;
  eventType: string;
  serviceType: string;
  responsableTelephone: string;
}

interface Service {
  id: string;
  arriveMashguiachTime: string;
  endMashguiachTime: string;
  isApproved: boolean;
  mashguiachPrice: number;
  observationText: string;
  accepted: boolean;
  paymentStatus: string;
  mashguiachPricePerHour: number;
  transport_price: number;
  address_zipcode: string;
  address_street: string;
  address_number: string;
  address_neighbor: string;
  address_city: string;
  address_state: string;
  workType: string;
  Mashguiach: Mashguiach;
  StoreEvents: StoreEvents;
}

interface ApiResponse {
  services: Service[];
}

export default function MyJobsPage() {
  const { isDarkMode, theme } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchServices = async () => {
    try {
      setLoading(true);
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      
      let params: any = { user_id: user?.id };
      
      // Adiciona mês e ano se não for o mês atual
      const currentDate = new Date();
      if (month !== currentDate.getMonth() + 1 || year !== currentDate.getFullYear()) {
        params.month = month;
        params.year = year;
      }
      
      console.log('Fetching services with params:', params);
      const response = await api.get<ApiResponse>('/getAllUserServices', { params });
      console.log('API Response:', response.data);
      
      // Filtra os serviços pelo mês selecionado
      const filteredServices = response.data.services.filter(service => {
        const serviceDate = parseISO(service.arriveMashguiachTime);
        const isSameMonthResult = isSameMonth(serviceDate, selectedDate);
        console.log('Service Date:', serviceDate);
        console.log('Selected Date:', selectedDate);
        console.log('Is Same Month:', isSameMonthResult);
        return isSameMonthResult;
      });

      console.log('Filtered Services:', filteredServices);
      
      setServices(filteredServices);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchServices();
    }
  }, [selectedDate, user]);

  const handlePreviousMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      console.log('Previous Month:', newDate);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      console.log('Next Month:', newDate);
      return newDate;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#22c55e';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#28344c' : '#fff' }}>
      <Header title="Meus Freelas Confirmados" />
      
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handlePreviousMonth} className="p-2">
            <ChevronLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          
          <View className="flex-row items-center">
            <Calendar size={20} color={isDarkMode ? '#fff' : '#000'} className="mr-2" />
            <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </Text>
          </View>
          
          <TouchableOpacity onPress={handleNextMonth} className="p-2">
            <ChevronRight size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
          </View>
        ) : services.length === 0 ? (
          <View className="flex-1 items-center justify-center p-4">
            <Text className={`text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Nenhum serviço encontrado para este mês
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1">
            {services.map((service) => {
              console.log('Rendering service:', service);
              return (
                <View
                  key={service.id}
                  className={`mb-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-bkblue-700' : 'bg-gray-100'
                  }`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {service.StoreEvents?.title || 'Sem título'}
                    </Text>
                    <View
                      style={{ backgroundColor: getStatusColor(service.paymentStatus) }}
                      className="px-2 py-1 rounded-full"
                    >
                      <Text className="text-white text-xs font-medium">
                        {getStatusText(service.paymentStatus)}
                      </Text>
                    </View>
                  </View>

                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <Calendar size={16} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                      <Text className={`ml-2 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {formatDate(service.arriveMashguiachTime)}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Text className={`${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        Horário: {formatTime(service.arriveMashguiachTime)} - {formatTime(service.endMashguiachTime)}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Text className={`${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        Local: {service.address_street}, {service.address_number} - {service.address_neighbor}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Text className={`${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        Responsável: {service.StoreEvents?.responsable || 'Não informado'}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        Valor: {formatCurrency(service.mashguiachPrice)}
                      </Text>
                    </View>

                    {service.observationText && (
                      <View className="mt-2">
                        <Text className={`${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          Observações: {service.observationText}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
} 