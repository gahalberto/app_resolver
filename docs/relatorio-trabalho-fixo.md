# Documentação: Relatório de Trabalho Fixo

## Visão Geral

O sistema de Relatório de Trabalho Fixo permite que mashguichim gerem relatórios em PDF contendo informações detalhadas sobre seu trabalho fixo em estabelecimentos, incluindo horas trabalhadas e valores a receber.

## Endpoint da API

### `/api/reports/fixedJobReport`

**Método:** POST

**Parâmetros:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| userId | string | Sim | ID do mashguiach |
| startDate | string | Não* | Data inicial (formato: YYYY-MM-DD) |
| endDate | string | Não* | Data final (formato: YYYY-MM-DD) |
| month | number | Não* | Mês (1-12) |
| year | number | Não* | Ano (ex: 2023) |

\* É necessário fornecer ou o par `startDate`/`endDate` ou o par `month`/`year`.

**Cabeçalhos:**
- `Authorization`: Token JWT para autenticação

**Resposta:**
- **Tipo:** application/pdf
- **Conteúdo:** Arquivo PDF contendo o relatório

**Exemplo de Requisição:**
```javascript
const response = await api.post("/reports/fixedJobReport", {
  userId: "user123",
  month: 3,
  year: 2023
}, {
  responseType: "arraybuffer",
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## Componente React Native

### FixedJobReportButton

Este componente permite que os usuários selecionem um período e gerem um relatório de trabalho fixo.

**Props:**

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| onSuccess | function | Não | Callback chamado quando o relatório é gerado com sucesso |
| onError | function | Não | Callback chamado quando ocorre um erro, recebe o erro como parâmetro |

**Exemplo de Uso:**
```jsx
import { FixedJobReportButton } from '@/components/FixedJobReportButton';

export default function MinhaTelaDeRelatorios() {
  return (
    <View>
      <Text>Gerar Relatório de Trabalho Fixo</Text>
      <FixedJobReportButton 
        onSuccess={() => console.log('Relatório gerado com sucesso!')}
        onError={(error) => console.error('Erro ao gerar relatório:', error)}
      />
    </View>
  );
}
```

## Serviço de Relatórios

### reportService

Este serviço fornece métodos para gerar e compartilhar relatórios.

**Métodos:**

#### `generateFixedJobReport(params: FixedJobReportParams): Promise<string>`

Gera um relatório de trabalho fixo e retorna o caminho do arquivo PDF.

**Parâmetros:**
- `params`: Objeto contendo os parâmetros do relatório (userId, startDate/endDate ou month/year)

**Retorno:**
- Promise que resolve para o caminho do arquivo PDF gerado

#### `sharePdf(filePath: string): Promise<void>`

Compartilha um arquivo PDF usando o sistema de compartilhamento nativo.

**Parâmetros:**
- `filePath`: Caminho do arquivo PDF a ser compartilhado

**Exemplo de Uso:**
```javascript
import { reportService } from '@/services/reportService';

// Gerar relatório
const filePath = await reportService.generateFixedJobReport({
  userId: user.id,
  month: 3,
  year: 2023
});

// Compartilhar relatório
await reportService.sharePdf(filePath);
```

## Conteúdo do Relatório

O relatório PDF gerado contém as seguintes seções:

1. **Cabeçalho**
   - Logo da organização
   - Título do relatório
   - Período do relatório

2. **Informações do Mashguiach**
   - Nome
   - Email
   - Telefone

3. **Resumo por Estabelecimento**
   - Nome do estabelecimento
   - Total de horas trabalhadas
   - Valor por hora
   - Valor total

4. **Detalhes dos Dias Trabalhados**
   - Data
   - Estabelecimento
   - Horário de entrada
   - Horário de saída
   - Horas trabalhadas (considerando horário de almoço)
   - Valor

5. **Total Geral**
   - Total de horas trabalhadas
   - Valor total a receber

## Requisitos de Segurança

- O endpoint da API requer autenticação via token JWT
- Apenas o próprio mashguiach ou administradores podem acessar os relatórios
- Os dados são transmitidos de forma segura (HTTPS)

## Dependências

### Backend
- pdfkit: Para geração de PDFs
- @types/pdfkit: Tipos TypeScript para pdfkit

### Frontend (React Native)
- expo-file-system: Para manipulação de arquivos
- expo-sharing: Para compartilhamento de arquivos
- @react-native-community/datetimepicker: Para seleção de datas
- date-fns: Para manipulação de datas

## Instalação

```bash
# Instalar dependências do frontend
npm install expo-file-system expo-sharing @react-native-community/datetimepicker date-fns
``` 