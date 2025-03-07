import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Header } from '@/components/Header';
import { useTheme } from '@/contexts/ThemeContext';
import { themes } from '@/styles/themes';
import { useUser } from '@/contexts/UserContext';
import { FixedJobReportButton } from '@/components/FixedJobReportButton';
import { FileText } from 'lucide-react-native';

export default function FixedJobReportPage() {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  const { user } = useUser();

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <Header title="Relatório de Trabalho Fixo" />
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: currentTheme.text }]}>
            Você precisa estar logado para acessar esta página.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Header title="Relatório de Trabalho Fixo" />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Relatório de Trabalho Fixo
          </Text>
          <Text style={[styles.sectionDescription, { color: currentTheme.textSecondary }]}>
            Gere um relatório detalhado do seu trabalho fixo em estabelecimentos, incluindo horas trabalhadas e valores.
          </Text>
          
          <FixedJobReportButton />
          
          <View style={styles.infoCard}>
            <FileText size={24} color={currentTheme.primary} />
            <View style={styles.infoCardContent}>
              <Text style={[styles.infoCardTitle, { color: currentTheme.text }]}>
                O que contém neste relatório?
              </Text>
              <Text style={[styles.infoCardText, { color: currentTheme.textSecondary }]}>
                • Informações do mashguiach{'\n'}
                • Resumo por estabelecimento{'\n'}
                • Detalhes dos dias trabalhados{'\n'}
                • Total de horas e valores
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoCardContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 