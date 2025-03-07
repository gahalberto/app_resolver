import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  FlatList,
  Modal,
  TouchableOpacity
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
}

// Interface para o evento
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
}

// Interface para a resposta da API
interface EventsResponse {
  success: boolean;
  events: Event[];
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

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<Event[]>([]);
  
  useEffect(() => {
    if (user?.id) {
      fetchEvents();
    }
  }, [user]);
  
  useEffect(() => {
    if (events.length > 0) {
      updateMarkedDates();
      filterEventsForSelectedDate();
    }
  }, [events, selectedDateStr]);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os eventos usando o endpoint de admin
      const response = await api.get<EventsResponse>('/admin/getAllEvents', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (response.data.success) {
        setEvents(response.data.events);
      } else {
        throw new Error(response.data.message || "Erro ao buscar eventos");
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  
  const updateMarkedDates = () => {
    const marked: MarkedDates = {};
    
    // Marcar todos os dias que têm eventos baseado nos serviços
    events.forEach(event => {
      // Para cada evento, verificar todos os serviços
      if (event.EventsServices && event.EventsServices.length > 0) {
        event.EventsServices.forEach(service => {
          if (service.arriveMashguiachTime) {
            const date = format(parseISO(service.arriveMashguiachTime), 'yyyy-MM-dd');
            
            if (!marked[date]) {
              marked[date] = {
                marked: true,
                dotColor: currentTheme.primary,
              };
            }
          }
        });
      } else {
        // Se não tiver serviços, usar a data principal do evento
        const date = format(parseISO(event.date), 'yyyy-MM-dd');
        
        if (!marked[date]) {
          marked[date] = {
            marked: true,
            dotColor: currentTheme.primary,
          };
        }
      }
    });
    
    // Marcar o dia selecionado
    if (marked[selectedDateStr]) {
      marked[selectedDateStr] = {
        ...marked[selectedDateStr],
        selected: true,
        selectedColor: currentTheme.primary + '40', // Adiciona transparência
      };
    } else {
      marked[selectedDateStr] = {
        marked: false,
        dotColor: 'transparent',
        selected: true,
        selectedColor: currentTheme.primary + '40',
      };
    }
    
    setMarkedDates(marked);
  };
  
  const filterEventsForSelectedDate = () => {
    const selectedDateObj = parseISO(selectedDateStr);
    
    // Filtrar eventos que têm serviços na data selecionada
    const filteredEvents = events.filter(event => {
      // Verificar se o evento tem serviços na data selecionada
      if (event.EventsServices && event.EventsServices.length > 0) {
        return event.EventsServices.some(service => {
          if (service.arriveMashguiachTime) {
            const serviceDate = parseISO(service.arriveMashguiachTime);
            return isSameDay(serviceDate, selectedDateObj);
          }
          return false;
        });
      }
      
      // Se não tiver serviços, verificar a data principal do evento
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, selectedDateObj);
    });
    
    setEventsForSelectedDate(filteredEvents);
  };
  
  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDateStr(day.dateString);
    setSelectedDate(parseISO(day.dateString));
  };
  
  const openEventDetails = (event: Event) => {
    router.push(`/admin/events/${event.id}` as any);
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "HH:mm", { locale: ptBR });
    } catch (error) {
      return '';
    }
  };
  
  const renderEventItem = ({ item }: { item: Event }) => {
    // Encontrar serviços para a data selecionada
    const selectedDateObj = parseISO(selectedDateStr);
    const servicesForSelectedDate = item.EventsServices?.filter(service => {
      if (service.arriveMashguiachTime) {
        const serviceDate = parseISO(service.arriveMashguiachTime);
        return isSameDay(serviceDate, selectedDateObj);
      }
      return false;
    }) || [];
    
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
            {item.title}
          </Text>
          <View style={styles.badgeContainer}>
            {/* Badge principal: tipo de evento */}
            <View style={styles.eventTypeBadge}>
              <Text style={styles.eventTypeText}>
                {item.eventType}
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
            
            {/* Se tiver serviço, mostrar o tipo de trabalho como ícone ou indicador menor */}
            {serviceForDisplay && serviceForDisplay.workType && (
              <View style={[styles.workTypeIndicator]}>
                <Text style={styles.workTypeText}>
                  {serviceForDisplay.workType}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.cardInfo}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={currentTheme.primary} />
            <Text style={[styles.infoText, { color: currentTheme.text }]}>
              {serviceForDisplay 
                ? formatDate(serviceForDisplay.arriveMashguiachTime) 
                : formatDate(item.date)}
            </Text>
          </View>
          
          {serviceForDisplay && (
            <View style={styles.infoRow}>
              <Clock size={16} color={currentTheme.primary} />
              <Text style={[styles.infoText, { color: currentTheme.text }]}>
                {formatTime(serviceForDisplay.arriveMashguiachTime)} - {formatTime(serviceForDisplay.endMashguiachTime)}
              </Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Building size={16} color={currentTheme.primary} />
            <Text style={[styles.infoText, { color: currentTheme.text }]}>
              {item.store?.title || 'Não informado'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={16} color={currentTheme.primary} />
            <Text style={[styles.infoText, { color: currentTheme.text }]}>
              {serviceForDisplay 
                ? `${serviceForDisplay.address_city}/${serviceForDisplay.address_state}`
                : `${item.address_city}/${item.address_state}`}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <User size={16} color={currentTheme.primary} />
            <Text style={[styles.infoText, { color: currentTheme.text }]}>
              {item.responsable}
            </Text>
          </View>
          
          {item.nrPax > 0 && (
            <View style={styles.infoRow}>
              <Users size={16} color={currentTheme.primary} />
              <Text style={[styles.infoText, { color: currentTheme.text }]}>
                {item.nrPax} convidados
              </Text>
            </View>
          )}
          
          {serviceForDisplay && serviceForDisplay.mashguiachId && (
            <View style={styles.infoRow}>
              <User size={16} color="#009688" />
              <Text style={[styles.infoText, { color: currentTheme.text }]}>
                Mashguiach: {serviceForDisplay.Mashguiach?.name || 'Não informado'}
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
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: currentTheme.background,
    },
    calendarContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
    },
    selectedDateContainer: {
      marginBottom: 16,
      paddingVertical: 8,
      alignItems: 'center',
    },
    selectedDateText: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    eventsTitle: {
      fontSize: 16,
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
    },
    badgeContainer: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 4,
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
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <Header title="Calendário de Eventos" />
      
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.calendarContainer}>
            <CalendarComponent
              current={selectedDateStr}
              onDayPress={handleDayPress}
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
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
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