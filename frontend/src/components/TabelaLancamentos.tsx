import React from 'react';
import { LancamentosPorMes } from '../types';

interface Props {
  lancamentosPorMes: LancamentosPorMes[];
  loading?: boolean;
}

export const TabelaLancamentos: React.FC<Props> = ({ lancamentosPorMes, loading = false }) => {
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (loading) {
    return (
      <div className="tabela-container">
        <h2>Lançamentos Contábeis</h2>
        <div className="loading">Carregando lançamentos...</div>
      </div>
    );
  }

  return (
    <div className="tabela-container">
      <h2>Lançamentos Contábeis</h2>
      
      {lancamentosPorMes.length === 0 ? (
        <div className="vazio">
          <p>Nenhum lançamento encontrado.</p>
          <p>Cadastre o primeiro lançamento usando o formulário acima.</p>
        </div>
      ) : (
        lancamentosPorMes.map((grupo) => (
          <div key={`${grupo.ano}-${grupo.mes}`} className="mes-group">
            <h3 className="mes-titulo">
              {grupo.mesNome} {grupo.ano}
            </h3>
            
            <div className="tabela-wrapper">
              <table className="tabela-lancamentos">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.lancamentos.map((lancamento) => (
                    <tr key={lancamento.id}>
                      <td>{formatarData(lancamento.dataLancamento)}</td>
                      <td className="descricao">{lancamento.descricao}</td>
                      <td className={`valor ${lancamento.tipo.toLowerCase()}`}>
                        {formatarValor(Number(lancamento.valor))}
                      </td>
                      <td>
                        <span className={`badge ${lancamento.tipo.toLowerCase()}`}>
                          {lancamento.tipo === 'CREDITO' ? 'Crédito' : 'Débito'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="totais-mes">
              <div className="total-item credito">
                <span className="label">Total Créditos:</span>
                <span className="valor">{formatarValor(grupo.totais.creditos)}</span>
                <span className="quantidade">({grupo.totais.quantidadeCreditos} lançamentos)</span>
              </div>
              
              <div className="total-item debito">
                <span className="label">Total Débitos:</span>
                <span className="valor">{formatarValor(grupo.totais.debitos)}</span>
                <span className="quantidade">({grupo.totais.quantidadeDebitos} lançamentos)</span>
              </div>
              
              <div className={`total-item saldo ${grupo.totais.saldo >= 0 ? 'positivo' : 'negativo'}`}>
                <span className="label">Saldo do Mês:</span>
                <span className="valor">{formatarValor(grupo.totais.saldo)}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};