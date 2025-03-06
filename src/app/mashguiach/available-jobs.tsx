import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  Platform, 
  RefreshControl,
  Linking
} from "react-native";
import { Header } from "@/components/Header";
import { Modal } from "@/components/modal";
import { api } from "@/server/api";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  Navigation
} from "lucide-react-native";

// Tipo para os estabelecimentos/buffets
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

// Tipo para os eventos da loja
interface StoreEvents {
  id: string;
  title: string;
  date: string;
  nrPax: number;
  clientName: string;
  eventType: string;
  serviceType: string;
  responsable: string;
  responsableTelephone: string;
  store?: Store;
}

// Tipo para os freelas
type Freela = {
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
  StoreEvents?: StoreEvents;
};

// Tipo para a resposta da API
type FreelaResponse = {
  services: Freela[];
};

export default function AvailableJobsPage() {
  const { user } = useUser();
  const { theme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];
  
  const [freelas, setFreelas] = useState<Freela[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFreela, setSelectedFreela] = useState<Freela | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);

  useEffect(() => {
    fetchFreelas();
  }, []);

  const fetchFreelas = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<FreelaResponse>('/freelas/get-all-freelas');
      setFreelas(response.data.services);
    } catch (error) {
      console.error('Erro ao buscar freelas:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFreelas();
  };

  const handleOpenModal = (freela: Freela) => {
    setSelectedFreela(freela);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedFreela(null);
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

  const acceptFreela = async (freelaId: string) => {
    console.log('freelaId', freelaId);  
    try {
      setAcceptLoading(true);
      const response = await api.post('/freelas/accept-freela', null, {
        params: {
          user_id: user?.id,
          service_id: freelaId
        }
      });
      
      if (response.status === 200) {
        if (Platform.OS === 'android') {
          alert('Você pegou esse freela e agora está em análise e aprovação do rabino, quando for aprovado você receberá uma notificação!');
        } else {
          alert('Você pegou esse freela e agora está em análise e aprovação do rabino, quando for aprovado você receberá uma notificação!');
        }
        
        // Atualiza a lista de freelas após aceitação
        fetchFreelas();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Erro ao aceitar freela:', error);
      alert('Não foi possível aceitar o freela. Tente novamente.');
    } finally {
      setAcceptLoading(false);
    }
  };

  const openMap = (address: string, city: string, state: string) => {
    const formattedAddress = `${address}, ${city}, ${state}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${formattedAddress}`,
      android: `geo:0,0?q=${formattedAddress}`
    });
    
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Erro ao abrir o mapa:', err);
        alert('Não foi possível abrir o mapa.');
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
      padding: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.text,
      marginBottom: 16,
    },
    card: {
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cardTitle: {
      color: currentTheme.text,
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: currentTheme.text,
      marginLeft: 8,
      flex: 1,
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
    // Modal styles
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
    modalItemText: {
      fontSize: 14,
      marginLeft: 8,
    },
    modalItemLabel: {
      fontSize: 14,
      width: 100,
    },
    acceptButton: {
      backgroundColor: currentTheme.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    acceptButtonText: {
      color: '#FFFFFF',
      fontWeight: '500',
      fontSize: 16,
      marginLeft: 8,
    },
    workTypeContainer: {
      backgroundColor: currentTheme.surfaceLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    workTypeText: {
      fontSize: 12,
      fontWeight: '500',
      color: currentTheme.primary,
    },
    mapButton: {
      backgroundColor: currentTheme.surfaceLight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      borderRadius: 8,
      marginTop: 8,
    },
    mapButtonText: {
      color: currentTheme.primary,
      fontWeight: '500',
      fontSize: 14,
      marginLeft: 8,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <Header title="Freelas Disponíveis" />
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
        {isLoading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={currentTheme.primary} />
          </View>
        ) : freelas.length > 0 ? (
          <>
            <Text style={styles.title}>Freelas Disponíveis</Text>
            {freelas.map((freela) => (
              <TouchableOpacity 
                key={freela.id} 
                style={styles.card}
                onPress={() => handleOpenModal(freela)}
                activeOpacity={0.7}
              >
                <View style={styles.workTypeContainer}>
                  <Text style={styles.workTypeText}>
                    {formatWorkType(freela.workType)}
                  </Text>
                </View>
                
                {freela.StoreEvents && (
                  <Text style={styles.cardTitle}>
                    {freela.StoreEvents.title}
                  </Text>
                )}
                
                {freela.StoreEvents && freela.StoreEvents.store && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoText, { color: currentTheme.primary, fontWeight: '500' }]}>
                      {freela.StoreEvents.store.title}
                    </Text>
                  </View>
                )}
                
                <View style={styles.infoRow}>
                  <Calendar size={16} color={currentTheme.primary} />
                  <Text style={styles.infoText}>
                    {formatDate(freela.arriveMashguiachTime)}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Clock size={16} color={currentTheme.primary} />
                  <Text style={styles.infoText}>
                    {formatTime(freela.arriveMashguiachTime)} - {formatTime(freela.endMashguiachTime)}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <MapPin size={16} color={currentTheme.primary} />
                  <Text style={styles.infoText}>
                    {freela.address_street}, {freela.address_number} - {freela.address_neighbor}, {freela.address_city}/{freela.address_state}
                  </Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Valor Total:</Text>
                  <Text style={styles.priceValue}>
                    R$ {(freela.mashguiachPrice + freela.transport_price).toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Não há freelas disponíveis no momento.
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchFreelas}>
              <Text style={styles.refreshButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Adicionar padding no final para não ficar colado com a borda inferior */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal de detalhes do freela */}
      <Modal
        visible={modalVisible}
        title="Detalhes do Freela"
        onClose={handleCloseModal}
      >
        {selectedFreela && selectedFreela.StoreEvents && (
          <View style={{ paddingTop: 16 }}>
            <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>
              {selectedFreela.StoreEvents.title}
            </Text>
            
            {selectedFreela.StoreEvents.store && (
              <View style={styles.modalItem}>
                <Text style={[styles.modalItemText, { color: currentTheme.primary, fontWeight: 'bold' }]}>
                  Estabelecimento: {selectedFreela.StoreEvents.store.title}
                </Text>
              </View>
            )}
            
            <View style={styles.workTypeContainer}>
              <Text style={styles.workTypeText}>
                {formatWorkType(selectedFreela.workType)}
              </Text>
            </View>
            
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>
                Informações do Serviço
              </Text>
              
              <View style={styles.modalItem}>
                <Calendar size={18} color={currentTheme.primary} />
                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                  Data: {formatDate(selectedFreela.arriveMashguiachTime)}
                </Text>
              </View>
              
              <View style={styles.modalItem}>
                <Clock size={18} color={currentTheme.primary} />
                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                  Horário: {formatTime(selectedFreela.arriveMashguiachTime)} - {formatTime(selectedFreela.endMashguiachTime)}
                </Text>
              </View>
              
              <View style={styles.modalItem}>
                <Briefcase size={18} color={currentTheme.primary} />
                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                  Tipo de Trabalho: {formatWorkType(selectedFreela.workType)}
                </Text>
              </View>
              
              {selectedFreela.StoreEvents.nrPax > 0 && (
                <View style={styles.modalItem}>
                  <Users size={18} color={currentTheme.primary} />
                  <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                    Convidados: {selectedFreela.StoreEvents.nrPax}
                  </Text>
                </View>
              )}
              
              <View style={styles.modalItem}>
                <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                  Cliente:
                </Text>
                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                  {selectedFreela.StoreEvents.clientName}
                </Text>
              </View>
              
              {selectedFreela.StoreEvents.eventType && (
                <View style={styles.modalItem}>
                  <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                    Tipo de Evento:
                  </Text>
                  <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                    {selectedFreela.StoreEvents.eventType}
                  </Text>
                </View>
              )}
              
              {selectedFreela.StoreEvents.serviceType && (
                <View style={styles.modalItem}>
                  <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                    Tipo de Serviço:
                  </Text>
                  <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                    {selectedFreela.StoreEvents.serviceType}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>
                Local
              </Text>
              
              <View style={styles.modalItem}>
                <MapPin size={18} color={currentTheme.primary} />
                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                  {selectedFreela.address_street}, {selectedFreela.address_number}
                </Text>
              </View>
              
              <View style={styles.modalItem}>
                <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                  Bairro:
                </Text>
                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                  {selectedFreela.address_neighbor}
                </Text>
              </View>
              
              <View style={styles.modalItem}>
                <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                  Cidade/Estado:
                </Text>
                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                  {selectedFreela.address_city}/{selectedFreela.address_state}
                </Text>
              </View>
              
              <View style={styles.modalItem}>
                <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                  CEP:
                </Text>
                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                  {selectedFreela.address_zipcode}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => openMap(
                  `${selectedFreela.address_street}, ${selectedFreela.address_number}`,
                  selectedFreela.address_city,
                  selectedFreela.address_state
                )}
              >
                <Navigation size={16} color={currentTheme.primary} />
                <Text style={styles.mapButtonText}>Abrir no Mapa</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>
                Valores
              </Text>
              
              <View style={styles.modalItem}>
                <DollarSign size={18} color={currentTheme.primary} />
                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                  Valor por hora: R$ {selectedFreela.mashguiachPricePerHour.toFixed(2).replace('.', ',')}
                </Text>
              </View>
              
              <View style={styles.modalItem}>
                <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                  Valor total:
                </Text>
                <Text style={[styles.modalItemText, { color: currentTheme.primary, fontWeight: 'bold' }]}>
                  R$ {selectedFreela.mashguiachPrice.toFixed(2).replace('.', ',')}
                </Text>
              </View>
              
              <View style={styles.modalItem}>
                <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                  Transporte:
                </Text>
                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                  R$ {selectedFreela.transport_price.toFixed(2).replace('.', ',')}
                </Text>
              </View>
              
              <View style={styles.modalItem}>
                <Text style={[styles.modalItemLabel, { color: currentTheme.textSecondary }]}>
                  Status pagamento:
                </Text>
                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                  {selectedFreela.paymentStatus === 'Pending' ? 'Pendente' : selectedFreela.paymentStatus}
                </Text>
              </View>
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
                  {selectedFreela.StoreEvents.responsable}
                </Text>
              </View>
              
              {selectedFreela.StoreEvents.responsableTelephone && (
                <View style={styles.modalItem}>
                  <Phone size={18} color={currentTheme.primary} />
                  <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                    {selectedFreela.StoreEvents.responsableTelephone}
                  </Text>
                </View>
              )}
            </View>
            
            {selectedFreela.observationText && (
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: currentTheme.text }]}>
                  Observações
                </Text>
                <Text style={[styles.modalItemText, { color: currentTheme.text }]}>
                  {selectedFreela.observationText}
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => acceptFreela(selectedFreela.id)}
              disabled={acceptLoading}
            >
              {acceptLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Check size={20} color="#FFFFFF" />
                  <Text style={styles.acceptButtonText}>Pegar Freela</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
} 