import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, Keyboard, Modal, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Header } from "@/components/Header";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/server/api";
import { useUser } from "@/contexts/UserContext";
import { Calendar, Search, ChevronLeft, MapPin, Clock, User, Users, Tag, CheckCircle, XCircle, Filter, CalendarClock, AlertTriangle, X, Save } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { format, parseISO, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

interface Store {
  id: string;
  title: string;
}

interface EventOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
}

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

interface EventsResponse {
  success: boolean;
  events: Event[];
  totalCount: number;
  hasMore: boolean;
  message?: string;
}

export default function EventsPage() {
  const { theme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>(filter || 'all');
  const limit = 10;
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});

  useEffect(() => {
    if (filter) {
      setActiveFilter(filter);
    }
    fetchEvents();
  }, [user, filter]);

  const getFilterParams = () => {
    const today = new Date();
    const params: any = {
      page,
      limit,
      search: searchQuery || undefined
    };

    switch (activeFilter) {
      case 'today':
        params.startDate = startOfDay(today).toISOString();
        params.endDate = endOfDay(today).toISOString();
        break;
      case 'month':
        params.startDate = startOfMonth(today).toISOString();
        params.endDate = endOfMonth(today).toISOString();
        break;
      case 'pending':
        params.status = 'pending';
        break;
      case 'approved':
        params.status = 'approved';
        break;
      default:
        // 'all' - não adiciona filtros extras
        break;
    }

    return params;
  };

  const fetchEvents = async (pageToFetch = 1, shouldRefresh = false) => {
    try {
      if (pageToFetch === 1) {
        setLoading(true);
      }
      
      const params = getFilterParams();
      params.page = pageToFetch;
      
      const response = await api.get<EventsResponse>('/admin/getAllEvents', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
        params
      });
      
      if (response.data.success) {
        if (shouldRefresh || pageToFetch === 1) {
          setEvents(response.data.events);
        } else {
          setEvents(prev => [...prev, ...response.data.events]);
        }
        setHasMore(response.data.hasMore);
        setTotalCount(response.data.totalCount);
        setError(null);
      } else {
        throw new Error(response.data.message || "Erro ao buscar eventos");
      }
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
      setError("Não foi possível carregar a lista de eventos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setSearchQuery(tempSearchQuery);
    setPage(1);
    setEvents([]);
    fetchEvents(1);
    Keyboard.dismiss();
  };

  const handleSearchInputChange = (text: string) => {
    setTempSearchQuery(text);
  };

  const handleFilterChange = (newFilter: string) => {
    setActiveFilter(newFilter);
    setPage(1);
    setEvents([]);
    fetchEvents(1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchEvents(nextPage);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchEvents(1, true);
  }, []);

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
      return "";
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

  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'today':
        return 'Eventos de Hoje';
      case 'month':
        return 'Eventos do Mês';
      case 'pending':
        return 'Eventos Pendentes';
      case 'approved':
        return 'Eventos Aprovados';
      default:
        return 'Todos os Eventos';
    }
  };

  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    setEditedEvent({
      title: event.title,
      responsable: event.responsable,
      date: event.date,
      nrPax: event.nrPax,
      clientName: event.clientName,
      eventType: event.eventType,
      serviceType: event.serviceType,
      isApproved: event.isApproved,
      storeId: event.storeId,
      responsableTelephone: event.responsableTelephone,
      address_city: event.address_city || '',
      address_neighbor: event.address_neighbor || '',
      address_number: event.address_number || '',
      address_state: event.address_state || '',
      address_street: event.address_street || '',
      address_zipcode: event.address_zipcode || '',
      menuUrl: event.menuUrl || '',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
    setEditedEvent({});
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      setLoading(true);
      
      // Preparar dados para envio
      const eventData = {
        id: selectedEvent.id,
        ...editedEvent
      };
      
      // Usar o endpoint para salvar evento
      const response = await api.put('/admin/updateEvent', eventData, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (response.data.success) {
        // Atualiza a lista local
        setEvents(prev => 
          prev.map(item => 
            item.id === selectedEvent.id 
              ? { ...item, ...editedEvent } 
              : item
          )
        );
        
        Alert.alert("Sucesso", "Dados do evento atualizados com sucesso");
        closeModal();
        setError(null);
      } else {
        throw new Error(response.data.message || "Erro ao atualizar evento");
      }
    } catch (err) {
      console.error("Erro ao atualizar evento:", err);
      setError("Não foi possível atualizar os dados do evento");
      Alert.alert("Erro", "Não foi possível atualizar os dados do evento");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    content: {
      padding: 16,
      flex: 1,
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
    searchButtonText: {
      color: '#FFFFFF',
      fontWeight: '500',
    },
    listContainer: {
      flex: 1,
    },
    eventCard: {
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
      flex: 1,
      marginRight: 8,
    },
    eventDate: {
      fontSize: 14,
      color: '#FFFFFF',
      marginTop: 2,
    },
    eventInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    eventInfoText: {
      fontSize: 14,
      color: '#FFFFFF',
      marginLeft: 6,
    },
    eventStore: {
      fontSize: 14,
      color: '#FFFFFF',
      marginLeft: 6,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: currentTheme.surfaceLight,
      marginVertical: 8,
    },
    servicesHeader: {
      fontSize: 14,
      fontWeight: '500',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    serviceItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 8,
      padding: 8,
      marginBottom: 8,
    },
    serviceTime: {
      fontSize: 13,
      color: '#FFFFFF',
      marginBottom: 4,
    },
    serviceType: {
      fontSize: 13,
      color: '#FFFFFF',
      marginBottom: 4,
    },
    serviceStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 13,
      marginLeft: 4,
      color: '#FFFFFF',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: currentTheme.error,
      textAlign: 'center',
      marginTop: 20,
    },
    emptyText: {
      color: currentTheme.textSecondary,
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 20,
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
    footer: {
      padding: 16,
      alignItems: 'center',
    },
    paginationInfo: {
      color: currentTheme.textSecondary,
      marginTop: 8,
    },
    filterContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
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
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
    },
    modalContent: {
      backgroundColor: currentTheme.background,
      borderRadius: 12,
      margin: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.surfaceLight,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.text,
    },
    closeButton: {
      padding: 4,
    },
    modalBody: {
      padding: 16,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      color: currentTheme.textSecondary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      padding: 12,
      color: currentTheme.text,
      borderWidth: 1,
      borderColor: currentTheme.surfaceLight,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: currentTheme.surfaceLight,
    },
    saveButton: {
      backgroundColor: currentTheme.primary,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 8,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: currentTheme.surfaceLight,
    },
    switchLabel: {
      fontSize: 14,
      color: currentTheme.text,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.text,
      marginTop: 16,
      marginBottom: 12,
    },
  });

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => router.push(`/admin/events/${item.id}` as any)}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
      </View>
      
      <View style={styles.eventInfo}>
        <Calendar size={16} color="#FFFFFF" />
        <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
      </View>
      
      <View style={styles.eventInfo}>
        <MapPin size={16} color="#FFFFFF" />
        <Text style={styles.eventStore}>{item.store.title}</Text>
      </View>
      
      <View style={styles.eventInfo}>
        <User size={16} color="#FFFFFF" />
        <Text style={styles.eventInfoText}>Responsável: {item.responsable}</Text>
      </View>
      
      <View style={styles.eventInfo}>
        <Users size={16} color="#FFFFFF" />
        <Text style={styles.eventInfoText}>Participantes: {item.nrPax}</Text>
      </View>
      
      <View style={styles.eventInfo}>
        <Tag size={16} color="#FFFFFF" />
        <Text style={styles.eventInfoText}>Tipo: {item.eventType}</Text>
      </View>
      
      <View style={styles.eventInfo}>
        {getStatusIcon(item.isApproved)}
        <Text style={[styles.statusText, { color: getStatusColor(item.isApproved) }]}>
          {getStatusText(item.isApproved)}
        </Text>
      </View>
      
      {item.EventsServices && item.EventsServices.length > 0 && (
        <>
          <View style={styles.divider} />
          <Text style={styles.servicesHeader}>
            Serviços ({item.EventsServices.length})
          </Text>
          
          {item.EventsServices.slice(0, 2).map((service, index) => (
            <View key={service.id} style={styles.serviceItem}>
              <Text style={styles.serviceTime}>
                <Clock size={14} color="#FFFFFF" /> {formatTime(service.arriveMashguiachTime)} - {formatTime(service.endMashguiachTime)}
              </Text>
              <Text style={styles.serviceType}>Tipo: {service.workType}</Text>
              <View style={styles.serviceStatus}>
                {getStatusIcon(service.isApproved)}
                <Text style={[styles.statusText, { color: getStatusColor(service.isApproved) }]}>
                  {getStatusText(service.isApproved)}
                </Text>
              </View>
            </View>
          ))}
          
          {item.EventsServices.length > 2 && (
            <Text style={{ color: currentTheme.primary, fontSize: 13, textAlign: 'center' }}>
              + {item.EventsServices.length - 2} serviços
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={currentTheme.primary} />
      </View>
    );
  };

  if (loading && events.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Eventos" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={{ color: currentTheme.text, marginTop: 16 }}>Carregando eventos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Eventos" />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color={currentTheme.primary} />
          <Text style={styles.backButtonText}>Voltar para Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{getFilterTitle()}</Text>
          <Text style={styles.subtitle}>Gerenciar eventos do sistema</Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'all' ? styles.filterButtonActive : styles.filterButtonInactive
            ]}
            onPress={() => handleFilterChange('all')}
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
          >
            <Clock size={16} color="#FFFFFF" />
            <Text style={styles.filterText}>Hoje</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'month' ? styles.filterButtonActive : styles.filterButtonInactive
            ]}
            onPress={() => handleFilterChange('month')}
          >
            <CalendarClock size={16} color="#FFFFFF" />
            <Text style={styles.filterText}>Mês</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'pending' ? styles.filterButtonActive : styles.filterButtonInactive
            ]}
            onPress={() => handleFilterChange('pending')}
          >
            <AlertTriangle size={16} color="#FFFFFF" />
            <Text style={styles.filterText}>Pendentes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'approved' ? styles.filterButtonActive : styles.filterButtonInactive
            ]}
            onPress={() => handleFilterChange('approved')}
          >
            <CheckCircle size={16} color="#FFFFFF" />
            <Text style={styles.filterText}>Aprovados</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={currentTheme.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título ou cliente"
            placeholderTextColor={currentTheme.textSecondary}
            value={tempSearchQuery}
            onChangeText={handleSearchInputChange}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : events.length === 0 ? (
          <Text style={styles.emptyText}>
            {searchQuery ? "Nenhum evento encontrado" : "Não há eventos cadastrados"}
          </Text>
        ) : (
          <>
            <FlatList
              data={events}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={styles.listContainer}
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[currentTheme.primary]}
                  tintColor={currentTheme.primary}
                />
              }
            />
            <Text style={styles.paginationInfo}>
              Mostrando {events.length} de {totalCount} eventos
            </Text>
          </>
        )}
      </View>

      {/* Modal para edição de evento */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Evento</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <X size={24} color={currentTheme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Título do Evento</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.title}
                  onChangeText={(text) => handleInputChange('title', text)}
                  placeholder="Título do evento"
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome do Cliente</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.clientName}
                  onChangeText={(text) => handleInputChange('clientName', text)}
                  placeholder="Nome do cliente"
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Responsável</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.responsable}
                  onChangeText={(text) => handleInputChange('responsable', text)}
                  placeholder="Nome do responsável"
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Telefone do Responsável</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.responsableTelephone}
                  onChangeText={(text) => handleInputChange('responsableTelephone', text)}
                  placeholder="Telefone do responsável"
                  placeholderTextColor={currentTheme.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Número de Participantes</Text>
                <TextInput
                  style={styles.input}
                  value={String(editedEvent.nrPax || '')}
                  onChangeText={(text) => handleInputChange('nrPax', parseInt(text) || 0)}
                  placeholder="Número de participantes"
                  placeholderTextColor={currentTheme.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo de Evento</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.eventType}
                  onChangeText={(text) => handleInputChange('eventType', text)}
                  placeholder="Tipo de evento"
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo de Serviço</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.serviceType}
                  onChangeText={(text) => handleInputChange('serviceType', text)}
                  placeholder="Tipo de serviço"
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Status do Evento</Text>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>
                    {editedEvent.isApproved ? "Aprovado" : "Pendente"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleInputChange('isApproved', !editedEvent.isApproved)}
                  >
                    <View style={{
                      width: 50,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: editedEvent.isApproved ? currentTheme.success : currentTheme.surfaceLight,
                      justifyContent: 'center',
                      paddingHorizontal: 2,
                    }}>
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: '#FFFFFF',
                        alignSelf: editedEvent.isApproved ? 'flex-end' : 'flex-start',
                      }} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.sectionTitle}>Endereço</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>CEP</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.address_zipcode}
                  onChangeText={(text) => handleInputChange('address_zipcode', text)}
                  placeholder="CEP"
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Rua</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.address_street}
                  onChangeText={(text) => handleInputChange('address_street', text)}
                  placeholder="Rua"
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Número</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.address_number}
                  onChangeText={(text) => handleInputChange('address_number', text)}
                  placeholder="Número"
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Bairro</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.address_neighbor}
                  onChangeText={(text) => handleInputChange('address_neighbor', text)}
                  placeholder="Bairro"
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.address_city}
                  onChangeText={(text) => handleInputChange('address_city', text)}
                  placeholder="Cidade"
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Estado</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.address_state}
                  onChangeText={(text) => handleInputChange('address_state', text)}
                  placeholder="Estado"
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>URL do Menu</Text>
                <TextInput
                  style={styles.input}
                  value={editedEvent.menuUrl}
                  onChangeText={(text) => handleInputChange('menuUrl', text)}
                  placeholder="URL do menu"
                  placeholderTextColor={currentTheme.textSecondary}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEvent}>
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 