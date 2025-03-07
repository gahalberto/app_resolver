import { api } from "@/server/api";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

// Interface para os parâmetros do relatório de trabalho fixo
export interface FixedJobReportParams {
  userId: string;
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
}

// Serviço para lidar com relatórios
export const reportService = {
  // Gerar relatório de trabalho fixo
  async generateFixedJobReport(params: FixedJobReportParams): Promise<string> {
    try {
      // Fazer a requisição para o endpoint de relatório
      const response = await api.post("/reports/fixedJobReport", params, {
        responseType: "arraybuffer",
      });

      // Criar um nome de arquivo baseado na data atual
      const fileName = `relatorio-trabalho-fixo-${new Date().getTime()}.pdf`;
      
      // Caminho completo para salvar o arquivo
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      // Converter o arraybuffer para base64
      const base64Data = Buffer.from(response.data).toString("base64");
      
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

  // Compartilhar um arquivo PDF
  async sharePdf(filePath: string): Promise<void> {
    try {
      // Verificar se o compartilhamento está disponível
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(filePath);
      } else {
        throw new Error("Compartilhamento não está disponível neste dispositivo");
      }
    } catch (error) {
      console.error("Erro ao compartilhar PDF:", error);
      throw error;
    }
  }
}; 