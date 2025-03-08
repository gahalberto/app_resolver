import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, FlatList, Modal, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Header } from "@/components/Header";
import { api } from "@/server/api";
import { useUser } from "@/contexts/UserContext";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { ChevronLeft, Save, Calendar, Clock, User, MapPin, CheckCircle, XCircle, Edit, Trash, Calendar as CalendarIcon, ChevronDown, DollarSign } from "lucide-react-native";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomDateTimePicker from '@/components/CustomDateTimePicker';
import MashguiachSelector from '@/components/MashguiachSelector';
import AddressForm from '@/components/AddressForm';

interface Mashguiach {
  id: string;
  name: string;
  email: string;
  phone: string;
}

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
  latitude?: number | null;
  longitude?: number | null;
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

interface EventResponse {
  success: boolean;
  event: Event;
  message?: string;
}

interface AvailableMashguiach {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

export default function EventEditPage() {
  const { theme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [event, setEvent] = useState<Event | null>(null);
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<EventService | null>(null);
  const [editingService, setEditingService] = useState(false);
  const [editedService, setEditedService] = useState<Partial<EventService>>({});
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [availableMashguichim, setAvailableMashguichim] = useState<AvailableMashguiach[]>([]);
  const [showMashguiachDropdown, setShowMashguiachDropdown] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showPaymentStatusDropdown, setShowPaymentStatusDropdown] = useState(false);
  const [showWorkTypeDropdown, setShowWorkTypeDropdown] = useState(false);
  const [loadingMashguichim, setLoadingMashguichim] = useState(false);
  const [canSelectMashguiach, setCanSelectMashguiach] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id, user]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get<EventResponse>(`/admin/getEventById`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
        params: {
          id
        }
      });

      if (response.data.success) {
        setEvent(response.data.event);
        setEditedEvent({
          title: response.data.event.title,
          responsable: response.data.event.responsable,
          date: response.data.event.date,
          nrPax: response.data.event.nrPax,
          clientName: response.data.event.clientName,
          eventType: response.data.event.eventType,
          serviceType: response.data.event.serviceType,
          isApproved: response.data.event.isApproved,
          storeId: response.data.event.storeId,
          responsableTelephone: response.data.event.responsableTelephone,
          address_city: response.data.event.address_city || '',
          address_neighbor: response.data.event.address_neighbor || '',
          address_number: response.data.event.address_number || '',
          address_state: response.data.event.address_state || '',
          address_street: response.data.event.address_street || '',
          address_zipcode: response.data.event.address_zipcode || '',
          menuUrl: response.data.event.menuUrl || '',
        });
        setError(null);
      } else {
        throw new Error(response.data.message || "Erro ao buscar evento");
      }
    } catch (err) {
      console.error("Erro ao buscar evento:", err);
      setError("Não foi possível carregar os dados do evento");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEvent = async () => {
    try {
      setSaving(true);

      // Preparar dados para envio
      const eventData = {
        id,
        ...editedEvent
      };

      // Usar o endpoint para salvar evento
      const response = await api.put('/admin/updateEvent', eventData, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      if (response.data.success) {
        Alert.alert("Sucesso", "Dados do evento atualizados com sucesso");
        // Atualizar os dados do evento
        fetchEvent();
        setError(null);
      } else {
        throw new Error(response.data.message || "Erro ao atualizar evento");
      }
    } catch (err) {
      console.error("Erro ao atualizar evento:", err);
      setError("Não foi possível atualizar os dados do evento");
      Alert.alert("Erro", "Não foi possível atualizar os dados do evento");
    } finally {
      setSaving(false);
    }
  };

  const fetchAvailableMashguichim = async (startDateTime: string, endDateTime: string) => {
    try {
      setLoadingMashguichim(true);
      const response = await api.get('/admin/getMashguichimAvalaible', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
        params: {
          startDateTime,
          endDateTime
        }
      });

      if (response.data && Array.isArray(response.data.data)) {
        setAvailableMashguichim(response.data.data);
      }
    } catch (err) {
      console.error("Erro ao buscar mashguichim disponíveis:", err);
      Alert.alert("Erro", "Não foi possível carregar os mashguichim disponíveis");
    } finally {
      setLoadingMashguichim(false);
    }
  };

  const openServiceEditModal = (service: EventService) => {
    setSelectedService(service);
    setEditedService({
      ...service,
      arriveMashguiachTime: service.arriveMashguiachTime || new Date().toISOString(),
      endMashguiachTime: service.endMashguiachTime || new Date().toISOString(),
    });
    setServiceModalVisible(true);
    setShowMashguiachDropdown(false);
    setCanSelectMashguiach(!!service.arriveMashguiachTime && !!service.endMashguiachTime);
  };

  const closeServiceModal = () => {
    setServiceModalVisible(false);
    setSelectedService(null);
    setEditedService({});
    setShowMashguiachDropdown(false);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowPaymentStatusDropdown(false);
    setShowWorkTypeDropdown(false);
  };

  const handleServiceInputChange = (field: string, value: any) => {
    setEditedService(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceSave = async () => {
    if (!selectedService) return;

    try {
      setSaving(true);

      // Preparar dados para envio
      const serviceData = {
        id: selectedService.id,
        ...editedService
      };

      const response = await api.put('/admin/updateEventService', serviceData, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      if (response.data && response.data.success) {
        Alert.alert("Sucesso", "Serviço atualizado com sucesso");
        closeServiceModal();
        // Atualizar os dados do evento para refletir as mudanças
        fetchEvent();
      } else {
        throw new Error(response.data?.message || "Erro ao atualizar serviço");
      }
    } catch (err) {
      console.error("Erro ao atualizar serviço:", err);
      Alert.alert("Erro", "Não foi possível atualizar o serviço");
    } finally {
      setSaving(false);
    }
  };

  const onStartDateChange = (selectedDate: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString();
      setEditedService(prev => ({
        ...prev,
        arriveMashguiachTime: formattedDate
      }));

      // Verificar se ambas as datas estão selecionadas para habilitar a seleção de mashguichim
      if (editedService.endMashguiachTime) {
        setCanSelectMashguiach(true);
        // Buscar mashguichim disponíveis com as novas datas
        fetchAvailableMashguichim(formattedDate, editedService.endMashguiachTime);
      }
    }
  };

  const onEndDateChange = (selectedDate: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString();
      setEditedService(prev => ({
        ...prev,
        endMashguiachTime: formattedDate
      }));

      // Verificar se ambas as datas estão selecionadas para habilitar a seleção de mashguichim
      if (editedService.arriveMashguiachTime) {
        setCanSelectMashguiach(true);
        // Buscar mashguichim disponíveis com as novas datas
        fetchAvailableMashguichim(editedService.arriveMashguiachTime, formattedDate);
      }
    }
  };

  const selectMashguiach = (mashguichim: AvailableMashguiach) => {
    setEditedService(prev => ({
      ...prev,
      mashguiachId: mashguichim.id
    }));
    setShowMashguiachDropdown(false);
  };

  const getSelectedMashguiachName = () => {
    if (!editedService.mashguiachId) return "Selecione um mashguichim";

    const selectedMashguichim = availableMashguichim.find(m => m.id === editedService.mashguiachId);
    if (selectedMashguichim) return selectedMashguichim.name;

    // Se o mashguichim selecionado não estiver na lista de disponíveis
    // (pode acontecer se ele for o atualmente atribuído e não estiver disponível agora)
    if (selectedService?.Mashguiach) return selectedService.Mashguiach.name + " (atual)";

    return "Mashguichim não encontrado";
  };

  const selectPaymentStatus = (status: string) => {
    setEditedService(prev => ({
      ...prev,
      paymentStatus: status
    }));
    setShowPaymentStatusDropdown(false);
  };

  const selectWorkType = (type: string) => {
    setEditedService(prev => ({
      ...prev,
      workType: type
    }));
    setShowWorkTypeDropdown(false);
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

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'Success':
        return 'Pago';
      case 'Pending':
        return 'Pendente';
      case 'Failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return currentTheme.success;
      case 'Pending':
        return currentTheme.warning;
      case 'Failed':
        return currentTheme.error;
      default:
        return currentTheme.textSecondary;
    }
  };

  const renderServiceItem = ({ item }: { item: EventService }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => openServiceEditModal(item)}
    >
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceTitle}>
          {item.workType === 'PRODUCAO' ? 'Produção' : 'Evento'}
        </Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openServiceEditModal(item)}
        >
          <Edit size={18} color={currentTheme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.serviceInfo}>
        <Clock size={16} color="#FFFFFF" />
        <Text style={styles.serviceInfoText}>
          {formatTime(item.arriveMashguiachTime)} - {formatTime(item.endMashguiachTime)}
        </Text>
      </View>

      <View style={styles.serviceInfo}>
        <User size={16} color="#FFFFFF" />
        <Text style={styles.serviceInfoText}>
          Mashguichim: {item.Mashguiach ? item.Mashguiach.name : 'Não atribuído'}
        </Text>
      </View>

      <View style={styles.serviceInfo}>
        <MapPin size={16} color="#FFFFFF" />
        <Text style={styles.serviceInfoText}>
          {item.address_city}, {item.address_state}
        </Text>
      </View>

      <View style={styles.serviceFooter}>
        <View style={styles.serviceStatus}>
          {getStatusIcon(item.isApproved)}
          <Text style={[styles.statusText, { color: getStatusColor(item.isApproved) }]}>
            {getStatusText(item.isApproved)}
          </Text>
        </View>

        <View style={styles.serviceStatus}>
          <Text style={[styles.paymentStatus, { color: getPaymentStatusColor(item.paymentStatus) }]}>
            {getPaymentStatusText(item.paymentStatus)}
          </Text>
        </View>

        <Text style={styles.servicePrice}>
          R$ {item.mashguiachPrice.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    content: {
      padding: 16,
      flex: 1,
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
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.text,
      marginTop: 24,
      marginBottom: 16,
    },
    saveButton: {
      backgroundColor: currentTheme.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 8,
      fontSize: 16,
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
    servicesContainer: {
      marginTop: 24,
    },
    serviceCard: {
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    serviceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    serviceTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    editButton: {
      padding: 4,
    },
    serviceInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    serviceInfoText: {
      fontSize: 14,
      color: '#FFFFFF',
      marginLeft: 8,
    },
    serviceFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    serviceStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 13,
      marginLeft: 4,
    },
    paymentStatus: {
      fontSize: 13,
    },
    servicePrice: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    dropdown: {
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: currentTheme.surfaceLight,
    },
    dropdownText: {
      color: currentTheme.text,
      fontSize: 14,
    },
    dropdownMenu: {
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      marginTop: 4,
      borderWidth: 1,
      borderColor: currentTheme.surfaceLight,
      maxHeight: 200,
    },
    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#222',
    },
    dropdownItemSelected: {
      backgroundColor: currentTheme.primary,
    },
    dropdownItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dropdownItemText: {
      color: '#FFF',
      fontSize: 16,
      marginLeft: 8,
    },
    dropdownItemTextSelected: {
      fontWeight: 'bold',
      color: '#FFF',
    },
    dropdownLoadingContainer: {
      padding: 16,
      alignItems: 'center',
    },
    dropdownLoadingText: {
      color: '#AAA',
      marginTop: 8,
    },
    dropdownNoDataText: {
      color: currentTheme.textSecondary,
      padding: 12,
      textAlign: 'center',
    },
    dateTimeInput: {
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: currentTheme.surfaceLight,
    },
    dateTimeText: {
      color: currentTheme.text,
      fontSize: 14,
      marginLeft: 8,
    },
    inputWithIcon: {
      backgroundColor: currentTheme.surface,
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: currentTheme.surfaceLight,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
  });

  // Função para voltar à tela anterior
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback para a página de eventos se não puder voltar
      router.push('/admin/events' as any);
    }
  };

  if (loading && !event) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Editar Evento" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={{ color: currentTheme.text, marginTop: 16 }}>Carregando dados do evento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Editar Evento" />
      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ChevronLeft size={20} color={currentTheme.primary} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Editar Evento</Text>
              <Text style={styles.subtitle}>Atualize as informações do evento</Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Status do Evento</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>
                  {editedEvent.isApproved ? 'Aprovado' : 'Pendente'}
                </Text>
                <TouchableOpacity
                  onPress={() => handleInputChange('isApproved', !editedEvent.isApproved)}
                  style={{
                    width: 50,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: editedEvent.isApproved ? currentTheme.success : currentTheme.surfaceLight,
                    justifyContent: 'center',
                    paddingHorizontal: 2,
                  }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#FFFFFF',
                    alignSelf: editedEvent.isApproved ? 'flex-end' : 'flex-start',
                  }} />
                </TouchableOpacity>
              </View>
            </View>
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

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveEvent}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Save size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Serviços do Evento</Text>

            {event && event.EventsServices && event.EventsServices.length > 0 ? (
              <FlatList
                data={event.EventsServices}
                renderItem={renderServiceItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            ) : (
              <Text style={{ color: currentTheme.textSecondary, textAlign: 'center', marginTop: 16 }}>
                Este evento não possui serviços cadastrados.
              </Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal de edição de serviço */}
      <Modal
        visible={serviceModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeServiceModal}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            width: '90%',
            maxHeight: '80%',
            backgroundColor: currentTheme.background,
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: currentTheme.surfaceLight,
              backgroundColor: currentTheme.surface,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: currentTheme.text,
              }}>Editar Serviço</Text>
              <TouchableOpacity onPress={closeServiceModal} style={{
                padding: 4,
              }}>
                <XCircle size={24} color={currentTheme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{
              padding: 16,
            }}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo de Serviço</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowWorkTypeDropdown(!showWorkTypeDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {editedService.workType === 'PRODUCAO' ? 'Produção' :
                     editedService.workType === 'EVENTO' ? 'Evento' :
                     editedService.workType === 'SUBSTITUICAO' ? 'Substituição' : 'Selecionar tipo'}
                  </Text>
                  <ChevronDown size={20} color={currentTheme.textSecondary} />
                </TouchableOpacity>

                {showWorkTypeDropdown && (
                  <View style={styles.dropdownMenu}>
                    {['PRODUCAO', 'EVENTO', 'SUBSTITUICAO'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={styles.dropdownItem}
                        onPress={() => {
                          selectWorkType(type);
                          setShowWorkTypeDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {type === 'PRODUCAO' ? 'Produção' :
                           type === 'EVENTO' ? 'Evento' :
                           type === 'SUBSTITUICAO' ? 'Substituição' : type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <CustomDateTimePicker
                label="Horário de Chegada"
                value={editedService.arriveMashguiachTime || null}
                onChange={(date) => onStartDateChange(date)}
                theme={currentTheme}
              />

              <CustomDateTimePicker
                label="Horário de Término"
                value={editedService.endMashguiachTime || null}
                onChange={(date) => onEndDateChange(date)}
                theme={currentTheme}
              />

              <MashguiachSelector
                label="Mashguichim"
                value={editedService.mashguiachId || null}
                onChange={(mashguiachId) => {
                  // Se for a opção "Aleatório", definir como null
                  if (mashguiachId === 'random') {
                    handleServiceInputChange('mashguiachId', null);
                  } else {
                    handleServiceInputChange('mashguiachId', mashguiachId);
                  }
                }}
                theme={currentTheme}
                startDateTime={editedService.arriveMashguiachTime || null}
                endDateTime={editedService.endMashguiachTime || null}
                currentMashguiach={selectedService?.Mashguiach || null}
                token={user?.token || null}
              />

              <View style={styles.formGroup}>
                <Text style={styles.label}>Preço do Serviço (R$)</Text>
                <View style={styles.inputWithIcon}>
                  <DollarSign size={20} color={currentTheme.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={
                      editedService.mashguiachPrice !== undefined
                        ? editedService.mashguiachPrice.toString()
                        : ''
                    }
                    onChangeText={(text) => handleServiceInputChange('mashguiachPrice', parseFloat(text) || 0)}
                    keyboardType="numeric"
                    placeholder="Valor do serviço"
                    placeholderTextColor={currentTheme.textSecondary}
                  />
                </View>
              </View>

              <AddressForm
                address={{
                  address_zipcode: editedService.address_zipcode || '',
                  address_street: editedService.address_street || '',
                  address_number: editedService.address_number || '',
                  address_neighbor: editedService.address_neighbor || '',
                  address_city: editedService.address_city || '',
                  address_state: editedService.address_state || '',
                }}
                onChange={handleServiceInputChange}
                theme={currentTheme}
              />
            </ScrollView>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: currentTheme.surfaceLight,
              backgroundColor: currentTheme.surface,
            }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: currentTheme.surfaceLight,
                }}
                onPress={closeServiceModal}
              >
                <Text style={{
                  color: currentTheme.text,
                  fontWeight: '600',
                }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: currentTheme.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}
                onPress={handleServiceSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Save size={20} color="#FFF" />
                    <Text style={{
                      color: '#FFF',
                      fontWeight: '600',
                      marginLeft: 8,
                    }}>Salvar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}