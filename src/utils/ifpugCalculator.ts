// Matrizes de complexidade IFPUG conforme manual BRASILEIRO

// ====================
// 1. LIMITES CORRETOS (conforme sua tabela)
// ====================

// Limites para TD (Tipo de Dado) - ALI/AIE
const getTDIndexALI = (td: number): number => {
  if (td <= 19) return 0;     // Baixa
  if (td <= 50) return 1;     // Média
  return 2;                   // Alta (51+)
};

// Limites para TD (Tipo de Dado) - EE/CE
const getTDIndexEECE = (td: number): number => {
  if (td <= 4) return 0;      // Baixa
  if (td <= 15) return 1;     // Média
  return 2;                   // Alta (16+)
};

// Limites para TD (Tipo de Dado) - SE
const getTDIndexSE = (td: number): number => {
  if (td <= 5) return 0;      // Baixa
  if (td <= 19) return 1;     // Média
  return 2;                   // Alta (20+)
};

// Limites para TR (Tipo de Registro) - ALI/AIE
const getTRIndex = (tr: number): number => {
  if (tr === 1) return 0;            // Baixa
  if (tr >= 2 && tr <= 5) return 1;  // Média
  return 2;                          // Alta (6+)
};

// Limites para AR (Arquivos Referenciados) - EE/CE
const getARIndexEECE = (ar: number): number => {
  if (ar <= 1) return 0;            // Baixa
  if (ar === 2) return 1;           // Média
  return 2;                         // Alta (3+)
};

// Limites para AR (Arquivos Referenciados) - SE
const getARIndexSE = (ar: number): number => {
  if (ar <= 1) return 0;            // Baixa
  if (ar >= 2 && ar <= 3) return 1; // Média
  return 2;                         // Alta (4+)
};

// ====================
// 2. MATRIZES COM VALORES CORRETOS
// ====================

// Matriz para ALI (Arquivo Lógico Interno)
const matrizALI = [
  [7, 7, 7],     // Baixa (TR=1)
  [7, 10, 15],   // Média (TR=2-5)
  [10, 15, 15],  // Alta (TR=6+)
];

// Matriz para AIE (Arquivo de Interface Externa)
const matrizAIE = [
  [5, 5, 5],     // Baixa (TR=1)
  [5, 7, 10],    // Média (TR=2-5)
  [7, 10, 10],   // Alta (TR=6+)
];

// Matriz para EE (Entrada Externa) e CE (Consulta Externa)
const matrizEECE = [
  [3, 3, 3],     // Baixa (AR=0-1)
  [3, 4, 6],     // Média (AR=2)
  [4, 6, 6],     // Alta (AR=3+)
];

// Matriz para SE (Saída Externa)
const matrizSE = [
  [4, 4, 4],     // Baixa (AR=0-1)
  [4, 5, 7],     // Média (AR=2-3)
  [5, 7, 7],     // Alta (AR=4+)
];

// ====================
// 3. FUNÇÕES AUXILIARES
// ====================

// Função para determinar complexidade textual
const getComplexidadeTexto = (tdIndex: number, arTrIndex: number, tipo: string): string => {
  const niveis = ['Baixa', 'Média', 'Alta'];
  
  // Para funções de dados (ALI/AIE): TR define linha, TD define coluna
  if (tipo === 'ALI' || tipo === 'AIE') {
    const linha = arTrIndex; // TR index
    const coluna = tdIndex;  // TD index
    
    // Garantir índices válidos
    const linhaSegura = Math.min(linha, 2);
    const colunaSegura = Math.min(coluna, 2);
    
    // Mapear para texto
    if (linhaSegura === 0 && colunaSegura === 0) return 'Baixa';
    if (linhaSegura === 2 && colunaSegura === 2) return 'Alta';
    return 'Média';
  }
  
  // Para funções de transação: AR define linha, TD define coluna
  const linha = arTrIndex; // AR index
  const coluna = tdIndex;  // TD index
  
  // Garantir índices válidos
  const linhaSegura = Math.min(linha, 2);
  const colunaSegura = Math.min(coluna, 2);
  
  if (linhaSegura === 0 && colunaSegura === 0) return 'Baixa';
  if (linhaSegura === 2 && colunaSegura === 2) return 'Alta';
  return 'Média';
};

// ====================
// 4. FUNÇÃO PRINCIPAL
// ====================

// Função principal para calcular PF
export const calcularPF = (tipo: string, td: number, arTr: number) => {
  // Converter tipo para português se necessário (para compatibilidade)
  const tipoPTMap: Record<string, string> = {
    'EI': 'EE', 'EO': 'SE', 'EQ': 'CE',
    'ILF': 'ALI', 'EIF': 'AIE'
  };
  const tipoPT = tipoPTMap[tipo] || tipo;
  
  let pf = 0;
  let complexidade = 'Média';
  let tdIndex = 0;
  let arTrIndex = 0;
  
  try {
    // Selecionar matriz e índices baseados no tipo
    switch (tipoPT) {
      case 'ALI':
        tdIndex = getTDIndexALI(td);
        arTrIndex = getTRIndex(arTr);
        pf = matrizALI[arTrIndex][tdIndex]; // TR x TD
        complexidade = getComplexidadeTexto(tdIndex, arTrIndex, 'ALI');
        break;
        
      case 'AIE':
        tdIndex = getTDIndexALI(td);
        arTrIndex = getTRIndex(arTr);
        pf = matrizAIE[arTrIndex][tdIndex]; // TR x TD
        complexidade = getComplexidadeTexto(tdIndex, arTrIndex, 'AIE');
        break;
        
      case 'EE':
      case 'CE':
        tdIndex = getTDIndexEECE(td);
        arTrIndex = getARIndexEECE(arTr);
        pf = matrizEECE[arTrIndex][tdIndex]; // AR x TD
        complexidade = getComplexidadeTexto(tdIndex, arTrIndex, 'EE');
        break;
        
      case 'SE':
        tdIndex = getTDIndexSE(td);
        arTrIndex = getARIndexSE(arTr);
        pf = matrizSE[arTrIndex][tdIndex]; // AR x TD
        complexidade = getComplexidadeTexto(tdIndex, arTrIndex, 'SE');
        break;
        
      default:
        pf = 3; // Valor padrão se tipo inválido
        complexidade = 'Não calculada';
    }
    
    // Garantir que pf seja número
    pf = Number(pf) || 0;
    
  } catch (error) {
    console.error('Erro no cálculo de PF:', error, { tipo, td, arTr });
    pf = 0;
    complexidade = 'Erro';
  }
  
  return { pf, complexidade, tipoPT };
};

// ====================
// 5. FUNÇÕES DE CLASSIFICAÇÃO
// ====================

// Função para classificar função como Dados ou Transação
export const classificarFuncao = (tipo: string) => {
  const tipoPTMap: Record<string, string> = {
    'EI': 'EE', 'EO': 'SE', 'EQ': 'CE',
    'ILF': 'ALI', 'EIF': 'AIE'
  };
  const tipoPT = tipoPTMap[tipo] || tipo;
  
  const funcoesDados = ['ALI', 'AIE', 'ILF', 'EIF'];
  const funcoesTransacao = ['EE', 'SE', 'CE', 'EI', 'EO', 'EQ'];
  
  if (funcoesDados.includes(tipoPT)) return 'dados';
  if (funcoesTransacao.includes(tipoPT)) return 'transacao';
  return 'desconhecido';
};

// Função para obter label do tipo (para exibição)
export const getTipoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    // Português
    'ALI': 'ALI - Arquivo Lógico Interno',
    'AIE': 'AIE - Arquivo de Interface Externa',
    'EE': 'EE - Entrada Externa',
    'SE': 'SE - Saída Externa',
    'CE': 'CE - Consulta Externa',
    // Inglês (para compatibilidade)
    'ILF': 'ILF - Internal Logical File',
    'EIF': 'EIF - External Interface File',
    'EI': 'EI - External Input',
    'EO': 'EO - External Output',
    'EQ': 'EQ - External Inquiry',
  };
  
  return labels[tipo] || tipo;
};

// Função para verificar se tipo usa AR ou TR
export const getCampoReferenciaLabel = (tipo: string) => {
  const tipoPTMap: Record<string, string> = {
    'EI': 'EE', 'EO': 'SE', 'EQ': 'CE',
    'ILF': 'ALI', 'EIF': 'AIE'
  };
  const tipoPT = tipoPTMap[tipo] || tipo;
  
  if (tipoPT === 'ALI' || tipoPT === 'AIE') {
    return { label: 'TR (Tipos de Registro)', descricao: 'Subgrupos de dados' };
  } else {
    return { label: 'AR (Arquivos Referenciados)', descricao: 'Arquivos lógicos acessados' };
  }
};