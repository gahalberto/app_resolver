import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  FlatList,
  Modal,
  Dimensions,
  Linking,
  Platform,
  Share,
  Alert,
  Clipboard,
  ToastAndroid
} from "react-native";
import { Header } from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { useUser } from "@/contexts/UserContext";
import { api } from "@/server/api";
import { Calendar as CalendarComponent, LocaleConfig } from 'react-native-calendars';
import { format, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as CalendarAPI from 'expo-calendar';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  X, 
  Phone, 
  DollarSign, 
  Briefcase,
  Building,
  Navigation,
  Copy,
  MessageSquare,
  Car,
  CalendarPlus
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

// Interface para os eventos da loja
interface StoreEvents {
  id: string;
  title: string;
  responsable: string;
  date: string;
  clientName: string;
  eventType: string;
  serviceType: string;
  responsableTelephone: string;
  storeId: string;
  store?: Store;
  nrPax: number;
}

// Interface para os serviços
interface Service {
  id: string;
  StoreEventsId: string;
  arriveMashguiachTime: string;
  endMashguiachTime: string;
  isApproved: boolean;
  mashguiachId: string;
  mashguiachPrice: number;
  observationText: string;
  accepted: boolean;
  responseDate: string | null;
  StoreId: string;
  paymentStatus: string;
  reallyMashguiachArrive: string | null;
  reallyMashguiachEndTime: string | null;
  latitude: number | null;
  longitude: number | null;
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

// Interface para a resposta da API
interface ApiResponse {
  services: Service[];
}

// Interface para os marcadores do calendário
interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

export default function EventsPage() {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      fetchEvents();
    }
  }, [user]);
  
  useEffect(() => {
    if (services.length > 0) {
      updateMarkedDates();
      filterEventsForSelectedDate();
    }
  }, [services, selectedDateStr]);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os eventos do usuário
      const response = await api.get<ApiResponse>('/getAllUserServices', { 
        params: { user_id: user?.id }
      });
      
      setServices(response.data.services);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };
  
  const updateMarkedDates = () => {
    const marked: MarkedDates = {};
    
    // Marcar todos os dias que têm eventos
    services.forEach(service => {
      const date = format(parseISO(service.arriveMashguiachTime), 'yyyy-MM-dd');
      
      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dotColor: currentTheme.primary,
        };
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
        dotColor: 'transparent', // Adicionando dotColor obrigatório
        selected: true,
        selectedColor: currentTheme.primary + '40',
      };
    }
    
    setMarkedDates(marked);
  };
  
  const filterEventsForSelectedDate = () => {
    const selectedDateObj = parseISO(selectedDateStr);
    
    const filteredEvents = services.filter(service => {
      const eventDate = parseISO(service.arriveMashguiachTime);
      return isSameDay(eventDate, selectedDateObj);
    });
    
    setEventsForSelectedDate(filteredEvents);
  };
  
  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDateStr(day.dateString);
    setSelectedDate(parseISO(day.dateString));
  };
  
  const openServiceDetails = (service: Service) => {
    setSelectedService(service);
    setModalVisible(true);
  };
  
  const closeServiceDetails = () => {
    setModalVisible(false);
    setSelectedService(null);
  };
  
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  const formatTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "HH:mm", { locale: ptBR });
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };
  
  const formatWorkType = (type: string) => {
    const types = {
      'PRODUCAO': 'Produção',
      'EVENTO': 'Evento',
      'LOJA': 'Loja',
      'OUTRO': 'Outro'
    };
    return types[type as keyof typeof types] || type;
  };
  
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return { bg: 'rgba(16, 185, 129, 0.2)', text: '#10B981' }; // Verde
      case 'Pending':
      default:
        return { bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' }; // Amarelo
    }
  };
  
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'Pago';
      case 'Pending':
      default:
        return 'Pendente';
    }
  };
  
  const openWhatsApp = (phoneNumber: string) => {
    // Remover caracteres não numéricos
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Adicionar código do país se não existir
    const numberWithCountryCode = formattedNumber.startsWith('55') 
      ? formattedNumber 
      : `55${formattedNumber}`;
    
    const url = `whatsapp://send?phone=${numberWithCountryCode}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert(
            'WhatsApp não instalado',
            'Por favor, instale o WhatsApp para usar esta funcionalidade.'
          );
        }
      })
      .catch(err => console.error('Erro ao abrir WhatsApp:', err));
  };
  
  const openMaps = (address: string, city: string, state: string) => {
    const formattedAddress = `${address}, ${city}, ${state}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${formattedAddress}`,
      android: `geo:0,0?q=${formattedAddress}`
    });
    
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Erro ao abrir o mapa:', err);
        Alert.alert('Erro', 'Não foi possível abrir o mapa.');
      });
    }
  };
  
  const openUber = (address: string, city: string, state: string) => {
    const formattedAddress = `${address}, ${city}, ${state}`;
    const uberURL = `uber://?action=setPickup&pickup=my_location&dropoff[formatted_address]=${formattedAddress}`;
    
    Linking.canOpenURL(uberURL)
      .then(supported => {
        if (supported) {
          return Linking.openURL(uberURL);
        } else {
          // Se o app do Uber não estiver instalado, abrir no navegador
          const webUrl = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${formattedAddress}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch(err => {
        console.error('Erro ao abrir Uber:', err);
        Alert.alert('Erro', 'Não foi possível abrir o Uber.');
      });
  };
  
  const copyAddress = (address: string, city: string, state: string) => {
    const fullAddress = `${address}, ${city}, ${state}`;
    
    if (Platform.OS === 'android') {
      Clipboard.setString(fullAddress);
      ToastAndroid.show('Endereço copiado!', ToastAndroid.SHORT);
    } else {
      Clipboard.setString(fullAddress);
      Alert.alert('Sucesso', 'Endereço copiado para a área de transferência.');
    }
  };
  
  const addToCalendar = async (service: Service) => {
    try {
      // Solicitar permissão para acessar o calendário
      const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Não foi possível acessar o calendário.');
        return;
      }
      
      // Obter os calendários disponíveis
      const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
      
      if (!defaultCalendar) {
        Alert.alert('Erro', 'Não foi possível encontrar um calendário.');
        return;
      }
      
      // Criar o evento
      const eventDetails = {
        title: service.StoreEvents.title,
        startDate: new Date(service.arriveMashguiachTime),
        endDate: new Date(service.endMashguiachTime),
        location: `${service.address_street}, ${service.address_number}, ${service.address_city}, ${service.address_state}`,
        notes: `Buffet: ${service.StoreEvents.store?.title || 'Não informado'}\nTipo: ${formatWorkType(service.workType)}\nValor: ${formatCurrency(service.mashguiachPrice + service.transport_price)}\n${service.observationText || ''}`,
        timeZone: 'America/Sao_Paulo',
      };
      
      const eventId = await CalendarAPI.createEventAsync(defaultCalendar.id, eventDetails);
      
      if (eventId) {
        Alert.alert('Sucesso', 'Evento adicionado ao calendário.');
      }
    } catch (error) {
      console.error('Erro ao adicionar evento ao calendário:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o evento ao calendário.');
    }
  };
  
  const renderEventItem = ({ item }: { item: Service }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: currentTheme.surface }]}
      onPress={() => openServiceDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: currentTheme.text }]}>
          {item.StoreEvents.title}
        </Text>
        <View style={styles.badgeContainer}>
          <View style={styles.workTypeContainer}>
            <Text style={styles.workTypeText}>
              {formatWorkType(item.workType)}
            </Text>
          </View>
          
          <View 
            style={[
              styles.paymentStatusBadge, 
              { backgroundColor: getPaymentStatusColor(item.paymentStatus).bg }
            ]}
          >
            <Text 
              style={[
                styles.paymentStatusText, 
                { color: getPaymentStatusColor(item.paymentStatus).text }
              ]}
            >
              {getPaymentStatusText(item.paymentStatus)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardInfo}>
        <View style={styles.infoRow}>
          <Clock size={16} color={currentTheme.primary} />
          <Text style={[styles.infoText, { color: currentTheme.text }]}>
            {formatTime(item.arriveMashguiachTime)} - {formatTime(item.endMashguiachTime)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Building size={16} color={currentTheme.primary} />
          <Text style={[styles.infoText, { color: currentTheme.text }]}>
            Buffet: {item.StoreEvents.store?.title || 'Não informado'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MapPin size={16} color={currentTheme.primary} />
          <Text style={[styles.infoText, { color: currentTheme.text }]}>
            {item.address_street}, {item.address_number} - {item.address_city}/{item.address_state}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.priceContainer}>
          <Text style={[styles.priceLabel, { color: currentTheme.textSecondary }]}>
            Valor Total:
          </Text>
          <Text style={[styles.priceValue, { color: currentTheme.primary }]}>
            {formatCurrency(item.mashguiachPrice + item.transport_price)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    calendarContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
    },
    selectedDateContainer: {
      marginBottom: 16,
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
    workTypeContainer: {
      backgroundColor: 'rgba(186, 154, 95, 0.2)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginBottom: 4,
    },
    workTypeText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#ba9a5f',
    },
    paymentStatusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    paymentStatusText: {
      fontSize: 12,
      fontWeight: '500',
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
    divider: {
      height: 1,
      marginVertical: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    priceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    priceLabel: {
      fontSize: 14,
    },
    priceValue: {
      fontSize: 16,
      fontWeight: '600',
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxHeight: '80%',
      borderRadius: 12,
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    modalContent: {
      padding: 16,
    },
    eventTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    badgeRow: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    detailSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    detailText: {
      fontSize: 14,
      marginLeft: 8,
      flex: 1,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      borderRadius: 8,
      marginBottom: 8,
      width: '48%',
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 6,
    },
    fullWidthButton: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    fullWidthButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
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
                Selecione outra data no calendário ou verifique seus eventos agendados.
              </Text>
            </View>
          )}
          
          {/* Adicionar padding no final para não ficar colado com a borda inferior */}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
      
      {/* Modal de Detalhes do Evento */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeServiceDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: currentTheme.surface }]}>
            {selectedService && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                    Detalhes do Evento
                  </Text>
                  <TouchableOpacity onPress={closeServiceDetails}>
                    <X size={24} color={currentTheme.text} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalContent}>
                  <Text style={[styles.eventTitle, { color: currentTheme.text }]}>
                    {selectedService.StoreEvents.title}
                  </Text>
                  
                  <View style={styles.badgeRow}>
                    <View style={styles.workTypeContainer}>
                      <Text style={styles.workTypeText}>
                        {formatWorkType(selectedService.workType)}
                      </Text>
                    </View>
                    
                    <View 
                      style={[
                        styles.paymentStatusBadge, 
                        { backgroundColor: getPaymentStatusColor(selectedService.paymentStatus).bg }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.paymentStatusText, 
                          { color: getPaymentStatusColor(selectedService.paymentStatus).text }
                        ]}
                      >
                        {getPaymentStatusText(selectedService.paymentStatus)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                      Informações do Evento
                    </Text>
                    
                    <View style={styles.detailRow}>
                      <Calendar size={18} color={currentTheme.primary} />
                      <Text style={[styles.detailText, { color: currentTheme.text }]}>
                        {formatDate(selectedService.arriveMashguiachTime)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Clock size={18} color={currentTheme.primary} />
                      <Text style={[styles.detailText, { color: currentTheme.text }]}>
                        {formatTime(selectedService.arriveMashguiachTime)} - {formatTime(selectedService.endMashguiachTime)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Building size={18} color={currentTheme.primary} />
                      <Text style={[styles.detailText, { color: currentTheme.text }]}>
                        Buffet: {selectedService.StoreEvents.store?.title || 'Não informado'}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <MapPin size={18} color={currentTheme.primary} />
                      <Text style={[styles.detailText, { color: currentTheme.text }]}>
                        {selectedService.address_street}, {selectedService.address_number}
                        {'\n'}
                        {selectedService.address_neighbor}, {selectedService.address_city}/{selectedService.address_state}
                      </Text>
                    </View>
                    
                    {/* Botões de ação para o endereço */}
                    <View style={styles.actionButtonsContainer}>
                      <TouchableOpacity 
                        style={[
                          styles.actionButton, 
                          { backgroundColor: currentTheme.primary + '20' }
                        ]}
                        onPress={() => openMaps(
                          `${selectedService.address_street}, ${selectedService.address_number}`,
                          selectedService.address_city,
                          selectedService.address_state
                        )}
                      >
                        <Navigation size={16} color={currentTheme.primary} />
                        <Text style={[styles.actionButtonText, { color: currentTheme.text }]}>
                          Abrir no Mapa
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[
                          styles.actionButton, 
                          { backgroundColor: '#000000' + '20' }
                        ]}
                        onPress={() => openUber(
                          `${selectedService.address_street}, ${selectedService.address_number}`,
                          selectedService.address_city,
                          selectedService.address_state
                        )}
                      >
                        <Car size={16} color={currentTheme.text} />
                        <Text style={[styles.actionButtonText, { color: currentTheme.text }]}>
                          Chamar Uber
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[
                          styles.actionButton, 
                          { backgroundColor: '#25D366' + '20' }
                        ]}
                        onPress={() => {
                          if (selectedService.StoreEvents.responsableTelephone) {
                            openWhatsApp(selectedService.StoreEvents.responsableTelephone);
                          } else {
                            Alert.alert('Erro', 'Número de telefone não disponível.');
                          }
                        }}
                      >
                        <MessageSquare size={16} color="#25D366" />
                        <Text style={[styles.actionButtonText, { color: currentTheme.text }]}>
                          WhatsApp
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[
                          styles.actionButton, 
                          { backgroundColor: currentTheme.textSecondary + '20' }
                        ]}
                        onPress={() => copyAddress(
                          `${selectedService.address_street}, ${selectedService.address_number}`,
                          selectedService.address_city,
                          selectedService.address_state
                        )}
                      >
                        <Copy size={16} color={currentTheme.textSecondary} />
                        <Text style={[styles.actionButtonText, { color: currentTheme.text }]}>
                          Copiar Endereço
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    {selectedService.StoreEvents.nrPax > 0 && (
                      <View style={styles.detailRow}>
                        <Users size={18} color={currentTheme.primary} />
                        <Text style={[styles.detailText, { color: currentTheme.text }]}>
                          Convidados: {selectedService.StoreEvents.nrPax}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                      Responsável
                    </Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailText, { color: currentTheme.text }]}>
                        Nome: {selectedService.StoreEvents.responsable}
                      </Text>
                    </View>
                    
                    {selectedService.StoreEvents.responsableTelephone && (
                      <View style={styles.detailRow}>
                        <Phone size={18} color={currentTheme.primary} />
                        <Text style={[styles.detailText, { color: currentTheme.text }]}>
                          {selectedService.StoreEvents.responsableTelephone}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                      Valores
                    </Text>
                    
                    <View style={styles.detailRow}>
                      <DollarSign size={18} color={currentTheme.primary} />
                      <Text style={[styles.detailText, { color: currentTheme.text }]}>
                        Valor por hora: {formatCurrency(selectedService.mashguiachPricePerHour)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <DollarSign size={18} color={currentTheme.primary} />
                      <Text style={[styles.detailText, { color: currentTheme.text }]}>
                        Transporte: {formatCurrency(selectedService.transport_price)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <DollarSign size={18} color={currentTheme.primary} />
                      <Text style={[styles.detailText, { color: currentTheme.text, fontWeight: 'bold' }]}>
                        Valor Total: {formatCurrency(selectedService.mashguiachPrice + selectedService.transport_price)}
                      </Text>
                    </View>
                  </View>
                  
                  {selectedService.observationText && (
                    <View style={styles.detailSection}>
                      <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                        Observações
                      </Text>
                      <Text style={[styles.detailText, { color: currentTheme.text }]}>
                        {selectedService.observationText}
                      </Text>
                    </View>
                  )}
                  
                  {/* Botão para adicionar ao calendário */}
                  <TouchableOpacity 
                    style={[
                      styles.fullWidthButton, 
                      { backgroundColor: currentTheme.primary }
                    ]}
                    onPress={() => addToCalendar(selectedService)}
                  >
                    <CalendarPlus size={20} color="#000" />
                    <Text style={[styles.fullWidthButtonText, { color: '#000' }]}>
                      Adicionar ao Calendário
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 