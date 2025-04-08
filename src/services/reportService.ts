import { api } from "@/server/api";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

// Interface para os parâmetros do relatório
export interface ReportParams {
  userId: string;
  month?: number;
  year?: number;
  token?: string;
}

// Serviço para lidar com relatórios
export const reportService = {
  // Gerar relatório de trabalho fixo
  async generateFixedJobReport(params: ReportParams): Promise<string> {
    try {
      // URL completa do endpoint
      const url = `https://byk.ong.br/api/reports/fixedJobReport?userId=${params.userId}&month=${params.month?.toString().padStart(2, '0')}&year=${params.year}`;
      
      // Fazer a requisição direta para o endpoint com headers de autorização
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${params.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download falhou com status ${response.status}`);
      }

      // Obter o blob da resposta
      const blob = await response.blob();
      
      // Converter o blob para base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remover o prefixo "data:application/pdf;base64,"
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Criar um nome de arquivo baseado na data atual
      const fileName = `relatorio-trabalho-fixo-${new Date().getTime()}.pdf`;
      
      // Caminho completo para salvar o arquivo
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      // Salvar o arquivo no sistema de arquivos
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return filePath;
    } catch (error) {
      console.error("Erro ao gerar relatório de trabalho fixo:", error);
      throw error;
    }
  },

  // Gerar relatório de trabalho freelancer
  async generateFreelancerJobReport(params: ReportParams): Promise<string> {
    try {
      // URL completa do endpoint
      const url = `https://byk.ong.br/api/reports/freelancerJobReport?userId=${params.userId}&month=${params.month?.toString().padStart(2, '0')}&year=${params.year}`;
      
      // Fazer a requisição direta para o endpoint com headers de autorização
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${params.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download falhou com status ${response.status}`);
      }

      // Obter o blob da resposta
      const blob = await response.blob();
      
      // Converter o blob para base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remover o prefixo "data:application/pdf;base64,"
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Criar um nome de arquivo baseado na data atual
      const fileName = `relatorio-trabalho-freelancer-${new Date().getTime()}.pdf`;
      
      // Caminho completo para salvar o arquivo
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      // Salvar o arquivo no sistema de arquivos
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return filePath;
    } catch (error) {
      console.error("Erro ao gerar relatório de trabalho freelancer:", error);
      throw error;
    }
  },

  // Compartilhar um arquivo PDF
  async sharePdf(filePath: string): Promise<void> {
    try {
      // Verificar se o compartilhamento está disponível
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        throw new Error("Compartilhamento não disponível neste dispositivo");
      }
      
      // Compartilhar o arquivo
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Relatório',
        UTI: 'com.adobe.pdf' // Para iOS
      });
    } catch (error) {
      console.error("Erro ao compartilhar PDF:", error);
      throw error;
    }
  },
}; 