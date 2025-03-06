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
  Modal
} from "react-native";
import { Header } from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { useUser } from "@/contexts/UserContext";
import { api } from "@/server/api";
import { format, addMonths, subMonths, parseISO, differenceInHours, differenceInMinutes, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  DollarSign, 
  FileText, 
  Briefcase,
  Building,
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react-native";

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

export default function ReportsPage() {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      fetchServices();
    }
  }, [user, selectedDate]);
  
  useEffect(() => {
    // Aplicar filtro quando os serviços ou o filtro mudar
    applyFilter();
  }, [services, paymentFilter]);
  
  const applyFilter = () => {
    let filtered = [...services];
    
    // Aplicar filtro de pagamento
    if (paymentFilter === 'paid') {
      filtered = filtered.filter(service => service.paymentStatus === 'Paid');
    } else if (paymentFilter === 'pending') {
      filtered = filtered.filter(service => service.paymentStatus === 'Pending');
    }
    
    setFilteredServices(filtered);
  };
  
  const fetchServices = async () => {
    try {
      setLoading(true);
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      
      const response = await api.get<ApiResponse>('/getAllUserServices', { 
        params: { 
          user_id: user?.id,
          month: month.toString().padStart(2, '0'),
          year
        } 
      });
      
      setServices(response.data.services);
      
      // Calcular estatísticas
      calculateStatistics(response.data.services);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setServices([]);
      setFilteredServices([]);
      setTotalEarnings(0);
      setTotalHours(0);
      setTotalEvents(0);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStatistics = (services: Service[]) => {
    let earnings = 0;
    let hours = 0;
    
    services.forEach(service => {
      // Somar ganhos
      earnings += service.mashguiachPrice + service.transport_price;
      
      // Calcular horas trabalhadas
      const startTime = parseISO(service.reallyMashguiachArrive || service.arriveMashguiachTime);
      const endTime = parseISO(service.reallyMashguiachEndTime || service.endMashguiachTime);
      
      const hoursDiff = differenceInHours(endTime, startTime);
      const minutesDiff = differenceInMinutes(endTime, startTime) % 60;
      
      hours += hoursDiff + (minutesDiff / 60);
    });
    
    setTotalEarnings(earnings);
    setTotalHours(parseFloat(hours.toFixed(1)));
    setTotalEvents(services.length);
  };
  
  const handlePreviousMonth = () => {
    setSelectedDate(prevDate => subMonths(prevDate, 1));
  };
  
  const handleNextMonth = () => {
    setSelectedDate(prevDate => addMonths(prevDate, 1));
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
  
  const openServiceDetails = (service: Service) => {
    setSelectedService(service);
    setDetailsModalVisible(true);
  };
  
  const closeServiceDetails = () => {
    setDetailsModalVisible(false);
    setSelectedService(null);
  };
  
  // Calcular a diferença entre o horário previsto e o real
  const calculateTimeDifference = (planned: string, actual: string | null) => {
    if (!actual) return null;
    
    const plannedDate = parseISO(planned);
    const actualDate = parseISO(actual);
    
    // Retorna a diferença em minutos
    return differenceInMinutes(actualDate, plannedDate);
  };
  
  const renderServiceItem = ({ item }: { item: Service }) => (
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
          
          {/* Badge de status de pagamento */}
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
          <Calendar size={16} color={currentTheme.primary} />
          <Text style={[styles.infoText, { color: currentTheme.text }]}>
            {formatDate(item.arriveMashguiachTime)}
          </Text>
        </View>
        
        {/* Horário Previsto */}
        <View style={styles.infoRow}>
          <Clock size={16} color={currentTheme.primary} />
          <Text style={[styles.infoText, { color: currentTheme.text }]}>
            <Text style={{ color: currentTheme.textSecondary }}>Previsto: </Text>
            {formatTime(item.arriveMashguiachTime)} - {formatTime(item.endMashguiachTime)}
          </Text>
        </View>
        
        {/* Horário Real (Ponto) */}
        <View style={styles.infoRow}>
          <Clock size={16} color={item.reallyMashguiachArrive ? '#10B981' : '#F59E0B'} />
          <Text style={[styles.infoText, { color: currentTheme.text }]}>
            <Text style={{ color: currentTheme.textSecondary }}>Check-in: </Text>
            {item.reallyMashguiachArrive 
              ? formatTime(item.reallyMashguiachArrive)
              : 'Não registrado'} 
            {' - '}
            {item.reallyMashguiachEndTime 
              ? formatTime(item.reallyMashguiachEndTime)
              : 'Não registrado'}
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
  
  const togglePaymentFilter = () => {
    // Alternar entre os estados do filtro: all -> paid -> pending -> all
    setPaymentFilter(current => {
      if (current === 'all') return 'paid';
      if (current === 'paid') return 'pending';
      return 'all';
    });
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    monthSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthText: {
      fontSize: 18,
      fontWeight: '600',
      marginHorizontal: 12,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 4,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      textAlign: 'center',
    },
    sectionTitle: {
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
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 16,
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
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    filterButtonText: {
      fontSize: 12,
      fontWeight: '500',
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
    timeCard: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    timeCardTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    timeStatus: {
      fontSize: 12,
      marginLeft: 8,
      marginTop: 2,
    },
  });
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <Header title="Relatórios" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePreviousMonth} style={{ padding: 8 }}>
            <ChevronLeft size={24} color={currentTheme.text} />
          </TouchableOpacity>
          
          <View style={styles.monthSelector}>
            <Calendar size={20} color={currentTheme.primary} />
            <Text style={[styles.monthText, { color: currentTheme.text }]}>
              {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </Text>
          </View>
          
          <TouchableOpacity onPress={handleNextMonth} style={{ padding: 8 }}>
            <ChevronRight size={24} color={currentTheme.text} />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={currentTheme.primary} />
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: currentTheme.surface }]}>
                <Text style={[styles.statValue, { color: currentTheme.primary }]}>
                  {totalEvents}
                </Text>
                <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>
                  Eventos
                </Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: currentTheme.surface }]}>
                <Text style={[styles.statValue, { color: currentTheme.primary }]}>
                  {totalHours}h
                </Text>
                <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>
                  Horas Trabalhadas
                </Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: currentTheme.surface }]}>
                <Text style={[styles.statValue, { color: currentTheme.primary }]}>
                  {formatCurrency(totalEarnings)}
                </Text>
                <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>
                  Ganhos Totais
                </Text>
              </View>
            </View>
            
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                Eventos do Mês
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.filterButton, 
                  { 
                    backgroundColor: paymentFilter !== 'all' 
                      ? currentTheme.primary 
                      : currentTheme.surface 
                  }
                ]}
                onPress={togglePaymentFilter}
              >
                <Text style={[
                  styles.filterButtonText, 
                  { 
                    color: paymentFilter !== 'all' 
                      ? '#000' 
                      : currentTheme.text 
                  }
                ]}>
                  {paymentFilter === 'all' ? 'Todos' : 
                   paymentFilter === 'paid' ? 'Pagos' : 'Pendentes'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {filteredServices.length > 0 ? (
              <FlatList
                data={filteredServices}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : (
              <View style={[styles.emptyContainer, { backgroundColor: currentTheme.surface, borderRadius: 12 }]}>
                <FileText size={48} color={currentTheme.textSecondary} />
                <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
                  {services.length > 0 
                    ? `Nenhum evento ${paymentFilter === 'paid' ? 'pago' : 'pendente'} encontrado.`
                    : 'Nenhum evento encontrado para este mês.'}
                </Text>
                <Text style={[{ color: currentTheme.textSecondary, textAlign: 'center' }]}>
                  {services.length > 0 
                    ? 'Tente outro filtro ou selecione outro mês.'
                    : 'Selecione outro mês ou verifique se você tem eventos agendados.'}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
      
      {/* Modal de Detalhes do Serviço */}
      <Modal
        visible={detailsModalVisible}
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
                    Detalhes do Serviço
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
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                      Horários
                    </Text>
                    
                    <View style={styles.timeCard}>
                      <Text style={[styles.timeCardTitle, { color: currentTheme.text }]}>
                        Horário Previsto
                      </Text>
                      <View style={styles.detailRow}>
                        <Clock size={18} color={currentTheme.primary} />
                        <Text style={[styles.detailText, { color: currentTheme.text }]}>
                          Chegada: {formatTime(selectedService.arriveMashguiachTime)}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Clock size={18} color={currentTheme.primary} />
                        <Text style={[styles.detailText, { color: currentTheme.text }]}>
                          Saída: {formatTime(selectedService.endMashguiachTime)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.timeCard}>
                      <Text style={[styles.timeCardTitle, { color: currentTheme.text }]}>
                        Check-in e Check-out
                      </Text>
                      
                      {/* Chegada */}
                      <View style={styles.detailRow}>
                        {selectedService.reallyMashguiachArrive ? (
                          <CheckCircle size={18} color="#10B981" />
                        ) : (
                          <AlertCircle size={18} color="#F59E0B" />
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.detailText, { color: currentTheme.text }]}>
                            Chegada: {selectedService.reallyMashguiachArrive 
                              ? formatTime(selectedService.reallyMashguiachArrive)
                              : 'Não registrado'}
                          </Text>
                          
                          {selectedService.reallyMashguiachArrive && (
                            <Text style={[styles.timeStatus, { 
                              color: calculateTimeDifference(selectedService.arriveMashguiachTime, selectedService.reallyMashguiachArrive) && 
                                    calculateTimeDifference(selectedService.arriveMashguiachTime, selectedService.reallyMashguiachArrive)! > 15 
                                ? '#EF4444' : '#10B981' 
                            }]}>
                              {calculateTimeDifference(selectedService.arriveMashguiachTime, selectedService.reallyMashguiachArrive) 
                                ? calculateTimeDifference(selectedService.arriveMashguiachTime, selectedService.reallyMashguiachArrive)! > 0
                                  ? `${Math.abs(calculateTimeDifference(selectedService.arriveMashguiachTime, selectedService.reallyMashguiachArrive)!)} minutos atrasado`
                                  : `${Math.abs(calculateTimeDifference(selectedService.arriveMashguiachTime, selectedService.reallyMashguiachArrive)!)} minutos adiantado`
                                : 'No horário'}
                            </Text>
                          )}
                        </View>
                      </View>
                      
                      {/* Saída */}
                      <View style={styles.detailRow}>
                        {selectedService.reallyMashguiachEndTime ? (
                          <CheckCircle size={18} color="#10B981" />
                        ) : (
                          <AlertCircle size={18} color="#F59E0B" />
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.detailText, { color: currentTheme.text }]}>
                            Saída: {selectedService.reallyMashguiachEndTime 
                              ? formatTime(selectedService.reallyMashguiachEndTime)
                              : 'Não registrado'}
                          </Text>
                          
                          {selectedService.reallyMashguiachEndTime && (
                            <Text style={[styles.timeStatus, { 
                              color: calculateTimeDifference(selectedService.endMashguiachTime, selectedService.reallyMashguiachEndTime) && 
                                    calculateTimeDifference(selectedService.endMashguiachTime, selectedService.reallyMashguiachEndTime)! < -15 
                                ? '#EF4444' : '#10B981' 
                            }]}>
                              {calculateTimeDifference(selectedService.endMashguiachTime, selectedService.reallyMashguiachEndTime) 
                                ? calculateTimeDifference(selectedService.endMashguiachTime, selectedService.reallyMashguiachEndTime)! > 0
                                  ? `${Math.abs(calculateTimeDifference(selectedService.endMashguiachTime, selectedService.reallyMashguiachEndTime)!)} minutos depois do previsto`
                                  : `${Math.abs(calculateTimeDifference(selectedService.endMashguiachTime, selectedService.reallyMashguiachEndTime)!)} minutos antes do previsto`
                                : 'No horário'}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
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
                    
                    <View style={[
                      styles.paymentStatusBadge, 
                      { 
                        backgroundColor: getPaymentStatusColor(selectedService.paymentStatus).bg,
                        alignSelf: 'flex-start',
                        marginTop: 8
                      }
                    ]}>
                      <Text style={[
                        styles.paymentStatusText, 
                        { color: getPaymentStatusColor(selectedService.paymentStatus).text }
                      ]}>
                        {getPaymentStatusText(selectedService.paymentStatus)}
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
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 