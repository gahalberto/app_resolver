import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, Keyboard, Modal, ScrollView, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Header } from "@/components/Header";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/server/api";
import { useUser } from "@/contexts/UserContext";
import { Search, ChevronLeft, MapPin, Clock, User, Calendar, Tag, CheckCircle, XCircle, DollarSign, Briefcase, CalendarClock, Edit, CalendarPlus, CalendarCheck, Filter } from "lucide-react-native";
import { router, useNavigation } from "expo-router";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Mashguiach {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: boolean;
  address_city: string;
  address_state: string;
  avatar_url: string;
}

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
  workType: string;
  address_city: string;
  address_state: string;
  address_neighbor: string;
  address_number: string;
  address_street: string;
  address_zipcode: string;
  Mashguiach: Mashguiach;
  StoreEvents: {
    id: string;
    title: string;
    date: string;
    nrPax: number;
    clientName: string;
    eventType: string;
    serviceType: string;
    isApproved: boolean;
    responsableTelephone: string;
  };
}

interface ServicesResponse {
  services: Service[];
  message?: string;
}

interface MashguiachResponse {
  mashguichim: Mashguiach[];
  message?: string;
}

export default function ServicesPage() {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  const navigation = useNavigation();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [mashguichim, setMashguichim] = useState<Mashguiach[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMashguiach, setSelectedMashguiach] = useState<string | null>(null);
  const [selectedMashguiachName, setSelectedMashguiachName] = useState<string>('');
  const [navigating, setNavigating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Definindo os estilos dentro do componente para ter acesso ao currentTheme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 80, // Aumentado para dar mais espaço no final
    },
    header: {
      marginBottom: 24,
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
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    backButtonText: {
      color: currentTheme.primary,
      marginLeft: 4,
      fontSize: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      height: 48,
      color: currentTheme.text,
      paddingLeft: 8,
    },
    searchButton: {
      backgroundColor: currentTheme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      marginLeft: 8,
    },
    mashguichimContainer: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.text,
      marginBottom: 12,
    },
    mashguichimList: {
      paddingBottom: 8,
    },
    mashguiachItem: {
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      padding: 12,
      marginRight: 12,
      minWidth: 150,
    },
    mashguiachName: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.text,
      marginBottom: 4,
    },
    mashguiachEmail: {
      fontSize: 12,
      color: currentTheme.textSecondary,
    },
    selectedMashguiachContainer: {
      marginBottom: 16,
    },
    selectedMashguiachTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.text,
    },
    selectedMashguiachName: {
      color: currentTheme.primary,
    },
    cardInstructionText: {
      color: currentTheme.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },
    servicesList: {
      paddingBottom: 16,
    },
    serviceCard: {
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 20,
      paddingBottom: 24,
      marginBottom: 40,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    serviceCardPressed: {
      backgroundColor: currentTheme.surfaceLight,
      transform: [{ scale: 0.98 }],
    },
    serviceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    serviceTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.text,
      flex: 1,
      marginRight: 8,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 14,
      marginLeft: 4,
    },
    divider: {
      height: 1,
      backgroundColor: currentTheme.surfaceLight,
      marginVertical: 12,
    },
    editButtonDivider: {
      height: 1.5,
      backgroundColor: currentTheme.surfaceLight,
      marginTop: 20,
      marginBottom: 20,
    },
    serviceInfo: {
      gap: 8,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoText: {
      fontSize: 14,
      color: currentTheme.text,
      marginLeft: 8,
    },
    observationContainer: {
      marginTop: 4,
    },
    observationTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.text,
      marginBottom: 4,
    },
    observationText: {
      fontSize: 14,
      color: currentTheme.textSecondary,
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyText: {
      color: currentTheme.textSecondary,
      textAlign: 'center',
      fontSize: 16,
    },
    errorContainer: {
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: currentTheme.error || '#FF6B6B',
      textAlign: 'center',
      fontSize: 14,
      marginBottom: 8,
    },
    retryButton: {
      backgroundColor: currentTheme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      alignSelf: 'center',
      marginTop: 8,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontWeight: '500',
      fontSize: 14,
    },
    editButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 20,
      padding: 14,
      backgroundColor: 'rgba(130, 87, 229, 0.15)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(130, 87, 229, 0.3)',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    editButtonText: {
      color: currentTheme.primary,
      marginLeft: 8,
      fontSize: 15,
      fontWeight: '600',
    },
    navigatingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    navigatingText: {
      color: '#FFFFFF',
      marginTop: 16,
      fontSize: 16,
    },
    editButtonWrapper: {
      paddingTop: 10,
      paddingBottom: 10,
    },
    filterContainer: {
      flexDirection: 'row',
      marginTop: 8,
      marginBottom: 20,
      flexWrap: 'wrap',
      backgroundColor: currentTheme.surfaceLight,
      padding: 12,
      borderRadius: 8,
    },
    filterButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 10,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      elevation: 2,
    },
    filterButtonActive: {
      backgroundColor: currentTheme.primary,
    },
    filterButtonInactive: {
      backgroundColor: currentTheme.surfaceLight,
    },
    filterText: {
      color: '#FFFFFF',
      marginLeft: 4,
      fontWeight: '500',
    },
    filterResultContainer: {
      marginBottom: 16,
      height: 24, // Altura fixa para evitar saltos no layout
    },
    filterResultText: {
      fontSize: 16,
      color: currentTheme.text,
    },
    filterResultCount: {
      fontWeight: 'bold',
      color: currentTheme.primary,
    },
    filterLoadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    filterLoadingText: {
      marginLeft: 8,
      fontSize: 14,
      color: currentTheme.textSecondary,
    },
    filterSectionContainer: {
      marginBottom: 16,
    },
    filterSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    filterSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.text,
      marginLeft: 8,
    },
    noResultsContainer: {
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      marginBottom: 20,
    },
    noResultsText: {
      color: currentTheme.textSecondary,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 16,
    },
    resetFilterButton: {
      backgroundColor: currentTheme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    resetFilterButtonText: {
      color: '#FFFFFF',
      fontWeight: '500',
    },
  });

  useEffect(() => {
    if (user && user.token) {
      fetchMashguichim();
    } else {
      setError("Usuário não autenticado. Faça login novamente.");
    }
  }, [user]);

  useEffect(() => {
    if (selectedMashguiach && user && user.token) {
      fetchServices(selectedMashguiach);
    }
  }, [selectedMashguiach, user]);

  useEffect(() => {
    if (services.length > 0) {
      applyFilter(activeFilter);
    }
  }, [services, activeFilter]);

  const fetchMashguichim = async () => {
    try {
      setLoading(true);
      console.log("Buscando mashguichim...");
      const response = await api.get<MashguiachResponse>('/admin/getAllMashguichim', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      console.log("Resposta da API (mashguichim):", JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.mashguichim) {
        setMashguichim(response.data.mashguichim);
        setError(null);
      } else {
        console.error("Resposta da API não contém mashguichim:", response.data);
        setError("Formato de resposta inesperado ao buscar mashguichim");
        setMashguichim([]);
      }
    } catch (err) {
      console.error("Erro ao buscar mashguichim:", err);
      if (err instanceof Error) {
        console.error("Mensagem de erro:", err.message);
        console.error("Stack trace:", err.stack);
      }
      setError("Não foi possível carregar a lista de mashguichim");
      setMashguichim([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (mashguiachId: string) => {
    try {
      setLoading(true);
      console.log(`Buscando serviços para mashguiach ${mashguiachId}...`);
      const response = await api.get<ServicesResponse>(`/admin/getServicesByMashguiachId`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
        params: {
          mashguiachId
        }
      });
      
      console.log("Resposta da API (serviços):", JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.services) {
        setServices(response.data.services);
        setError(null);
      } else {
        console.error("Resposta da API não contém services:", response.data);
        setError("Formato de resposta inesperado ao buscar serviços");
        setServices([]);
      }
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
      if (err instanceof Error) {
        console.error("Mensagem de erro:", err.message);
        console.error("Stack trace:", err.stack);
      }
      setError("Não foi possível carregar a lista de serviços");
      setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    if (selectedMashguiach) {
      fetchServices(selectedMashguiach);
    } else {
      setRefreshing(false);
    }
  }, [selectedMashguiach]);

  const handleSearch = () => {
    const filteredMashguiach = mashguichim.find(
      m => m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filteredMashguiach) {
      setSelectedMashguiach(filteredMashguiach.id);
      setSelectedMashguiachName(filteredMashguiach.name);
    } else {
      Alert.alert("Mashguiach não encontrado", "Nenhum mashguiach encontrado com esse nome.");
    }
    
    Keyboard.dismiss();
  };

  const handleMashguiachSelect = (mashguiach: Mashguiach) => {
    setSelectedMashguiach(mashguiach.id);
    setSelectedMashguiachName(mashguiach.name);
    setSearchQuery('');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "HH:mm", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return currentTheme.success;
      case 'pending':
        return currentTheme.warning;
      default:
        return currentTheme.textSecondary;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  const getStatusColor = (isApproved: boolean) => {
    return isApproved ? currentTheme.success : currentTheme.warning;
  };

  const getStatusText = (isApproved: boolean) => {
    return isApproved ? "Aprovado" : "Pendente";
  };

  const getStatusIcon = (isApproved: boolean) => {
    return isApproved ? (
      <CheckCircle size={14} color={currentTheme.success} />
    ) : (
      <XCircle size={14} color={currentTheme.warning} />
    );
  };

  const applyFilter = (filter: string) => {
    setFilterLoading(true);
    
    setTimeout(() => {
      const today = new Date();
      
      switch (filter) {
        case 'today':
          // Filtrar eventos de hoje
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
          
          setFilteredServices(services.filter(service => {
            const eventDate = new Date(service.StoreEvents.date);
            return eventDate >= todayStart && eventDate <= todayEnd;
          }));
          break;
          
        case 'month':
          // Filtrar eventos do mês atual
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
          
          setFilteredServices(services.filter(service => {
            const eventDate = new Date(service.StoreEvents.date);
            return eventDate >= monthStart && eventDate <= monthEnd;
          }));
          break;
          
        case 'upcoming':
          // Filtrar eventos a partir de hoje
          const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          
          setFilteredServices(services.filter(service => {
            const eventDate = new Date(service.StoreEvents.date);
            return eventDate >= startOfToday;
          }));
          break;
          
        default:
          // Mostrar todos os eventos
          setFilteredServices(services);
          break;
      }
      
      setFilterLoading(false);
    }, 300); // Pequeno atraso para mostrar o indicador de carregamento
  };

  const handleFilterChange = (newFilter: string) => {
    setActiveFilter(newFilter);
  };

  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'today':
        return 'Eventos de Hoje';
      case 'month':
        return 'Eventos do Mês';
      case 'upcoming':
        return 'Próximos Eventos';
      default:
        return 'Todos os Eventos';
    }
  };

  const renderMashguiachItem = ({ item }: { item: Mashguiach }) => (
    <TouchableOpacity 
      style={styles.mashguiachItem}
      onPress={() => handleMashguiachSelect(item)}
    >
      <Text style={styles.mashguiachName}>{item.name}</Text>
      <Text style={styles.mashguiachEmail}>{item.email}</Text>
    </TouchableOpacity>
  );

  const renderServiceItem = ({ item }: { item: Service }) => (
    <Pressable 
      style={({ pressed }) => [
        styles.serviceCard,
        pressed && styles.serviceCardPressed
      ]}
      onPress={() => handleServicePress(item)}
    >
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceTitle}>{item.StoreEvents.title}</Text>
        <View style={styles.statusContainer}>
          {getStatusIcon(item.isApproved)}
          <Text style={[styles.statusText, { color: getStatusColor(item.isApproved) }]}>
            {getStatusText(item.isApproved)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.serviceInfo}>
        <View style={styles.infoRow}>
          <Calendar size={16} color={currentTheme.text} />
          <Text style={styles.infoText}>
            Data: {formatDate(item.StoreEvents.date)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Clock size={16} color={currentTheme.text} />
          <Text style={styles.infoText}>
            Horário: {formatTime(item.arriveMashguiachTime)} - {formatTime(item.endMashguiachTime)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <User size={16} color={currentTheme.text} />
          <Text style={styles.infoText}>
            Cliente: {item.StoreEvents.clientName}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Tag size={16} color={currentTheme.text} />
          <Text style={styles.infoText}>
            Tipo: {item.StoreEvents.eventType}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Briefcase size={16} color={currentTheme.text} />
          <Text style={styles.infoText}>
            Serviço: {item.StoreEvents.serviceType}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MapPin size={16} color={currentTheme.text} />
          <Text style={styles.infoText}>
            Local: {item.address_city}, {item.address_state}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <DollarSign size={16} color={currentTheme.text} />
          <Text style={styles.infoText}>
            Valor: R$ {item.mashguiachPrice.toFixed(2)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <CalendarClock size={16} color={currentTheme.text} />
          <Text style={styles.infoText}>
            Status de Pagamento: 
            <Text style={{ color: getPaymentStatusColor(item.paymentStatus) }}>
              {" "}{getPaymentStatusText(item.paymentStatus)}
            </Text>
          </Text>
        </View>
      </View>

      {item.observationText && (
        <>
          <View style={styles.divider} />
          <View style={styles.observationContainer}>
            <Text style={styles.observationTitle}>Observações:</Text>
            <Text style={styles.observationText}>{item.observationText}</Text>
          </View>
        </>
      )}

      <View style={styles.editButtonDivider} />
      <View style={styles.editButtonWrapper}>
        <View style={styles.editButtonContainer}>
          <Edit size={18} color={currentTheme.primary} />
          <Text style={styles.editButtonText}>Editar evento</Text>
        </View>
      </View>
    </Pressable>
  );

  const handleServicePress = (service: Service) => {
    // Mostrar confirmação antes de navegar
    Alert.alert(
      "Editar Evento",
      `Deseja editar o evento "${service.StoreEvents.title}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Editar",
          onPress: () => {
            // Mostrar indicador de carregamento
            setNavigating(true);
            
            // Pequeno atraso para mostrar o feedback visual
            setTimeout(() => {
              // Navegar para a página de edição de eventos usando o ID do evento
              // Usando push em vez de replace para manter o histórico de navegação
              router.push(`/admin/events/${service.StoreEventsId}`);
              
              // Resetar o estado de navegação (embora a página já tenha sido desmontada neste ponto)
              setNavigating(false);
            }, 300);
          }
        }
      ]
    );
  };

  const renderMashguichimList = () => {
    if (loading && mashguichim.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={{ color: currentTheme.text, marginTop: 16 }}>Carregando mashguichim...</Text>
        </View>
      );
    }

    return (
      <View style={styles.mashguichimContainer}>
        <Text style={styles.sectionTitle}>Selecione um Mashguiach</Text>
        <FlatList
          data={mashguichim}
          renderItem={renderMashguiachItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mashguichimList}
        />
      </View>
    );
  };

  const renderServicesList = () => {
    if (!selectedMashguiach) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Selecione um mashguiach para ver seus serviços</Text>
        </View>
      );
    }

    if (loading && services.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={{ color: currentTheme.text, marginTop: 16 }}>Carregando serviços...</Text>
        </View>
      );
    }

    if (services.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum serviço encontrado para este mashguiach</Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.filterSectionContainer}>
          <View style={styles.filterSectionHeader}>
            <Filter size={16} color={currentTheme.text} />
            <Text style={styles.filterSectionTitle}>Filtrar serviços</Text>
          </View>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === 'all' ? styles.filterButtonActive : styles.filterButtonInactive
              ]}
              onPress={() => handleFilterChange('all')}
              disabled={filterLoading}
            >
              <Calendar size={16} color="#FFFFFF" />
              <Text style={styles.filterText}>Todos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === 'today' ? styles.filterButtonActive : styles.filterButtonInactive
              ]}
              onPress={() => handleFilterChange('today')}
              disabled={filterLoading}
            >
              <Clock size={16} color="#FFFFFF" />
              <Text style={styles.filterText}>Hoje</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === 'upcoming' ? styles.filterButtonActive : styles.filterButtonInactive
              ]}
              onPress={() => handleFilterChange('upcoming')}
              disabled={filterLoading}
            >
              <CalendarPlus size={16} color="#FFFFFF" />
              <Text style={styles.filterText}>Próximos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === 'month' ? styles.filterButtonActive : styles.filterButtonInactive
              ]}
              onPress={() => handleFilterChange('month')}
              disabled={filterLoading}
            >
              <CalendarClock size={16} color="#FFFFFF" />
              <Text style={styles.filterText}>Mês</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterResultContainer}>
          {filterLoading ? (
            <View style={styles.filterLoadingContainer}>
              <ActivityIndicator size="small" color={currentTheme.primary} />
              <Text style={styles.filterLoadingText}>Aplicando filtro...</Text>
            </View>
          ) : (
            <Text style={styles.filterResultText}>
              {getFilterTitle()}: <Text style={styles.filterResultCount}>{filteredServices.length}</Text> serviço(s)
            </Text>
          )}
        </View>

        {filteredServices.length > 0 ? (
          filteredServices.map(item => (
            <React.Fragment key={item.id}>
              {renderServiceItem({ item })}
            </React.Fragment>
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>Nenhum serviço encontrado para o filtro selecionado</Text>
            <TouchableOpacity 
              style={styles.resetFilterButton}
              onPress={() => handleFilterChange('all')}
            >
              <Text style={styles.resetFilterButtonText}>Mostrar todos os serviços</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  const handleBackPress = () => {
    // Verifica se há uma página anterior no histórico
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Se não houver página anterior, volta para o dashboard
      router.replace('/admin');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Serviços por Mashguiach" />
      {navigating && (
        <View style={styles.navigatingOverlay}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={styles.navigatingText}>Carregando evento...</Text>
        </View>
      )}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[currentTheme.primary]}
          />
        }
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ChevronLeft size={20} color={currentTheme.primary} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Serviços por Mashguiach</Text>
          <Text style={styles.subtitle}>Visualize os serviços atribuídos a cada mashguiach</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                if (selectedMashguiach) {
                  fetchServices(selectedMashguiach);
                } else {
                  fetchMashguichim();
                }
              }}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar mashguiach por nome..."
            placeholderTextColor={currentTheme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Search size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {renderMashguichimList()}

        {selectedMashguiach && (
          <View style={styles.selectedMashguiachContainer}>
            <Text style={styles.selectedMashguiachTitle}>
              Serviços de: <Text style={styles.selectedMashguiachName}>{selectedMashguiachName}</Text>
            </Text>
            <Text style={styles.cardInstructionText}>
              Toque em um serviço para editar o evento correspondente
            </Text>
          </View>
        )}

        {renderServicesList()}
      </ScrollView>
    </SafeAreaView>
  );
} 