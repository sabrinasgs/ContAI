import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Lancamento, TipoLancamento } from '../entities/Lancamento';
import { validationResult } from 'express-validator';

const lancamentoRepository = AppDataSource.getRepository(Lancamento);

export class LancamentoController {
  async criar(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Dados inválidos',
          errors: errors.array() 
        });
      }

      const { dataLancamento, descricao, valor, tipo } = req.body;

      const lancamento = lancamentoRepository.create({
        dataLancamento: new Date(dataLancamento),
        descricao: descricao.trim(),
        valor: parseFloat(valor),
        tipo: tipo as TipoLancamento
      });

      const resultado = await lancamentoRepository.save(lancamento);
      
      return res.status(201).json({
        message: 'Lançamento criado com sucesso',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const lancamentos = await lancamentoRepository.find({
        order: { dataLancamento: 'DESC', createdAt: 'DESC' }
      });

      // Agrupar por mês e calcular totais
      const lancamentosAgrupados = this.agruparPorMes(lancamentos);

      return res.json({
        message: 'Lançamentos listados com sucesso',
        data: lancamentosAgrupados,
        total: lancamentos.length
      });
    } catch (error) {
      console.error('Erro ao listar lançamentos:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  async listarPorMes(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Parâmetros inválidos',
          errors: errors.array() 
        });
      }

      const { ano, mes } = req.params;
      
      const inicioMes = new Date(parseInt(ano), parseInt(mes) - 1, 1);
      const fimMes = new Date(parseInt(ano), parseInt(mes), 0);

      const lancamentos = await lancamentoRepository
        .createQueryBuilder('lancamento')
        .where('lancamento.dataLancamento >= :inicio', { inicio: inicioMes })
        .andWhere('lancamento.dataLancamento <= :fim', { fim: fimMes })
        .orderBy('lancamento.dataLancamento', 'ASC')
        .getMany();

      const totais = this.calcularTotais(lancamentos);

      return res.json({
        message: `Lançamentos de ${mes}/${ano} listados com sucesso`,
        data: {
          lancamentos,
          totais,
          periodo: {
            ano: parseInt(ano),
            mes: parseInt(mes),
            mesNome: this.obterNomeMes(parseInt(mes))
          }
        }
      });
    } catch (error) {
      console.error('Erro ao listar lançamentos por mês:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  async obterResumo(req: Request, res: Response) {
    try {
      const totalLancamentos = await lancamentoRepository.count();
      
      const result = await lancamentoRepository
        .createQueryBuilder('lancamento')
        .select('lancamento.tipo', 'tipo')
        .addSelect('SUM(lancamento.valor)', 'total')
        .addSelect('COUNT(lancamento.id)', 'quantidade')
        .groupBy('lancamento.tipo')
        .getRawMany();

      const resumo = {
        totalLancamentos,
        creditos: {
          total: 0,
          quantidade: 0
        },
        debitos: {
          total: 0,
          quantidade: 0
        },
        saldo: 0
      };

      result.forEach(item => {
        if (item.tipo === TipoLancamento.CREDITO) {
          resumo.creditos.total = parseFloat(item.total);
          resumo.creditos.quantidade = parseInt(item.quantidade);
        } else {
          resumo.debitos.total = parseFloat(item.total);
          resumo.debitos.quantidade = parseInt(item.quantidade);
        }
      });

      resumo.saldo = resumo.creditos.total - resumo.debitos.total;

      return res.json({
        message: 'Resumo obtido com sucesso',
        data: resumo
      });
    } catch (error) {
      console.error('Erro ao obter resumo:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  private agruparPorMes(lancamentos: Lancamento[]) {
    const grupos: { [key: string]: any } = {};

    lancamentos.forEach(lancamento => {
      const data = new Date(lancamento.dataLancamento);
      const chave = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!grupos[chave]) {
        grupos[chave] = {
          ano: data.getFullYear(),
          mes: data.getMonth() + 1,
          mesNome: this.obterNomeMes(data.getMonth() + 1),
          lancamentos: [],
          totais: {
            creditos: 0,
            debitos: 0,
            saldo: 0,
            quantidadeCreditos: 0,
            quantidadeDebitos: 0
          }
        };
      }

      grupos[chave].lancamentos.push(lancamento);
      
      if (lancamento.tipo === TipoLancamento.CREDITO) {
        grupos[chave].totais.creditos += Number(lancamento.valor);
        grupos[chave].totais.quantidadeCreditos++;
      } else {
        grupos[chave].totais.debitos += Number(lancamento.valor);
        grupos[chave].totais.quantidadeDebitos++;
      }
    });

    // Calcular saldo para cada mês
    Object.keys(grupos).forEach(chave => {
      grupos[chave].totais.saldo = grupos[chave].totais.creditos - grupos[chave].totais.debitos;
    });

    return Object.values(grupos);
  }

  private calcularTotais(lancamentos: Lancamento[]) {
    const totais = {
      creditos: 0,
      debitos: 0,
      saldo: 0,
      quantidadeCreditos: 0,
      quantidadeDebitos: 0
    };

    lancamentos.forEach(lancamento => {
      if (lancamento.tipo === TipoLancamento.CREDITO) {
        totais.creditos += Number(lancamento.valor);
        totais.quantidadeCreditos++;
      } else {
        totais.debitos += Number(lancamento.valor);
        totais.quantidadeDebitos++;
      }
    });

    totais.saldo = totais.creditos - totais.debitos;
    return totais;
  }

  private obterNomeMes(mes: number): string {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
  }
}