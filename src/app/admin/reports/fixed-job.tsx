import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Linking, Platform, TextInput, TouchableWithoutFeedback, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { themes } from "@/styles/themes";
import { Header } from "@/components/Header";
import { api } from "@/server/api";
import { useUser } from "@/contexts/UserContext";
import { ChevronLeft, FileText, Calendar, User, ChevronDown, Check, Download, Search, X } from "lucide-react-native";
import { router, useNavigation } from "expo-router";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface Mashguiach {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: boolean;
}

interface MashguiachResponse {
  mashguichim: Mashguiach[];
  message?: string;
}

export default function FixedJobReportPage() {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();
  const navigation = useNavigation();
  const searchInputRef = useRef<TextInput>(null);
  const [mashguichim, setMashguichim] = useState<Mashguiach[]>([]);
  const [filteredMashguichim, setFilteredMashguichim] = useState<Mashguiach[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMashguiach, setSelectedMashguiach] = useState<string>("");
  const [selectedMashguiachName, setSelectedMashguiachName] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : `${new Date().getMonth() + 1}`);
  const [selectedYear, setSelectedYear] = useState<string>(`${new Date().getFullYear()}`);
  
  // Estados para controlar a visibilidade dos dropdowns
  const [showMashguiachDropdown, setShowMashguiachDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  useEffect(() => {
    if (user && user.token) {
      fetchMashguichim();
    } else {
      setError("Usuário não autenticado. Faça login novamente.");
    }
  }, [user]);

  const fetchMashguichim = async () => {
    try {
      setLoading(true);
      const response = await api.get<MashguiachResponse>('/admin/getAllMashguichim', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      if (response.data && response.data.mashguichim) {
        // Filtrando apenas mashguichim ativos
        const activeMashguichim = response.data.mashguichim.filter(m => m.status);
        setMashguichim(activeMashguichim);
        setFilteredMashguichim(activeMashguichim);
        
        // Seleciona o primeiro mashguiach da lista por padrão
        if (activeMashguichim.length > 0) {
          setSelectedMashguiach(activeMashguichim[0].id);
          setSelectedMashguiachName(activeMashguichim[0].name);
        }
        
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
      }
      setError("Não foi possível carregar a lista de mashguichim");
      setMashguichim([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.replace('/admin');
    }
  };

  const generateReport = async (reportType: 'fixed' | 'freelancer') => {
    if (!selectedMashguiach) {
      Alert.alert("Erro", "Selecione um mashguiach para gerar o relatório.");
      return;
    }

    try {
      setGenerating(true);
      
      // Definindo o endpoint com base no tipo de relatório
      const endpoint = reportType === 'fixed' 
        ? 'fixedJobReport' 
        : 'freelancerJobReport';
      
      // Primeiro, tentamos o método direto de abrir a URL
      if (Platform.OS === 'web') {
        // No ambiente web, podemos abrir a URL diretamente
        const reportUrl = `${api.defaults.baseURL}/reports/${endpoint}?userId=${selectedMashguiach}&month=${selectedMonth}&year=${selectedYear}&token=${user?.token}`;
        window.open(reportUrl, '_blank');
        Alert.alert(
          "Relatório Gerado",
          "O relatório foi gerado com sucesso e está sendo baixado em uma nova janela."
        );
      } else {
        // Em dispositivos móveis, usamos o método de download e compartilhamento
        Alert.alert(
          "Gerando Relatório",
          "O relatório está sendo gerado. Você poderá compartilhá-lo ou salvá-lo quando o download for concluído."
        );
        await downloadAndShareReport(reportType);
      }
    } catch (err) {
      console.error("Erro ao gerar relatório:", err);
      if (err instanceof Error) {
        console.error("Mensagem de erro:", err.message);
      }
      Alert.alert("Erro", "Não foi possível gerar o relatório. Tente novamente mais tarde.");
    } finally {
      setGenerating(false);
    }
  };

  const downloadAndShareReport = async (reportType: 'fixed' | 'freelancer') => {
    try {
      // Definindo o endpoint com base no tipo de relatório
      const endpoint = reportType === 'fixed' 
        ? 'fixedJobReport' 
        : 'freelancerJobReport';
      
      // Construindo a URL para o relatório
      const reportUrl = `${api.defaults.baseURL}/reports/${endpoint}?userId=${selectedMashguiach}&month=${selectedMonth}&year=${selectedYear}`;
      
      // Nome do arquivo temporário
      const reportTypeName = reportType === 'fixed' ? 'fixo' : 'freelancer';
      const fileName = `relatorio-${reportTypeName}-${selectedMashguiach}-${selectedYear}-${selectedMonth}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      // Configurando os cabeçalhos com o token de autenticação
      const downloadOptions = {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      };
      
      // Fazendo o download do arquivo
      const downloadResult = await FileSystem.downloadAsync(reportUrl, fileUri, downloadOptions);
      
      if (downloadResult.status === 200) {
        // Verificando se o compartilhamento está disponível
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
          // Compartilhando o arquivo
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Relatório de Trabalho Fixo',
            UTI: 'com.adobe.pdf' // Para iOS
          });
        } else {
          Alert.alert("Erro", "O compartilhamento não está disponível neste dispositivo.");
        }
      } else {
        throw new Error(`Download falhou com status ${downloadResult.status}`);
      }
    } catch (error) {
      console.error("Erro ao baixar e compartilhar relatório:", error);
      throw error;
    }
  };

  const getMonthName = (monthNumber: string) => {
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return months[parseInt(monthNumber) - 1];
  };

  const handleSelectMashguiach = (id: string, name: string) => {
    setSelectedMashguiach(id);
    setSelectedMashguiachName(name);
    setShowMashguiachDropdown(false);
    setSearchQuery("");
  };

  // Efeito para focar no campo de busca quando o dropdown é aberto
  useEffect(() => {
    if (showMashguiachDropdown && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showMashguiachDropdown]);

  const handleSearchMashguiach = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredMashguichim(mashguichim);
    } else {
      const filtered = mashguichim.filter(m => 
        m.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredMashguichim(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredMashguichim(mashguichim);
  };

  const handleSelectMonth = (month: string) => {
    setSelectedMonth(month);
    setShowMonthDropdown(false);
  };

  const handleSelectYear = (year: string) => {
    setSelectedYear(year);
    setShowYearDropdown(false);
  };

  const renderMonthItems = () => {
    const items = [];
    for (let i = 1; i <= 12; i++) {
      const monthNumber = i < 10 ? `0${i}` : `${i}`;
      items.push(
        <TouchableOpacity
          key={monthNumber}
          style={[
            styles.dropdownItem,
            { borderBottomColor: currentTheme.surfaceLight },
            selectedMonth === monthNumber && { backgroundColor: currentTheme.primary }
          ]}
          onPress={() => handleSelectMonth(monthNumber)}
        >
          <View style={styles.dropdownItemContent}>
            <Text 
              style={[
                styles.dropdownItemText,
                { color: selectedMonth === monthNumber ? '#FFF' : currentTheme.text }
              ]}
            >
              {getMonthName(monthNumber)}
            </Text>
          </View>
          {selectedMonth === monthNumber && (
            <Check size={16} color="#FFF" />
          )}
        </TouchableOpacity>
      );
    }
    return items;
  };

  const renderYearItems = () => {
    const currentYear = new Date().getFullYear();
    const items = [];
    // Mostrando anos de 2 anos atrás até 2 anos à frente
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      const yearStr = i.toString();
      items.push(
        <TouchableOpacity
          key={yearStr}
          style={[
            styles.dropdownItem,
            { borderBottomColor: currentTheme.surfaceLight },
            selectedYear === yearStr && { backgroundColor: currentTheme.primary }
          ]}
          onPress={() => handleSelectYear(yearStr)}
        >
          <View style={styles.dropdownItemContent}>
            <Text 
              style={[
                styles.dropdownItemText,
                { color: selectedYear === yearStr ? '#FFF' : currentTheme.text }
              ]}
            >
              {yearStr}
            </Text>
          </View>
          {selectedYear === yearStr && (
            <Check size={16} color="#FFF" />
          )}
        </TouchableOpacity>
      );
    }
    return items;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Relatório de Trabalho Fixo" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={{ color: currentTheme.text, marginTop: 16 }}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Relatório de Trabalho Fixo" />
      <View style={{ flex: 1 }}>
        <Pressable 
          style={{ flex: 1 }}
          onPress={() => {
            if (showMashguiachDropdown || showMonthDropdown || showYearDropdown) {
              setShowMashguiachDropdown(false);
              setShowMonthDropdown(false);
              setShowYearDropdown(false);
            }
          }}
        >
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            bounces={true}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={!(showMashguiachDropdown || showMonthDropdown || showYearDropdown)}
          >
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <ChevronLeft size={20} color={currentTheme.primary} />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Relatório de Trabalho Fixo por Mashguiach</Text>
              <Text style={styles.subtitle}>Selecione o mashguiach, mês e ano para gerar o relatório</Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={fetchMashguichim}
                >
                  <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.formContainer, { zIndex: Platform.OS === 'ios' ? 4000 : 100 }]}>
              <View style={[styles.formGroup, { zIndex: Platform.OS === 'ios' ? 3000 : 3000 }]}>
                <Text style={styles.label}>Mashguiach</Text>
                <TouchableOpacity
                  style={[styles.dropdown, { backgroundColor: currentTheme.surface }]}
                  onPress={() => {
                    setShowMashguiachDropdown(!showMashguiachDropdown);
                    setShowMonthDropdown(false);
                    setShowYearDropdown(false);
                  }}
                >
                  <View style={styles.dropdownContent}>
                    <User size={20} color={currentTheme.textSecondary} />
                    <Text style={[styles.dropdownText, { color: currentTheme.text }]}>
                      {selectedMashguiachName || "Selecione um mashguiach"}
                    </Text>
                  </View>
                  <ChevronDown size={20} color={currentTheme.textSecondary} />
                </TouchableOpacity>
                
                {showMashguiachDropdown && (
                  <Pressable 
                    onPress={(e) => e.stopPropagation()}
                    style={[
                      styles.dropdownMenuWrapper,
                      Platform.OS === 'android' ? { position: 'relative', zIndex: 9999, elevation: 5 } : {}
                    ]}
                  >
                    <View style={[styles.dropdownMenu, { backgroundColor: currentTheme.surface, borderColor: currentTheme.surfaceLight }]}>
                      <View style={styles.searchContainer}>
                        <Search size={18} color={currentTheme.textSecondary} style={styles.searchIcon} />
                        <TextInput
                          ref={searchInputRef}
                          style={[styles.searchInput, { color: currentTheme.text }]}
                          placeholder="Buscar mashguiach..."
                          placeholderTextColor={currentTheme.textSecondary}
                          value={searchQuery}
                          onChangeText={handleSearchMashguiach}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                            <X size={16} color={currentTheme.textSecondary} />
                          </TouchableOpacity>
                        )}
                      </View>
                      <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                        {filteredMashguichim.length > 0 ? (
                          filteredMashguichim.map((mashguiach) => (
                            <TouchableOpacity
                              key={mashguiach.id}
                              style={[
                                styles.dropdownItem,
                                { borderBottomColor: currentTheme.surfaceLight },
                                selectedMashguiach === mashguiach.id && { backgroundColor: currentTheme.primary }
                              ]}
                              onPress={() => handleSelectMashguiach(mashguiach.id, mashguiach.name)}
                            >
                              <View style={styles.dropdownItemContent}>
                                <Text 
                                  style={[
                                    styles.dropdownItemText,
                                    { color: selectedMashguiach === mashguiach.id ? '#FFF' : currentTheme.text }
                                  ]}
                                >
                                  {mashguiach.name}
                                </Text>
                              </View>
                              {selectedMashguiach === mashguiach.id && (
                                <Check size={16} color="#FFF" />
                              )}
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View style={styles.noResultsContainer}>
                            <Text style={[styles.noResultsText, { color: currentTheme.textSecondary }]}>
                              Nenhum mashguiach encontrado
                            </Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  </Pressable>
                )}
              </View>

              <View style={[styles.formGroup, { zIndex: Platform.OS === 'ios' ? 2000 : 2000 }]}>
                <Text style={styles.label}>Mês</Text>
                <TouchableOpacity
                  style={[styles.dropdown, { backgroundColor: currentTheme.surface }]}
                  onPress={() => {
                    setShowMonthDropdown(!showMonthDropdown);
                    setShowMashguiachDropdown(false);
                    setShowYearDropdown(false);
                  }}
                >
                  <View style={styles.dropdownContent}>
                    <Calendar size={20} color={currentTheme.textSecondary} />
                    <Text style={[styles.dropdownText, { color: currentTheme.text }]}>
                      {getMonthName(selectedMonth)}
                    </Text>
                  </View>
                  <ChevronDown size={20} color={currentTheme.textSecondary} />
                </TouchableOpacity>
                
                {showMonthDropdown && (
                  <Pressable 
                    onPress={(e) => e.stopPropagation()}
                    style={[
                      styles.dropdownMenuWrapper,
                      Platform.OS === 'android' ? { position: 'relative', zIndex: 9999, elevation: 5 } : {}
                    ]}
                  >
                    <View style={[styles.dropdownMenu, { backgroundColor: currentTheme.surface, borderColor: currentTheme.surfaceLight }]}>
                      <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                        {renderMonthItems()}
                      </ScrollView>
                    </View>
                  </Pressable>
                )}
              </View>

              <View style={[styles.formGroup, { zIndex: Platform.OS === 'ios' ? 1000 : 1000 }]}>
                <Text style={styles.label}>Ano</Text>
                <TouchableOpacity
                  style={[styles.dropdown, { backgroundColor: currentTheme.surface }]}
                  onPress={() => {
                    setShowYearDropdown(!showYearDropdown);
                    setShowMashguiachDropdown(false);
                    setShowMonthDropdown(false);
                  }}
                >
                  <View style={styles.dropdownContent}>
                    <Calendar size={20} color={currentTheme.textSecondary} />
                    <Text style={[styles.dropdownText, { color: currentTheme.text }]}>
                      {selectedYear}
                    </Text>
                  </View>
                  <ChevronDown size={20} color={currentTheme.textSecondary} />
                </TouchableOpacity>
                
                {showYearDropdown && (
                  <Pressable 
                    onPress={(e) => e.stopPropagation()}
                    style={[
                      styles.dropdownMenuWrapper,
                      Platform.OS === 'android' ? { position: 'relative', zIndex: 9999, elevation: 5 } : {}
                    ]}
                  >
                    <View style={[styles.dropdownMenu, { backgroundColor: currentTheme.surface, borderColor: currentTheme.surfaceLight }]}>
                      <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                        {renderYearItems()}
                      </ScrollView>
                    </View>
                  </Pressable>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.generateButton, generating && styles.generateButtonDisabled]}
                  onPress={() => generateReport('fixed')}
                  disabled={generating || !selectedMashguiach}
                >
                  {generating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <FileText size={20} color="#FFFFFF" />
                      <Text style={styles.generateButtonText}>Relatório Trabalho Fixo</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.generateButton, generating && styles.generateButtonDisabled, styles.freelancerButton]}
                  onPress={() => generateReport('freelancer')}
                  disabled={generating || !selectedMashguiach}
                >
                  {generating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <FileText size={20} color="#FFFFFF" />
                      <Text style={styles.generateButtonText}>Relatório Freelancer</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {Platform.OS === 'web' && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.downloadButton, generating && styles.generateButtonDisabled]}
                    onPress={() => {
                      if (selectedMashguiach) {
                        const reportUrl = `${api.defaults.baseURL}/reports/fixedJobReport?userId=${selectedMashguiach}&month=${selectedMonth}&year=${selectedYear}&token=${user?.token}`;
                        // Criando um link temporário para download direto
                        const a = document.createElement('a');
                        a.href = reportUrl;
                        a.download = `relatorio-fixo-${selectedMashguiach}-${selectedYear}-${selectedMonth}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }
                    }}
                    disabled={generating || !selectedMashguiach}
                  >
                    <Download size={20} color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>Download Fixo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.downloadButton, generating && styles.generateButtonDisabled, styles.freelancerButton]}
                    onPress={() => {
                      if (selectedMashguiach) {
                        const reportUrl = `${api.defaults.baseURL}/reports/freelancerJobReport?userId=${selectedMashguiach}&month=${selectedMonth}&year=${selectedYear}&token=${user?.token}`;
                        // Criando um link temporário para download direto
                        const a = document.createElement('a');
                        a.href = reportUrl;
                        a.download = `relatorio-freelancer-${selectedMashguiach}-${selectedYear}-${selectedMonth}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }
                    }}
                    disabled={generating || !selectedMashguiach}
                  >
                    <Download size={20} color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>Download Freelancer</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  O relatório será gerado em formato PDF e poderá ser baixado ou compartilhado.
                </Text>
                <Text style={styles.infoText}>
                  {Platform.OS === 'web' 
                    ? "O arquivo será aberto em uma nova janela para download." 
                    : "Você poderá compartilhar ou salvar o arquivo após o download."}
                </Text>
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
    position: 'relative',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0B2',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#8257E5',
    marginLeft: 4,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#8257E5',
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
  formContainer: {
    backgroundColor: '#202024',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    position: 'relative',
    zIndex: 100,
  },
  formGroup: {
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333',
    zIndex: 1,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownMenuWrapper: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 5,
    backgroundColor: 'transparent',
  },
  dropdownMenu: {
    borderRadius: 8,
    maxHeight: 300,
    borderWidth: 1,
    zIndex: 9999,
    elevation: 5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#202024',
  },
  dropdownList: {
    maxHeight: 250,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  generateButton: {
    backgroundColor: '#8257E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  freelancerButton: {
    backgroundColor: '#4D4D57',
    marginRight: 0,
    marginLeft: 8,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  downloadButton: {
    backgroundColor: '#4D4D57',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(130, 87, 229, 0.1)',
    borderRadius: 8,
  },
  infoText: {
    color: '#A0A0B2',
    fontSize: 14,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1A1A1D',
    zIndex: 10000,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  noResultsText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 