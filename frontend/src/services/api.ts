import axios from 'axios';
import { Lancamento, LancamentoForm, LancamentosPorMes, Resumo, ApiResponse } from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Interceptador para log de requisições
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador para tratamento de respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const lancamentoService = {
  criar: async (dados: LancamentoForm): Promise<Lancamento> => {
    const response = await api.post<ApiResponse<Lancamento>>('/lancamentos', dados);
    return response.data.data;
  },

  listar: async (): Promise<LancamentosPorMes[]> => {
    const response = await api.get<ApiResponse<LancamentosPorMes[]>>('/lancamentos');
    return response.data.data;
  },

  listarPorMes: async (ano: number, mes: number): Promise<{
    lancamentos: Lancamento[];
    totais: any;
    periodo: any;
  }> => {
    const response = await api.get(`/lancamentos/${ano}/${mes}`);
    return response.data.data;
  },

  obterResumo: async (): Promise<Resumo> => {
    const response = await api.get<ApiResponse<Resumo>>('/lancamentos/resumo');
    return response.data.data;
  },

  verificarSaude: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  }
};