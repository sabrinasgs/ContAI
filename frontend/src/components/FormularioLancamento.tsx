import React, { useState } from 'react';
import { LancamentoForm } from '../types';

interface Props {
  onSubmit: (dados: LancamentoForm) => Promise<void>;
  loading?: boolean;
}

export const FormularioLancamento: React.FC<Props> = ({ onSubmit, loading = false }) => {
  const [dados, setDados] = useState<LancamentoForm>({
    dataLancamento: new Date().toISOString().split('T')[0],
    descricao: '',
    valor: '',
    tipo: 'CREDITO'
  });

  const [erros, setErros] = useState<{[key: string]: string}>({});

  const validarFormulario = (): boolean => {
    const novosErros: {[key: string]: string} = {};

    if (!dados.dataLancamento) {
      novosErros.dataLancamento = 'Data é obrigatória';
    }

    if (!dados.descricao.trim()) {
      novosErros.descricao = 'Descrição é obrigatória';
    } else if (dados.descricao.trim().length < 3) {
      novosErros.descricao = 'Descrição deve ter pelo menos 3 caracteres';
    }

    if (!dados.valor) {
      novosErros.valor = 'Valor é obrigatório';
    } else {
      const valorNumerico = parseFloat(dados.valor);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        novosErros.valor = 'Valor deve ser um número positivo';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      await onSubmit(dados);
      setDados({
        dataLancamento: new Date().toISOString().split('T')[0],
        descricao: '',
        valor: '',
        tipo: 'CREDITO'
      });
      setErros({});
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDados(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="formulario-container">
      <h2>Novo Lançamento</h2>
      
      <form onSubmit={handleSubmit} className="formulario-lancamento">
        <div className="campo">
          <label htmlFor="dataLancamento">Data do Lançamento:</label>
          <input
            type="date"
            id="dataLancamento"
            name="dataLancamento"
            value={dados.dataLancamento}
            onChange={handleChange}
            required
            className={erros.dataLancamento ? 'erro' : ''}
          />
          {erros.dataLancamento && <span className="erro-msg">{erros.dataLancamento}</span>}
        </div>

        <div className="campo">
          <label htmlFor="descricao">Descrição:</label>
          <input
            type="text"
            id="descricao"
            name="descricao"
            value={dados.descricao}
            onChange={handleChange}
            required
            maxLength={255}
            placeholder="Descrição do lançamento"
            className={erros.descricao ? 'erro' : ''}
          />
          {erros.descricao && <span className="erro-msg">{erros.descricao}</span>}
        </div>

        <div className="campo">
          <label htmlFor="valor">Valor:</label>
          <input
            type="number"
            id="valor"
            name="valor"
            value={dados.valor}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            required
            placeholder="0,00"
            className={erros.valor ? 'erro' : ''}
          />
          {erros.valor && <span className="erro-msg">{erros.valor}</span>}
        </div>

        <div className="campo">
          <label htmlFor="tipo">Tipo:</label>
          <select
            id="tipo"
            name="tipo"
            value={dados.tipo}
            onChange={handleChange}
            required
          >
            <option value="CREDITO">Crédito</option>
            <option value="DEBITO">Débito</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Salvando...' : 'Salvar Lançamento'}
        </button>
      </form>
    </div>
  );
};