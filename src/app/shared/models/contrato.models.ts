export type VistoTAEstado = 'PENDENTE' | 'VISADO' | 'RECUSADO';

export interface ChecklistHabilitacao {
  certidaoQuitacaoFiscal: boolean;     // Autoridade Tributária
  certidaoQuitacaoINSS: boolean;       // Segurança Social
  garantiaDefinitivaBancaria: boolean; // 5% a 10%
  alvaraConstrucaoValido: boolean;     // MOPHR
  certidaoRegistoComercial: boolean;   // Conservatória
}

export interface AutoMedicao {
  id: string;
  contratoId: string;
  numeroAuto: number;
  dataMedicao: string; // ISO 8601
  percentualFisicoPeriodo: number;
  percentualFisicoAcumulado: number;
  valorMedicaoMZN: number;
  observacoes: string;
  fotoSimuladaDescricao?: string;
  registadoPorNome: string;
  aprovadoPorFiscal: boolean;
}

export interface PagamentoContrato {
  id: string;
  contratoId: string;
  numeroFatura: string;
  tipo: 'ADIANTAMENTO' | 'MEDICAO' | 'LIBERACAO_RETENCAO';
  valorPagoMZN: number;
  dataPagamento: string;
  observacoes?: string;
  registadoPor: string;
}

export interface OcorrenciaContrato {
  id: string;
  contratoId: string;
  tipo: 'OCORRENCIA' | 'PENALIDADE' | 'ALERTA_DESVIO' | 'SUSPENSAO_TRABALHOS';
  titulo: string;
  descricao: string;
  dataRegisto: string;
  gravidade: 'BAIXA' | 'MEDIA' | 'ALTA';
  resolvida: boolean;
  resolucaoDescricao?: string;
  registadoPor: string;
}

export interface AdendaContrato {
  id: string;
  contratoId: string;
  numeroAdenda: number;
  tipo: 'PRAZO' | 'VALOR' | 'PRAZO_E_VALOR';
  justificacao: string;
  prazoAdicionalDias?: number;
  valorAdicionalMZN?: number;
  estado: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  propostaPorNome: string;
  dataProposta: string;
  aprovadaPorNome?: string;
  dataAprovacao?: string;
  despacho?: string;
}

export interface Contrato {
  id: string;
  concursoId: string;
  numeroContrato: string; // Ex: CT-MTL/2026/004
  objecto: string;
  adjudicatarioId: string;
  adjudicatarioNome: string;
  adjudicatarioNuit: string;
  valorInicialMZN: number;
  valorAtualizadoMZN: number;
  dataAssinatura: string;
  prazoMeses: number;
  dataFimPrevista: string;
  dataFimEfetiva?: string;
  gestorContratoNome: string;
  fiscalObraNome: string;
  vistoTribunalAdministrativo: VistoTAEstado;
  numeroProcessoTA?: string;
  dataVistoTA?: string;
  checklistHabilitacao: ChecklistHabilitacao;
  trocoEstradaId?: string;
  estado: 'VIGENTE' | 'SUSPENSO' | 'CONCLUIDO';
  recepcaoProvisoriaData?: string;
  recepcaoDefinitivaData?: string;
  observacoesEncerramento?: string;
}
