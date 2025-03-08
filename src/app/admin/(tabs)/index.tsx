import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import {
  Users,
  Store,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarClock,
  AlertTriangle
} from "lucide-react-native";
import axios from "axios";
import { BASEURL } from "@/config";
import { api } from "@/server/api";
import { useUser } from "@/contexts/UserContext";
import { router } from "expo-router";

// Definindo interfaces com tipos estritos
interface Mashguiach {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface StoreData {
  id: string;
  title: string;
}

interface StoreEvent {
  id: string;
  title: string;
  responsable: string;
  date: string;
  nrPax: number;
  clientName: string;
  eventType: string;
  serviceType: string;
  store: StoreData;
}

interface TodayEvent {
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
  Mashguiach: Mashguiach;
  StoreEvents: StoreEvent;
}

interface DashboardData {
  mashguiachCount: number;
  storeCount: number;
  eventsCount: number;
  todayEventsCount: number;
  pedingEvents: any[];
  monthEvents: number;
  todayEvents: TodayEvent[];
}

// Componente que renderiza um evento individual
const EventItem = ({ event }: { event: any }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme];

  // Verifica se o evento é válido
  if (!event || typeof event !== 'object') {
    return null;
  }

  // Funções auxiliares para renderização
  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return '--:--';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '--:--';
    }
  };

  const getStatusColor = () => {
    if (event.isApproved) {
      return currentTheme.success;
    } else if (event.accepted) {
      return currentTheme.warning;
    } else {
      return currentTheme.error;
    }
  };

  const getStatusText = () => {
    if (event.isApproved) {
      return "Aprovado";
    } else if (event.accepted) {
      return "Aceito";
    } else {
      return "Pendente";
    }
  };

  const getStatusIcon = () => {
    if (event.isApproved) {
      return <CheckCircle2 size={16} color={currentTheme.success} />;
    } else if (event.accepted) {
      return <AlertCircle size={16} color={currentTheme.warning} />;
    } else {
      return <XCircle size={16} color={currentTheme.error} />;
    }
  };

  // Estilos locais
  const styles = StyleSheet.create({
    eventItem: {
      backgroundColor: currentTheme.surfaceLight,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      flex: 1,
      marginRight: 8,
    },
    eventStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    eventStatusText: {
      fontSize: 12,
      marginLeft: 4,
    },
    eventInfo: {
      marginBottom: 12,
    },
    eventInfoText: {
      fontSize: 14,
      color: '#FFFFFF',
      marginBottom: 4,
    },
    eventTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    eventTime: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    eventTimeText: {
      fontSize: 14,
      color: currentTheme.textSecondary,
      marginLeft: 4,
    },
  });

  // Garante que StoreEvents existe
  const storeEvents = event.StoreEvents || {};
  const store = storeEvents.store || {};
  const mashguiach = event.Mashguiach || {};

  return (
    <View key={event.id} style={styles.eventItem}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {typeof storeEvents.title === 'string' ? storeEvents.title : 'Evento sem título'}
        </Text>
        <View style={styles.eventStatus}>
          {getStatusIcon()}
          <Text
            style={[
              styles.eventStatusText,
              { color: getStatusColor() }
            ]}
          >
            {getStatusText()}
          </Text>
        </View>
      </View>

      <View style={styles.eventInfo}>
        <Text style={styles.eventInfoText}>
          Estabelecimento: {typeof store.title === 'string' ? store.title : 'Não informado'}
        </Text>
        <Text style={styles.eventInfoText}>
          Mashguiach: {typeof mashguiach.name === 'string' ? mashguiach.name : 'Não informado'}
        </Text>
        <Text style={styles.eventInfoText}>
          Responsável: {typeof storeEvents.responsable === 'string' ? storeEvents.responsable : 'Não informado'}
        </Text>
        <Text style={styles.eventInfoText}>
          Tipo: {typeof storeEvents.eventType === 'string' ? storeEvents.eventType : 'Não informado'} | {typeof event.workType === 'string' ? event.workType : 'Não informado'}
        </Text>
      </View>

      <View style={styles.eventTimeContainer}>
        <View style={styles.eventTime}>
          <Clock size={14} color={currentTheme.textSecondary} />
          <Text style={styles.eventTimeText}>
            {formatTime(event.arriveMashguiachTime)}
          </Text>
        </View>
        <Text style={{ color: currentTheme.textSecondary }}>até</Text>
        <View style={styles.eventTime}>
          <Clock size={14} color={currentTheme.textSecondary} />
          <Text style={styles.eventTimeText}>
            {formatTime(event.endMashguiachTime)}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Componente principal
export default function AdminDashboardPage() {
  const { theme, isDarkMode } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar dados básicos do dashboard (rápida)
  const fetchBasicDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/dashboard-data`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      // Tratar possíveis problemas com os dados
      const safeData = {
        mashguiachCount: response.data?.mashguiachCount || 0,
        storeCount: response.data?.storeCount || 0,
        eventsCount: response.data?.eventsCount || 0,
        todayEventsCount: response.data?.todayEventsCount || 0,
        monthEvents: response.data?.monthEvents || 0,
        pedingEvents: Array.isArray(response.data?.pedingEvents) ? response.data.pedingEvents : [],
        todayEvents: Array.isArray(response.data?.todayEvents) ? response.data.todayEvents : []
      };

      setDashboardData(safeData);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar dados básicos do dashboard:", err);
      setError("Não foi possível carregar os dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      // Verificar se temos dados em cache
      const cachedData = getCachedDashboardData();

      if (cachedData) {
        // Se temos dados em cache, usamos eles primeiro
        setDashboardData(cachedData);
        setLoading(false);

        // E então atualizamos em segundo plano
        fetchBasicDashboardData();
      } else {
        // Se não temos cache, carregamos normalmente
        fetchBasicDashboardData();
      }
    } else {
      setError("Usuário não autenticado");
      setLoading(false);
    }
  }, [user]);

  const getCachedDashboardData = () => {
    try {
      return null;
    } catch (error) {
      return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    content: {
      padding: 16,
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
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    statCard: {
      width: '48%',
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      minHeight: 120,
    },
    statTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.text,
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    statValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(186, 154, 95, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      flexShrink: 0,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.text,
      flexWrap: 'wrap',
      flex: 1,
    },
    card: {
      backgroundColor: currentTheme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.text,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewAllText: {
      fontSize: 14,
      color: currentTheme.primary,
      marginRight: 4,
    },
    emptyText: {
      color: currentTheme.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      padding: 16,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      marginBottom: 16,
    },
    errorText: {
      color: currentTheme.error,
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Dashboard" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={{ color: currentTheme.text, marginTop: 16 }}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Dashboard" />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Bem-vindo ao painel administrativo</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/admin/mashguichim' as any)}
          >
            <Text style={styles.statTitle} numberOfLines={2}>Mashguichim</Text>
            <View style={styles.statValueContainer}>
              <View style={styles.statIcon}>
                <Users size={20} color={currentTheme.primary} />
              </View>
              <Text style={styles.statValue} numberOfLines={2}>
                {dashboardData?.mashguiachCount?.toString() || '0'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/admin/establishments' as any)}
          >
            <Text style={styles.statTitle} numberOfLines={2}>Estabelecimentos</Text>
            <View style={styles.statValueContainer}>
              <View style={styles.statIcon}>
                <Store size={20} color={currentTheme.primary} />
              </View>
              <Text style={styles.statValue} numberOfLines={2}>
                {dashboardData?.storeCount?.toString() || '0'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/admin/events?filter=all' as any)}
          >
            <Text style={styles.statTitle} numberOfLines={2}>Total de Eventos</Text>
            <View style={styles.statValueContainer}>
              <View style={styles.statIcon}>
                <Calendar size={20} color={currentTheme.primary} />
              </View>
              <Text style={styles.statValue} numberOfLines={2}>
                {dashboardData?.eventsCount?.toString() || '0'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/admin/events?filter=today' as any)}
          >
            <Text style={styles.statTitle} numberOfLines={2}>Eventos Hoje</Text>
            <View style={styles.statValueContainer}>
              <View style={styles.statIcon}>
                <Clock size={20} color={currentTheme.primary} />
              </View>
              <Text style={styles.statValue} numberOfLines={2}>
                {dashboardData?.todayEventsCount?.toString() || '0'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/admin/events?filter=pending' as any)}
          >
            <Text style={styles.statTitle} numberOfLines={2}>Eventos Pendentes</Text>
            <View style={styles.statValueContainer}>
              <View style={styles.statIcon}>
                <AlertTriangle size={20} color={currentTheme.warning} />
              </View>
              <Text style={styles.statValue} numberOfLines={2}>
                {Array.isArray(dashboardData?.pedingEvents)
                  ? dashboardData.pedingEvents.length.toString()
                  : '0'
                }
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/admin/events?filter=month' as any)}
          >
            <Text style={styles.statTitle} numberOfLines={2}>Eventos do Mês</Text>
            <View style={styles.statValueContainer}>
              <View style={styles.statIcon}>
                <CalendarClock size={20} color={currentTheme.primary} />
              </View>
              <Text style={styles.statValue} numberOfLines={2}>
                {dashboardData?.monthEvents?.toString() || '0'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Eventos de Hoje</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/admin/events?filter=today' as any)}
            >
              <Text style={styles.viewAllText}>Ver Todos</Text>
              <ArrowRight size={16} color={currentTheme.primary} />
            </TouchableOpacity>
          </View>

          {dashboardData?.todayEvents && Array.isArray(dashboardData.todayEvents) && dashboardData.todayEvents.length > 0 ? (
            dashboardData.todayEvents.map((event, index) => (
              <EventItem key={event.id || index} event={event} />
            ))
          ) : (
            <Text style={styles.emptyText}>Não há eventos para hoje</Text>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}