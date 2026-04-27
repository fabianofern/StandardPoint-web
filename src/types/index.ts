export interface Requisito {
  id: string;
  projeto_id?: string;
  descricao: string;
  tipo: string | null;
  dataCriacao?: string;
  updatedAt?: string;
}

export interface Funcao {
  id: string;
  requisitoId: string | null;
  requisitoDescricao?: string | null;
  numeroFuncao: string;
  nome: string;
  tipo: string;
  td: number;
  arTr: number;
  descricao: string | null;
  complexidade: string;
  pf: number;
  tipoMelhoria?: string | null;
  dataCriacao?: string;
}

export interface SquadMembro {
  id: string;
  funcionarioId?: string;
  funcionario_id?: string; // para retrocompatibilidade
  adicionadoEm?: string;
}

export interface Projeto {
  id: string;
  empresa_id?: string;
  nome: string;
  descricao: string | null;
  dataInicioContagem?: string | null;
  dataFimContagem?: string | null;
  data_inicio_contagem?: string | null;
  data_fim_contagem?: string | null;
  tipoContagem?: string;
  squad: SquadMembro[];
  requisitos: Requisito[];
  funcoes: Funcao[];
  vaf?: {
    valor: number;
    [key: string]: any;
  };
  dataCriacao?: string;
  updatedAt?: string;
}

export interface Cargo {
  id: string;
  titulo: string;
  fatorPF: number;
  fator_pf?: number; // retrocompatibilidade
}

export interface Funcionario {
  id: string;
  nome: string;
  cargoId: string;
  cargo_id?: string; // retrocompatibilidade
  fatorIndividualPF: number;
  fator_individual_pf?: number;
}

export interface Empresa {
  id: string;
  nome: string;
  valorPF: number;
  valor_pf?: number; // retrocompatibilidade
  hcpp: number;
  faseCiclo: string | null;
  fase_ciclo?: string | null; // retrocompatibilidade
  cargos: Cargo[];
  funcionarios: Funcionario[];
  projetos: Projeto[];
  dataCriacao?: string;
  updatedAt?: string;
  equipe?: any[]; // legacy
}

export interface GlobalState {
  empresas: Empresa[];
  empresaAtual: string | null;
  projetoAtual: string | null;
  lastModified: string;
  version: string;
}
