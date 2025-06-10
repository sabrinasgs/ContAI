import { Router } from 'express';
import { LancamentoController } from '../controllers/LancamentoController';
import { body, param } from 'express-validator';
import { TipoLancamento } from '../entities/Lancamento';

const router = Router();
const lancamentoController = new LancamentoController();

// Validações
const validarLancamento = [
  body('dataLancamento')
    .notEmpty()
    .withMessage('Data do lançamento é obrigatória')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Data deve estar no formato AAAA-MM-DD')
    .isDate()
    .withMessage('Data deve ser válida'),

  body('descricao')
    .notEmpty()
    .withMessage('Descrição é obrigatória')
    .isLength({ min: 3, max: 255 })
    .withMessage('Descrição deve ter entre 3 e 255 caracteres')
    .trim(),

  body('valor')
    .notEmpty()
    .withMessage('Valor é obrigatório')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser um número positivo')
    .toFloat(),

  body('tipo')
    .notEmpty()
    .withMessage('Tipo de lançamento é obrigatório')
    .isIn([TipoLancamento.CREDITO, TipoLancamento.DEBITO])
    .withMessage('Tipo deve ser CREDITO ou DEBITO')
];

const validarMesAno = [
  param('ano')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Ano deve ser um número válido entre 2000 e 2100'),
  
  param('mes')
    .isInt({ min: 1, max: 12 })
    .withMessage('Mês deve ser um número válido entre 1 e 12')
];

// Rotas dos lançamentos
router.post('/lancamentos', validarLancamento, lancamentoController.criar);
router.get('/lancamentos', lancamentoController.listar);
router.get('/lancamentos/resumo', lancamentoController.obterResumo);
router.get('/lancamentos/:ano/:mes', validarMesAno, lancamentoController.listarPorMes);

export { router as lancamentoRoutes };