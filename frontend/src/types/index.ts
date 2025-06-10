export interface Lancamento {
  id?: number;
  dataLancamento: string;
  descricao: string;
  valor: number;
  tipo: 'CREDITO' | 'DEBITO';
  createdAt?: string;
  updatedAt?: string;
}

export interface LancamentoForm {
  dataLancamento: string;
  descricao: string;
  valor: string;
  tipo: 'CREDITO' | 'DEBITO';
}

export interface Totais {
  creditos: number;
  debitos: number;
  saldo: number;
  quantidadeCreditos: number;
  quantidadeDebitos: number;
}

export interface LancamentosPorMes {
  ano: number;
  mes: number;
  mesNome: string;
  lancamentos: Lancamento[];
  totais: Totais;
}

export interface Resumo {
  totalLancamentos: number;
  creditos: {
    total: number;
    quantidade: number;
  };
  debitos: {
    total: number;
    quantidade: number;
  };
  saldo: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  total?: number;
  errors?: any[];
}

// Esta linha vazia é importante para o TypeScript reconhecer como módulo
export {};