import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { api } from "@/server/api";
import * as Location from 'expo-location';
import { useUser } from "@/contexts/UserContext";
import { PageLayout } from "@/components/PageLayout";
import { Clock, LogIn, LogOut, MapPin } from "lucide-react-native";

// Interface para eventos de freelancer
interface FreelanceEvent {
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
  };
}

export default function TimeRegisterFixPage() {
  const { user, isLoading } = useUser();
  const [isRegistering, setIsRegistering] = useState(false);
  const [todayEvents, setTodayEvents] = useState<FreelanceEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [hasCheckedInEvent, setHasCheckedInEvent] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchTodayEvents();
    }
  }, [user]);

  const fetchTodayEvents = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingEvents(true);
      console.log('Buscando eventos para o usuário:', user.id);
      
      // Adicionar timestamp para evitar cache (304 Not Modified)
      const timestamp = new Date().getTime();
      
      const response = await api.get('/getNextUserServices', {
        params: { 
          user_id: user.id,
          _t: timestamp // Parâmetro para evitar cache
        }
      });
      
      console.log('Resposta de eventos:', response.data);
      
      if (!response.data || !response.data.services || !Array.isArray(response.data.services)) {
        console.error('Formato de resposta inválido:', response.data);
        setTodayEvents([]);
        return;
      }
      
      // Mostrar todos os eventos disponíveis para depuração
      console.log('Todos os eventos disponíveis:', response.data.services);
      console.log('Total de eventos recebidos:', response.data.services.length);
      
      // Filtrar apenas eventos aceitos
      const acceptedEvents = response.data.services.filter((event: FreelanceEvent) => {
        console.log('Verificando evento:', event.id, 'Aceito:', event.accepted);
        return event.accepted === true;
      });
      
      console.log('Eventos aceitos:', acceptedEvents.length);
      setTodayEvents(acceptedEvents);
      
      // Verifica se já fez check-in em algum evento
      if (acceptedEvents.length > 0) {
        await checkEventStatus(acceptedEvents[0].id);
      } else {
        // Limpar estados se não houver eventos
        setHasCheckedInEvent(false);
        setCurrentEventId(null);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      setTodayEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const checkEventStatus = async (eventId: string) => {
    if (!user?.id) return;
    
    try {
      console.log('Verificando status do evento:', eventId);
      
      // Adicionar timestamp para evitar cache (304 Not Modified)
      const timestamp = new Date().getTime();
      
      const response = await api.get('/events/freela-status', {
        params: { 
          user_id: user.id,
          service_id: eventId,
          _t: timestamp // Parâmetro para evitar cache
        }
      });
      
      console.log('Resposta do status:', response.data);
      
      if (response.data.hasCheckedIn) {
        setHasCheckedInEvent(true);
        setCurrentEventId(eventId);
      } else {
        setHasCheckedInEvent(false);
        setCurrentEventId(null);
      }
    } catch (error) {
      console.error('Erro ao verificar status do evento:', error);
      // Definir estado padrão em caso de erro
      setHasCheckedInEvent(false);
      setCurrentEventId(null);
    }
  };

  const handleEventCheckIn = async (eventId: string) => {
    if (!user) return;
    
    try {
      setIsRegistering(true);
      console.log('Iniciando check-in para o evento:', eventId);
      
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
      
      // Registrar entrada no evento
      const response = await api.post('/events/freela-in-point', {
        user_id: user.id,
        service_id: eventId,
        latitude,
        longitude,
        _t: timestamp // Parâmetro para evitar cache
      });
      
      console.log('Resposta do check-in:', response.data);
      
      if (response.data.success) {
        setHasCheckedInEvent(true);
        setCurrentEventId(eventId);
        Alert.alert('Sucesso', 'Entrada no evento registrada com sucesso!');
        
        // Atualizar status após registro
        await checkEventStatus(eventId);
      } else {
        Alert.alert('Erro', response.data.error || 'Não foi possível registrar sua entrada no evento.');
      }
    } catch (error) {
      console.error('Erro ao registrar entradaaaaaaa no evento:', error);
      Alert.alert('Erro', 'Não foi possível registrar sua entrada no evento. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };
  
  const handleEventCheckOut = async () => {
    if (!user || !currentEventId) return;
    
    try {
      setIsRegistering(true);
      console.log('Iniciando check-out para o evento:', currentEventId);
      
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
      
      // Registrar saída do evento
      const response = await api.post('/events/freela-out-point', {
        user_id: user.id,
        service_id: currentEventId,
        latitude,
        longitude,
        _t: timestamp // Parâmetro para evitar cache
      });
      
      console.log('Resposta do check-out:', response.data);
      
      if (response.data.success) {
        setHasCheckedInEvent(false);
        setCurrentEventId(null);
        Alert.alert('Sucesso', 'Saída do evento registrada com sucesso!');
        
        // Atualizar lista de eventos após registro
        await fetchTodayEvents();
      } else {
        Alert.alert('Erro', response.data.error || 'Não foi possível registrar sua saída do evento.');
      }
    } catch (error) {
      console.error('Erro ao registrar saída do evento:', error);
      Alert.alert('Erro', 'Não foi possível registrar sua saída do evento. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Não registrado';
    
    try {
      // Verificar se a data é válida
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Data inválida:', dateString);
        return 'Data inválida';
      }
      
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Erro na data';
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Registro de Ponto - Freelance">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ba9a5f" />
        </View>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout title="Registro de Ponto - Freelance">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
            Você precisa estar logado para registrar seu ponto.
          </Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Registro de Ponto - Freelance">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '500' }}>Olá, {user.name}</Text>
          <Text style={{ color: '#94a3b8', textAlign: 'center' }}>
            Registre sua entrada e saída em eventos freelance aqui.
          </Text>
          
          {/* Botão de atualização manual */}
          <TouchableOpacity 
            style={{
              backgroundColor: '#ba9a5f',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 4,
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            onPress={fetchTodayEvents}
            disabled={isLoadingEvents}
          >
            {isLoadingEvents ? (
              <ActivityIndicator size="small" color="#232c59" />
            ) : (
              <>
                <Text style={{ color: '#232c59', fontWeight: '500' }}>Atualizar Dados</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: '#232c59', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', flex: 1, textAlign: 'center' }}>
              Eventos Freelance
            </Text>
            <TouchableOpacity 
              style={{ padding: 8 }}
              onPress={fetchTodayEvents}
              disabled={isLoadingEvents}
            >
              <Text style={{ color: '#ba9a5f' }}>Atualizar</Text>
            </TouchableOpacity>
          </View>
          
          {isLoadingEvents ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <ActivityIndicator size="small" color="#ba9a5f" />
              <Text style={{ color: '#94a3b8', marginTop: 8 }}>Carregando eventos...</Text>
            </View>
          ) : todayEvents.length > 0 ? (
            <>
              {todayEvents.map((event) => (
                <View key={event.id} style={{ marginBottom: 16 }}>
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: '500', marginBottom: 8 }}>
                    {event.StoreEvents?.title || 'Evento sem título'}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 8 }}>
                    <Clock size={16} color="#94a3b8" />
                    <Text style={{ color: '#94a3b8', marginLeft: 4 }}>
                      {formatTime(event.arriveMashguiachTime)} - {formatTime(event.endMashguiachTime)}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MapPin size={16} color="#94a3b8" />
                    <Text style={{ color: '#94a3b8', marginLeft: 4 }}>
                      {event.address_street ? 
                        `${event.address_street}, ${event.address_number || 'S/N'} - ${event.address_neighbor || ''}, ${event.address_city || ''}/${event.address_state || ''}` 
                        : 'Endereço não informado'}
                    </Text>
                  </View>
                  
                  {event.StoreEvents?.responsable && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ color: '#94a3b8', marginLeft: 4 }}>
                        Responsável: {event.StoreEvents.responsable}
                        {event.StoreEvents.responsableTelephone ? ` - Tel: ${event.StoreEvents.responsableTelephone}` : ''}
                      </Text>
                    </View>
                  )}
                  
                  {currentEventId === event.id && (
                    <View style={{ 
                      backgroundColor: '#22c55e', 
                      paddingVertical: 4, 
                      paddingHorizontal: 8, 
                      borderRadius: 4,
                      alignSelf: 'flex-start',
                      marginBottom: 8
                    }}>
                      <Text style={{ 
                        color: '#FFFFFF', 
                        fontWeight: '500',
                        fontSize: 12
                      }}>
                        Você está neste evento agora
                      </Text>
                    </View>
                  )}
                  
                  {currentEventId === event.id ? (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#ba9a5f',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                      }}
                      onPress={handleEventCheckOut}
                      disabled={isRegistering}
                    >
                      {isRegistering ? (
                        <ActivityIndicator size="small" color="#232c59" />
                      ) : (
                        <>
                          <LogOut size={20} color="#232c59" />
                          <Text style={{ marginLeft: 8, fontWeight: '500', color: '#232c59' }}>
                            Registrar Saída do Evento
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{
                        backgroundColor: hasCheckedInEvent ? '#475569' : '#ba9a5f',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                      }}
                      onPress={() => handleEventCheckIn(event.id)}
                      disabled={isRegistering || hasCheckedInEvent}
                    >
                      {isRegistering ? (
                        <ActivityIndicator size="small" color={hasCheckedInEvent ? '#94a3b8' : '#232c59'} />
                      ) : (
                        <>
                          <LogIn size={20} color={hasCheckedInEvent ? '#94a3b8' : '#232c59'} />
                          <Text style={{ 
                            marginLeft: 8, 
                            fontWeight: '500', 
                            color: hasCheckedInEvent ? '#94a3b8' : '#232c59'
                          }}>
                            {hasCheckedInEvent && currentEventId !== event.id ? 'Já registrou entrada em outro evento' : 'Registrar Entrada no Evento'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </>
          ) : (
            <View style={{ alignItems: 'center', padding: 16 }}>
              <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 16 }}>
                Não foram encontrados eventos aceitos para exibição.
              </Text>
              <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 16, fontSize: 12 }}>
                Verifique se você aceitou algum evento no dashboard.
              </Text>
              <TouchableOpacity 
                style={{
                  backgroundColor: '#ba9a5f',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 4,
                  marginTop: 8
                }}
                onPress={fetchTodayEvents}
                disabled={isLoadingEvents}
              >
                {isLoadingEvents ? (
                  <ActivityIndicator size="small" color="#232c59" />
                ) : (
                  <Text style={{ color: '#232c59', fontWeight: '500' }}>Atualizar Eventos</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </PageLayout>
  );
} 