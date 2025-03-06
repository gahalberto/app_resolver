import React, { useEffect, useState } from 'react';
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Pressable,
  Clipboard,
  ToastAndroid,
  Alert,
} from "react-native";
import { Header } from "@/components/Header";
import { Calendar, Clock, MapPin, Users, DollarSign, Phone, X, Car, Navigation, MessageCircle, Copy, Check, CalendarPlus } from 'lucide-react-native';
import { api } from '@/server/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import * as CalendarAPI from 'expo-calendar';

interface UserService {
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
  Mashguiach: {
    id: string;
    name: string;
    // outros campos do Mashguiach
  };
  StoreEvents: {
    id: string;
    title: string;
    date: string;
    nrPax: number;
    clientName: string;
    eventType: string;
    serviceType: string;
    responsable: string;
    responsableTelephone: string;
    // outros campos do StoreEvents
  };
}

interface UserServicesResponse {
  services: UserService[];
}

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const { theme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState<UserService | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (user?.id) {
      fetchUserServices();
    }
  }, [user]);

  const fetchUserServices = async () => {
    try {
      setIsLoadingServices(true);
      const response = await api.get<UserServicesResponse>('/getNextUserServices', {
        params: { user_id: user?.id }
      });
      console.log(response.data.services);
      setUserServices(response.data.services);
    } catch (error) {
      console.error('Erro ao buscar próximos eventos:', error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm", { locale: ptBR });
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

  const openUber = (address: string) => {
    const formattedAddress = encodeURIComponent(address);
    const url = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${formattedAddress}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback para abrir o app store
        if (Platform.OS === 'ios') {
          Linking.openURL('https://apps.apple.com/br/app/uber/id368677368');
        } else {
          Linking.openURL('https://play.google.com/store/apps/details?id=com.ubercab');
        }
      }
    });
  };

  const openGoogleMaps = (address: string) => {
    const formattedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${formattedAddress}`;
    Linking.openURL(url);
  };

  const openWhatsApp = (phone: string) => {
    // Remover caracteres não numéricos
    const formattedPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/55${formattedPhone}`;
    Linking.openURL(url);
  };

  const handleOpenModal = (service: UserService) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedService(null);
  };

  const getFullAddress = (service: UserService) => {
    return `${service.address_street}, ${service.address_number} - ${service.address_neighbor}, ${service.address_city}/${service.address_state}`;
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Endereço copiado!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Sucesso', 'Endereço copiado para a área de transferência.');
    }
  };

  const addToCalendar = async (service: UserService) => {
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
        notes: `Cliente: ${service.StoreEvents.clientName}\nTipo: ${formatWorkType(service.workType)}\nValor: R$ ${(service.mashguiachPrice + service.transport_price).toFixed(2).replace('.', ',')}\n${service.observationText || ''}`,
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

  const approveService = async (serviceId: string) => {
    try {
      setLoading(true);
      const response = await api.post('/events/mashguiach-aprove-service', null, {
        params: {
          user_id: user?.id,
          service_id: serviceId
        }
      });
      
      if (response.status === 200) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Evento aprovado com sucesso!', ToastAndroid.SHORT);
        } else {
          Alert.alert('Sucesso', 'Evento aprovado com sucesso!');
        }
        
        // Atualiza o estado local do serviço selecionado
        if (selectedService) {
          setSelectedService({
            ...selectedService,
            accepted: true
          });
        }
        
        // Atualiza a lista de serviços após aprovação
        fetchUserServices();
      }
    } catch (error) {
      console.error('Erro ao aprovar evento:', error);
      Alert.alert('Erro', 'Não foi possível aprovar o evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
      padding: 16,
    },
    header: {
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: currentTheme.textSecondary,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.text,
      marginTop: 16,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: currentTheme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      marginHorizontal: 4,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    cardTitle: {
      color: currentTheme.text,
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 8,
    },
    cardText: {
      color: currentTheme.textSecondary,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.text,
      marginBottom: 12,
    },
    eventInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    eventInfoText: {
      fontSize: 14,
      color: currentTheme.text,
      marginLeft: 8,
      flex: 1,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '500',
    },
    pendingBadge: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#F59E0B',
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    pendingText: {
      color: '#92400E',
      fontSize: 12,
      fontWeight: '700',
      marginLeft: 4,
    },
    approvedBadge: {
      backgroundColor: '#D1FAE5',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#10B981',
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    approvedText: {
      color: '#065F46',
      fontSize: 12,
      fontWeight: '700',
      marginLeft: 4,
    },
    divider: {
      height: 1,
      backgroundColor: currentTheme.surfaceLight,
      marginVertical: 12,
    },
    priceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    priceLabel: {
      fontSize: 14,
      color: currentTheme.textSecondary,
    },
    priceValue: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.primary,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
    },
    emptyText: {
      color: currentTheme.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
    refreshButton: {
      backgroundColor: currentTheme.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      marginTop: 16,
    },
    refreshButtonText: {
      color: isDarkMode ? currentTheme.background : currentTheme.surface,
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      flex: 1,
    },
    closeButton: {
      padding: 4,
    },
    modalBody: {
      padding: 16,
      maxHeight: '70%',
    },
    modalSection: {
      marginBottom: 20,
    },
    modalSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    modalItemLabel: {
      fontSize: 14,
      marginRight: 8,
      width: 100,
    },
    modalItemText: {
      fontSize: 14,
      flex: 1,
      marginLeft: 8,
    },
    modalActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      minWidth: 100,
      width: '48%',
      marginBottom: 8,
    },
    actionButtonText: {
      color: '#FFFFFF',
      marginLeft: 8,
      fontWeight: '500',
    },
    copyAddressButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: currentTheme.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      marginTop: 12,
      alignSelf: 'flex-start',
    },
    copyAddressButtonText: {
      color: isDarkMode ? currentTheme.background : currentTheme.surface,
      fontWeight: '500',
      marginLeft: 8,
    },
    approveButtonContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      marginTop: 8,
    },
    approveButton: {
      backgroundColor: currentTheme.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
    },
    approveButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      marginLeft: 8,
      fontSize: 16,
    },
    approvedContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      marginTop: 8,
      alignItems: 'center',
    },
    modalApprovedBadge: {
      backgroundColor: '#D1FAE5',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#10B981',
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    modalApprovedText: {
      color: '#065F46',
      fontWeight: 'bold',
      marginLeft: 8,
      fontSize: 14,
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.cardText}>Você não está logado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <Header title="Dashboard" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Olá, {user.name}</Text>
          <Text style={styles.subtitle}>Bem-vindo ao seu dashboard</Text>
        </View>

        <Text style={styles.sectionTitle}>Seus Próximos Eventos</Text>
        
        {isLoadingServices ? (
          <View style={[styles.card, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
            <ActivityIndicator size="large" color={currentTheme.primary} />
          </View>
        ) : userServices.length > 0 ? (
          userServices.map((service) => (
            <TouchableOpacity 
              key={service.id} 
              style={styles.card}
              onPress={() => handleOpenModal(service)}
              activeOpacity={0.7}
            >
              <View style={service.accepted ? styles.approvedBadge : styles.pendingBadge}>
                {service.accepted ? (
                  <Check size={14} color="#065F46" />
                ) : (
                  <Clock size={14} color="#92400E" />
                )}
                <Text style={[styles.badgeText, service.accepted ? styles.approvedText : styles.pendingText]}>
                  {service.accepted ? 'Confirmado' : 'Pendente'}
                </Text>
              </View>
              
              <Text style={styles.eventTitle}>{service.StoreEvents.title}</Text>
              
              <View style={styles.eventInfo}>
                <Calendar size={16} color={currentTheme.primary} />
                <Text style={styles.eventInfoText}>
                  {formatDate(service.arriveMashguiachTime)}
                </Text>
              </View>
              
              <View style={styles.eventInfo}>
                <Clock size={16} color={currentTheme.primary} />
                <Text style={styles.eventInfoText}>
                  {formatTime(service.arriveMashguiachTime)} - {formatTime(service.endMashguiachTime)}
                </Text>
              </View>
              
              <View style={styles.eventInfo}>
                <MapPin size={16} color={currentTheme.primary} />
                <Text style={styles.eventInfoText}>
                  {service.address_street}, {service.address_number} - {service.address_neighbor}, {service.address_city}/{service.address_state}
                </Text>
              </View>
              
              <View style={styles.eventInfo}>
                <Users size={16} color={currentTheme.primary} />
                <Text style={styles.eventInfoText}>
                  {service.StoreEvents.nrPax} convidados
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.eventInfo}>
                <Text style={[styles.eventInfoText, { color: currentTheme.textSecondary }]}>
                  Tipo de Trabalho: {formatWorkType(service.workType)}
                </Text>
              </View>
              
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Valor Total:</Text>
                <Text style={styles.priceValue}>
                  R$ {(service.mashguiachPrice + service.transport_price).toFixed(2).replace('.', ',')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Você não tem eventos agendados no momento.
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchUserServices}>
              <Text style={styles.refreshButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Adicionar padding no final para não ficar colado com a borda inferior */}
        <View style={{ height: 20 }} />

        {/* Modal de detalhes do evento */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: currentTheme.surface }]}>
              {selectedService && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                      {selectedService.StoreEvents.title}
                    </Text>
                    <Pressable onPress={handleCloseModal} style={styles.closeButton}>
                      <X size={24} color={currentTheme.text} />
                    </Pressable>
                  </View>

                  <ScrollView style={styles.modalBody}>
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>
                        Informações do Evento
                      </Text>
                      
                      <View style={styles.modalItem}>
                        <Calendar size={18} color={currentTheme.primary} />
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          Data: {formatDate(selectedService.StoreEvents.date)}
                        </Text>
                      </View>
                      
                      <View style={styles.modalItem}>
                        <Clock size={18} color={currentTheme.primary} />
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          Horário: {formatTime(selectedService.arriveMashguiachTime)} - {formatTime(selectedService.endMashguiachTime)}
                        </Text>
                      </View>
                      
                      <View style={styles.modalItem}>
                        <Users size={18} color={currentTheme.primary} />
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          Convidados: {selectedService.StoreEvents.nrPax}
                        </Text>
                      </View>
                      
                      <View style={styles.modalItem}>
                        <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                          Cliente:
                        </Text>
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          {selectedService.StoreEvents.clientName}
                        </Text>
                      </View>
                      
                      <View style={styles.modalItem}>
                        <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                          Tipo de Evento:
                        </Text>
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          {selectedService.StoreEvents.eventType}
                        </Text>
                      </View>
                      
                      <View style={styles.modalItem}>
                        <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                          Tipo de Serviço:
                        </Text>
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          {selectedService.StoreEvents.serviceType}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>
                        Endereço
                      </Text>
                      
                      <View style={styles.modalItem}>
                        <MapPin size={18} color={currentTheme.primary} />
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          {getFullAddress(selectedService)}
                        </Text>
                      </View>
                      
                      <View style={styles.modalItem}>
                        <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                          CEP:
                        </Text>
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          {selectedService.address_zipcode}
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.copyAddressButton}
                        onPress={() => copyToClipboard(getFullAddress(selectedService))}
                      >
                        <Copy size={16} color={isDarkMode ? currentTheme.background : currentTheme.surface} />
                        <Text style={styles.copyAddressButtonText}>
                          Copiar Endereço
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>
                        Responsável
                      </Text>
                      
                      <View style={styles.modalItem}>
                        <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                          Nome:
                        </Text>
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          {selectedService.StoreEvents.responsable}
                        </Text>
                      </View>
                      
                      <View style={styles.modalItem}>
                        <Phone size={18} color={currentTheme.primary} />
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          {selectedService.StoreEvents.responsableTelephone}
                        </Text>
                      </View>
                    </View>
                    
                    {selectedService.observationText && (
                      <View style={styles.modalSection}>
                        <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>
                          Observações
                        </Text>
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          {selectedService.observationText}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>
                        Valores
                      </Text>
                      
                      <View style={styles.modalItem}>
                        <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                          Valor por Hora:
                        </Text>
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          R$ {selectedService.mashguiachPricePerHour.toFixed(2).replace('.', ',')}
                        </Text>
                      </View>

                      <View style={styles.modalItem}>
                        <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                          Transporte:
                        </Text>
                        <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                          R$ {selectedService.transport_price.toFixed(2).replace('.', ',')}
                        </Text>
                      </View>

                      <View style={styles.modalItem}>
                        <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                          Valor Total:
                        </Text>
                        <Text style={[styles.modalItemText, { color: currentTheme.primary, fontWeight: '600' }]}>
                          R$ {(selectedService.mashguiachPrice + selectedService.transport_price).toFixed(2).replace('.', ',')}
                        </Text>
                      </View>
                    </View>
                  </ScrollView>

                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#00C853' }]}
                      onPress={() => openWhatsApp(selectedService.StoreEvents.responsableTelephone)}
                    >
                      <MessageCircle size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>WhatsApp</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#1A73E8' }]}
                      onPress={() => openGoogleMaps(getFullAddress(selectedService))}
                    >
                      <Navigation size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Maps</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#000000' }]}
                      onPress={() => openUber(getFullAddress(selectedService))}
                    >
                      <Car size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Uber</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#ba9a5f' }]}
                      onPress={() => addToCalendar(selectedService)}
                    >
                      <CalendarPlus size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Calendário</Text>
                    </TouchableOpacity>
                  </View>

                  {!selectedService.accepted && (
                    <View style={styles.approveButtonContainer}>
                      <TouchableOpacity 
                        style={styles.approveButton}
                        onPress={() => approveService(selectedService.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Check size={20} color="#FFFFFF" />
                            <Text style={styles.approveButtonText}>Aceitar Evento</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {selectedService.accepted && (
                    <View style={styles.approvedContainer}>
                      <View style={styles.modalApprovedBadge}>
                        <Check size={18} color="#065F46" />
                        <Text style={styles.modalApprovedText}>Você aceitou e vai para esse evento!</Text>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
} 