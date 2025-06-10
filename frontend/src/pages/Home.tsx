import React, { useState, useEffect } from 'react';
import { FormularioLancamento } from '../components/FormularioLancamento';
import { TabelaLancamentos } from '../components/TabelaLancamentos';
import { lancamentoService } from '../services/api';
import { LancamentoForm, LancamentosPorMes } from '../types';

export const Home: React.FC = () => {
  const [lancamentosPorMes, setLancamentosPorMes] = useState<LancamentosPorMes[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [mensagem, setMensagem] = useState<{tipo: 'success' | 'error', texto: string} | null>(null);

  useEffect(() => {
    carregarLancamentos();
  }, []);

  const carregarLancamentos = async () => {
    try {
      setLoading(true);
      const dados = await lancamentoService.listar();
      setLancamentosPorMes(dados);
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error);
      mostrarMensagem('error', 'Erro ao carregar lançamentos. Verifique se o servidor está funcionando.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (dados: LancamentoForm) => {
    try {
      setLoadingForm(true);
      await lancamentoService.criar(dados);
      mostrarMensagem('success', 'Lançamento criado com sucesso!');
      await carregarLancamentos(); // Recarregar a lista
    } catch (error: any) {
      console.error('Erro ao criar lançamento:', error);
      const mensagemErro = error.response?.data?.message || 'Erro ao criar lançamento';
      mostrarMensagem('error', mensagemErro);
    } finally {
      setLoadingForm(false);
    }
  };

  const mostrarMensagem = (tipo: 'success' | 'error', texto: string) => {
    setMensagem({ tipo, texto });
    setTimeout(() => {
      setMensagem(null);
    }, 5000);
  };

  return (
    <div className="home">
      <header className="header">
        <h1>ContAI - Sistema de Lançamentos Contábeis</h1>
        <p>Gerencie seus lançamentos financeiros de forma eficiente</p>
      </header>

      <main className="main-content">
        {mensagem && (
          <div className={`alert alert-${mensagem.tipo}`}>
            {mensagem.texto}
            <button 
              className="alert-close" 
              onClick={() => setMensagem(null)}
            >
              ×
            </button>
          </div>
        )}

        <section className="formulario-section">
          <FormularioLancamento 
            onSubmit={handleSubmit}
            loading={loadingForm}
          />
        </section>

        <section className="tabela-section">
          <TabelaLancamentos 
            lancamentosPorMes={lancamentosPorMes}
            loading={loading}
          />
        </section>
      </main>
    </div>
  );
};