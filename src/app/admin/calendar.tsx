import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  FlatList,
  Modal,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Header } from "@/components/Header";
import { useUser } from "@/contexts/UserContext";
import { api } from "@/server/api";
import { Calendar as CalendarComponent, LocaleConfig } from 'react-native-calendars';
import { format, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { router } from "expo-router";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User,
  Building,
  Phone,
  X,
  Tag
} from "lucide-react-native";

// Configuração do locale para o calendário
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul.', 'Ago', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

// Interface para o Mashguiach
interface Mashguiach {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Interface para o estabelecimento/buffet
interface Store {
  id: string;
  title: string;
  userId: string;
  isMashguiach: boolean;
  mashguiachId: string;
  storeTypeId: string;
  isAutomated: boolean;
  address_zipcode: string;
  address_street: string;
  address_number: string;
  address_neighbor: string;
  address_city: string;
  address_state: string;
  comercialPhone: string;
  phone: string;
  imageUrl: string;
  menuUrl: string;
}

// Interface para o dono do evento
interface EventOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Interface para o serviço do evento
interface EventService {
  id: string;
  StoreEventsId: string;
  arriveMashguiachTime: string;
  endMashguiachTime: string;
  isApproved: boolean;
  mashguiachId: string | null;
  mashguiachPrice: number;
  observationText: string;
  accepted: boolean;
  responseDate: string | null;
  StoreId: string;
  paymentStatus: string;
  reallyMashguiachArrive: string | null;
  reallyMashguiachEndTime: string | null;
  workType: string;
  address_city: string;
  address_state: string;
  address_zipcode: string;
  address_street: string;
  address_number: string;
  address_neighbor: string;
  transport_price: number;
  mashguiachPricePerHour: number;
  Mashguiach?: Mashguiach;
  StoreEvents?: EventData;
  latitude?: string | null;
  longitude?: string | null;
}

// Interface para os dados do evento que vêm dentro do serviço
interface EventData {
  id: string;
  title: string;
  ownerId: string;
  responsable: string;
  date: string;
  nrPax: number;
  clientName: string;
  eventType: string;
  serviceType: string;
  isApproved: boolean;
  storeId: string;
  responsableTelephone: string;
  store?: Store;
  address_city?: string;
  address_state?: string;
  address_neighbor?: string;
  address_number?: string;
  address_street?: string;
  address_zicode?: string;
  menuUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

// Interface para o evento completo
interface Event {
  id: string;
  title: string;
  ownerId: string;
  responsable: string;
  date: string;
  nrPax: number;
  clientName: string;
  eventType: string;
  serviceType: string;
  isApproved: boolean;
  storeId: string;
  responsableTelephone: string;
  EventsServices: EventService[];
  store: Store;
  eventOwner: EventOwner;
  address_city: string;
  address_state: string;
  address_neighbor: string;
  address_number: string;
  address_street: string;
  address_zipcode: string;
  menuUrl: string;
  StoreEvents?: EventData;
}

// Interface para a resposta da API
interface EventsResponse {
  success: boolean;
  events: any[]; // Pode ser Event[] ou EventService[] dependendo da API
  totalCount: number;
  hasMore: boolean;
  message?: string;
}

// Interface para as datas marcadas no calendário
interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

export default function AdminCalendarPage() {
  const { theme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthLoading, setMonthLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<Event[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchEvents();
  }, []);
  
  useEffect(() => {
    filterEventsForSelectedDate();
  }, [selectedDateStr, events]);
  
  useEffect(() => {
      updateMarkedDates();
  }, [events, selectedDateStr]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await fetchEvents();
    } catch (error) {
      console.error("Erro ao atualizar eventos:", error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obter o mês e ano atual para a consulta
      const currentDate = selectedDate || new Date();
      const month = currentDate.getMonth() + 1; // JavaScript meses são 0-11, API espera 1-12
      const year = currentDate.getFullYear();
      
      // Usar a função específica para buscar eventos por mês e ano
      await fetchEventsForMonth(month, year);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      setError("Falha ao carregar eventos. Tente novamente.");
      setEvents([]);
    }
  };
  
  const updateMarkedDates = () => {
    console.log("Atualizando datas marcadas...");
    const marked: MarkedDates = {};
    
    if (!events || events.length === 0) {
      console.log("Nenhum evento para marcar no calendário");
      setMarkedDates({});
      return;
    }
    
    console.log(`Processando ${events.length} eventos para marcar no calendário`);
    
    // Marcar todos os dias que têm eventos baseado nos serviços
    events.forEach(event => {
      try {
        // Verificar se o evento tem uma data válida
        if (!event.date) {
          console.log(`Evento ${event.title} não tem data definida`);
          return; // Pular este evento
        }
        
      // Para cada evento, verificar todos os serviços
      if (event.EventsServices && event.EventsServices.length > 0) {
        event.EventsServices.forEach(service => {
          if (service.arriveMashguiachTime) {
              try {
            const date = format(parseISO(service.arriveMashguiachTime), 'yyyy-MM-dd');
            
            if (!marked[date]) {
              marked[date] = {
                marked: true,
                dotColor: currentTheme.primary,
              };
                }
                console.log(`Marcando data de serviço: ${date} para evento ${event.title}`);
              } catch (error) {
                console.error(`Erro ao processar data de serviço: ${service.arriveMashguiachTime}`, error);
            }
          }
        });
        } 
        
        // Sempre marcar a data principal do evento, mesmo que tenha serviços
        try {
          // Verificar se a data é válida antes de tentar parseá-la
          if (event.date && typeof event.date === 'string') {
            const date = format(parseISO(event.date), 'yyyy-MM-dd');
        
        if (!marked[date]) {
          marked[date] = {
            marked: true,
            dotColor: currentTheme.primary,
          };
        }
            console.log(`Marcando data principal: ${date} para evento ${event.title}`);
          } else {
            console.warn(`Evento ${event.title} tem data inválida: ${event.date}`);
          }
        } catch (error) {
          console.error(`Erro ao processar data principal: ${event.date}`, error);
        }
      } catch (error) {
        console.error("Erro ao processar evento para calendário:", error);
      }
    });
    
    // Se houver uma data selecionada, marcar como selecionada
    if (selectedDateStr) {
      marked[selectedDateStr] = {
        ...marked[selectedDateStr],
        selected: true,
        selectedColor: currentTheme.primary,
      };
    }
    
    console.log(`Total de datas marcadas: ${Object.keys(marked).length}`);
    setMarkedDates(marked);
  };
  
  const filterEventsForSelectedDate = () => {
    if (!selectedDateStr) {
      console.log("Nenhuma data selecionada para filtrar eventos");
      setEventsForSelectedDate([]);
      return;
    }
    
    console.log(`Filtrando eventos para a data: ${selectedDateStr}`);
    const selectedDateObj = parseISO(selectedDateStr);
    
    // Filtrar eventos que têm serviços na data selecionada
    const filteredEvents = events.filter(event => {
      try {
        // Verificar se o evento tem uma data válida
        if (!event.date) {
          return false;
        }
        
      // Verificar se o evento tem serviços na data selecionada
      if (event.EventsServices && event.EventsServices.length > 0) {
          const hasServiceOnDate = event.EventsServices.some(service => {
            try {
          if (service.arriveMashguiachTime) {
            const serviceDate = parseISO(service.arriveMashguiachTime);
                const isSame = isSameDay(serviceDate, selectedDateObj);
                if (isSame) {
                  console.log(`Evento ${event.title} tem serviço na data selecionada`);
                }
                return isSame;
              }
              return false;
            } catch (error) {
              console.error(`Erro ao verificar data de serviço: ${service.arriveMashguiachTime}`, error);
              return false;
            }
          });
          
          if (hasServiceOnDate) return true;
        }
        
        // Se não tiver serviços ou nenhum serviço na data, verificar a data principal do evento
        try {
          // Verificar se a data é válida antes de tentar parseá-la
          if (event.date && typeof event.date === 'string') {
            const eventDate = parseISO(event.date);
            const isSame = isSameDay(eventDate, selectedDateObj);
            if (isSame) {
              console.log(`Evento ${event.title} ocorre na data selecionada`);
            }
            return isSame;
          }
          return false;
        } catch (error) {
          console.error(`Erro ao verificar data principal: ${event.date}`, error);
          return false;
        }
      } catch (error) {
        console.error("Erro ao filtrar evento:", error);
        return false;
      }
    });
    
    console.log(`Encontrados ${filteredEvents.length} eventos para a data selecionada`);
    setEventsForSelectedDate(filteredEvents);
  };
  
  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDateStr(day.dateString);
    setSelectedDate(parseISO(day.dateString));
  };
  
  const openEventDetails = (event: Event) => {
    router.push(`/admin/events/${event.id}` as any);
  };
  
  const formatDate = (dateString: string | undefined) => {
    try {
      if (!dateString) {
        return 'Data não informada';
      }
      const date = parseISO(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error(`Erro ao formatar data: ${dateString}`, error);
      return 'Data inválida';
    }
  };
  
  const formatTime = (dateString: string | undefined) => {
    try {
      if (!dateString) {
        return '';
      }
      const date = parseISO(dateString);
      return format(date, "HH:mm", { locale: ptBR });
    } catch (error) {
      console.error(`Erro ao formatar hora: ${dateString}`, error);
      return '';
    }
  };
  
  const renderEventItem = ({ item }: { item: Event }) => {
    try {
      // Verificar se o item é válido
      if (!item || !item.id) {
        console.error("Evento inválido recebido no renderEventItem");
        return null;
      }
      
    // Encontrar serviços para a data selecionada
    const selectedDateObj = parseISO(selectedDateStr);
    const servicesForSelectedDate = item.EventsServices?.filter(service => {
        try {
          if (service && service.arriveMashguiachTime) {
        const serviceDate = parseISO(service.arriveMashguiachTime);
        return isSameDay(serviceDate, selectedDateObj);
      }
      return false;
        } catch (error) {
          console.error(`Erro ao processar serviço para evento ${item.title}:`, error);
          return false;
        }
    }) || [];
    
    // Ordenar serviços por data e hora
    servicesForSelectedDate.sort((a, b) => 
      new Date(a.arriveMashguiachTime).getTime() - new Date(b.arriveMashguiachTime).getTime()
    );
    
    // Usar o primeiro serviço para a data selecionada, se existir
    const serviceForDisplay = servicesForSelectedDate.length > 0 ? servicesForSelectedDate[0] : null;
    
    // Função para obter a cor do status de pagamento
    const getPaymentStatusColor = (status: string) => {
      switch (status) {
        case 'Success':
          return { bg: 'rgba(76, 175, 80, 0.2)', text: '#4CAF50' };
        case 'Pending':
          return { bg: 'rgba(255, 152, 0, 0.2)', text: '#FF9800' };
        case 'Failed':
          return { bg: 'rgba(244, 67, 54, 0.2)', text: '#F44336' };
        default:
          return { bg: 'rgba(158, 158, 158, 0.2)', text: '#9E9E9E' };
      }
    };
    
    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: currentTheme.surface }
        ]}
        onPress={() => openEventDetails(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: currentTheme.text }]}>
              {item.title || 'Evento sem título'}
          </Text>
          <View style={styles.badgeContainer}>
            {/* Badge principal: tipo de evento */}
            <View style={styles.eventTypeBadge}>
              <Text style={styles.eventTypeText}>
                  {item.eventType || 'Tipo não informado'}
              </Text>
            </View>
            
            {/* Badge de status de aprovação do evento principal */}
            <View 
              style={[
                styles.eventTypeBadge, 
                { backgroundColor: item.isApproved ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)' }
              ]}
            >
              <Text 
                style={[
                  styles.eventTypeText, 
                  { color: item.isApproved ? '#4CAF50' : '#FF9800' }
                ]}
              >
                {item.isApproved ? 'Aprovado' : 'Pendente'}
              </Text>
          </View>
        </View>
          </View>
          
          <View style={styles.cardInfo}>
            <View style={styles.infoRow}>
              <Calendar size={16} color={currentTheme.primary} />
              <Text style={[styles.infoText, { color: currentTheme.text }]}>
                {serviceForDisplay 
                  ? formatDate(serviceForDisplay.arriveMashguiachTime)
                  : 'Data não informada'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={16} color={currentTheme.primary} />
              <Text style={[styles.infoText, { color: currentTheme.text }]}>
                {serviceForDisplay 
                  ? `${formatTime(serviceForDisplay.arriveMashguiachTime)} - ${formatTime(serviceForDisplay.endMashguiachTime)}`
                  : 'Horário não informado'}
              </Text>
            </View>
          
          <View style={styles.infoRow}>
            <MapPin size={16} color={currentTheme.primary} />
            <Text style={[styles.infoText, { color: currentTheme.text }]}>
                {serviceForDisplay && (serviceForDisplay.address_city || serviceForDisplay.address_state)
                  ? `${serviceForDisplay.address_city || ''}/${serviceForDisplay.address_state || ''}`
                  : item.address_city && item.address_state
                    ? `${item.address_city}/${item.address_state}`
                    : 'Endereço não informado'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <User size={16} color={currentTheme.primary} />
            <Text style={[styles.infoText, { color: currentTheme.text }]}>
                {item.responsable || 'Responsável não informado'}
            </Text>
          </View>
          
            {(item.nrPax > 0) && (
            <View style={styles.infoRow}>
              <Users size={16} color={currentTheme.primary} />
              <Text style={[styles.infoText, { color: currentTheme.text }]}>
                {item.nrPax} convidados
              </Text>
            </View>
          )}
          
            {serviceForDisplay && serviceForDisplay.mashguiachId && serviceForDisplay.Mashguiach && (
            <View style={styles.infoRow}>
              <User size={16} color="#009688" />
              <Text style={[styles.infoText, { color: currentTheme.text }]}>
                  Mashguiach: {serviceForDisplay.Mashguiach.name || 'Não informado'}
              </Text>
            </View>
          )}
          
          {/* Mostrar status de pagamento como parte das informações, não como badge */}
          {serviceForDisplay && serviceForDisplay.paymentStatus && (
            <View style={styles.infoRow}>
              <Text style={[
                styles.paymentStatusText, 
                { color: getPaymentStatusColor(serviceForDisplay.paymentStatus).text }
              ]}>
                Status: {serviceForDisplay.paymentStatus === 'Success' ? 'Pago' : 
                         serviceForDisplay.paymentStatus === 'Pending' ? 'Pendente' : 
                         serviceForDisplay.paymentStatus === 'Failed' ? 'Falhou' : 'Desconhecido'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
    } catch (error) {
      console.error("Erro ao renderizar evento:", error);
      return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    calendarContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
    },
    selectedDateContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    selectedDateText: {
      fontSize: 18,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    eventsTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    card: {
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cardHeader: {
      padding: 16,
      paddingBottom: 8,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    badgeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    eventTypeBadge: {
      backgroundColor: 'rgba(186, 154, 95, 0.2)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginBottom: 4,
    },
    eventTypeText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#ba9a5f',
    },
    cardInfo: {
      padding: 16,
      paddingTop: 0,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      marginLeft: 8,
      flex: 1,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 8,
    },
    workTypeIndicator: {
      backgroundColor: 'rgba(0, 150, 136, 0.1)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    workTypeText: {
      fontSize: 10,
      fontWeight: '500',
      color: '#009688',
    },
    paymentStatusText: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 4,
    },
    monthLoadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    errorContainer: {
      margin: 16,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    errorText: {
      fontSize: 14,
      marginBottom: 12,
      textAlign: 'center',
    },
    retryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 4,
    },
    retryButtonText: {
      color: 'white',
      fontWeight: '500',
    },
  });

  const handleMonthChange = (month: { month: number; year: number }) => {
    console.log(`Mês alterado para: ${month.month}, ano: ${month.year}`);
    
    // Atualizar o mês e ano atual
    setCurrentMonth(month.month);
    setCurrentYear(month.year);
    
    // Criar uma nova data para o primeiro dia do mês selecionado
    const newDate = new Date(month.year, month.month - 1, 1);
    setSelectedDate(newDate);
    setSelectedDateStr(format(newDate, 'yyyy-MM-dd'));
    
    // Buscar eventos para o novo mês
    fetchEventsForMonth(month.month, month.year);
  };
  
  const fetchEventsForMonth = async (month: number, year: number) => {
    try {
      setMonthLoading(true);
      setError(null);
      
      console.log(`Buscando eventos para mês ${month} e ano ${year}`);
      
      // Usar a nova API que busca eventos por mês e ano
      const response = await api.get<EventsResponse>(`/admin/getEventsByMonthYear`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
        params: {
          month,
          year
        }
      });
      
      if (response.data && response.data.success) {
        const receivedEvents = response.data.events || [];
        console.log(`Eventos recebidos: ${receivedEvents.length}`);
        
        // A API está retornando os serviços de eventos, não os eventos diretamente
        // Precisamos transformar os dados para o formato esperado pelo calendário
        const transformedEvents: Event[] = receivedEvents
          .filter(service => service && service.StoreEvents) // Filtrar serviços sem StoreEvents
          .map(service => {
            // Criar um objeto de evento a partir do StoreEvents e adicionar o serviço
            return {
              ...service.StoreEvents,
              EventsServices: [service], // Adicionar o serviço atual como um item no array de serviços
              store: service.StoreEvents.store || {},
              eventOwner: {
                id: service.StoreEvents.ownerId,
                name: service.StoreEvents.clientName || '',
                email: '',
                phone: service.StoreEvents.responsableTelephone || ''
              },
              // Adicionar campos de endereço do evento
              address_city: service.StoreEvents.address_city || service.address_city || '',
              address_state: service.StoreEvents.address_state || service.address_state || '',
              address_neighbor: service.StoreEvents.address_neighbor || service.address_neighbor || '',
              address_number: service.StoreEvents.address_number || service.address_number || '',
              address_street: service.StoreEvents.address_street || service.address_street || '',
              address_zipcode: service.StoreEvents.address_zicode || service.address_zipcode || ''
            };
          });
        
        console.log(`Eventos transformados: ${transformedEvents.length}`);
        
        // Verificar se os eventos têm as propriedades necessárias
        const validEvents = transformedEvents.filter(event => {
          // Verificar se o evento tem uma data válida
          const hasValidDate = event && event.date && typeof event.date === 'string';
          
          if (!hasValidDate) {
            console.warn(`Evento ${event?.title || 'sem título'} não tem data válida`);
          }
          
          return hasValidDate;
        });
        
        console.log(`Eventos válidos: ${validEvents.length} de ${transformedEvents.length}`);
        setEvents(validEvents);
        
        // Atualizar as datas marcadas após receber os eventos
        setTimeout(() => {
          updateMarkedDates();
        }, 100);
      } else {
        console.error("Erro na resposta da API:", response.data?.message || "Resposta inválida");
        setError(response.data?.message || "Erro ao buscar eventos");
        setEvents([]);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos para o mês:', error);
      setError("Falha ao carregar eventos. Tente novamente.");
      setEvents([]);
    } finally {
      setMonthLoading(false);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <Header title="Calendário de Eventos" />
      
      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[currentTheme.primary]}
              tintColor={currentTheme.primary}
            />
          }
        >
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: currentTheme.error + '20' }]}>
              <Text style={[styles.errorText, { color: currentTheme.error }]}>
                {error}
              </Text>
              <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: currentTheme.error }]}
                onPress={() => fetchEventsForMonth(currentMonth, currentYear)}
              >
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.calendarContainer}>
            <CalendarComponent
              current={selectedDateStr}
              onDayPress={handleDayPress}
              onMonthChange={handleMonthChange}
              markedDates={markedDates}
              theme={{
                calendarBackground: currentTheme.surface,
                textSectionTitleColor: currentTheme.textSecondary,
                selectedDayBackgroundColor: currentTheme.primary,
                selectedDayTextColor: '#000',
                todayTextColor: currentTheme.primary,
                dayTextColor: currentTheme.text,
                textDisabledColor: currentTheme.textSecondary + '50',
                dotColor: currentTheme.primary,
                selectedDotColor: '#000',
                arrowColor: currentTheme.primary,
                monthTextColor: currentTheme.text,
                indicatorColor: currentTheme.primary,
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12
              }}
            />
            
            {monthLoading && (
              <View style={styles.monthLoadingOverlay}>
                <ActivityIndicator size="large" color={currentTheme.primary} />
              </View>
            )}
          </View>
          
          <View style={styles.selectedDateContainer}>
            <Text style={[styles.selectedDateText, { color: currentTheme.text }]}>
              {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </Text>
          </View>
          
          {eventsForSelectedDate.length > 0 ? (
            <>
              <Text style={[styles.eventsTitle, { color: currentTheme.text }]}>
                Eventos do Dia ({eventsForSelectedDate.length})
              </Text>
              
              <FlatList
                data={eventsForSelectedDate}
                renderItem={renderEventItem}
                keyExtractor={(item) => item?.id || Math.random().toString()}
                scrollEnabled={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
                      Nenhum evento válido para esta data.
                    </Text>
                  </View>
                )}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
                Nenhum evento programado para esta data.
              </Text>
              <Text style={{ color: currentTheme.textSecondary, textAlign: 'center' }}>
                Selecione outra data no calendário ou verifique os eventos agendados.
              </Text>
            </View>
          )}
          
          {/* Adicionar padding no final para não ficar colado com a borda inferior */}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
} 