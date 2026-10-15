import { ModalidadeId } from './modalidades.models';

export type EstadoConcurso =
  | 'RASCUNHO'
  | 'PENDENTE_APROVACAO'
  | 'PUBLICADO'
  | 'EM_AVALIACAO'
  | 'ADJUDICADO'
  | 'CANCELADO'
  | 'INVALIDADO'
  | 'EM_EXECUCAO'
  | 'CONCLUIDO';

export type ProvinciaMZ =
  | 'Maputo Cidade'
  | 'Maputo Província'
  | 'Gaza'
  | 'Inhambane'
  | 'Sofala'
  | 'Manica'
  | 'Tete'
  | 'Zambézia'
  | 'Nampula'
  | 'Niassa'
  | 'Cabo Delgado';

export interface ConcursoDocumento {
  id: string;
  nome: string;
  tamanhoBytes: number;
  tipoMime: string;
  dataUpload: string;
  descricao?: string;
  obrigatorio?: boolean;
}

export type CriterioAvaliacao = 'MENOR_PRECO' | 'COMBINADO';

export interface Concurso {
  id: string;
  numeroProcesso: string; // Ex: MTL/UGEA/CP-01/2026
  titulo: string;
  objecto: string;
  modalidadeId: ModalidadeId;
  valorEstimadoMZN: number;
  provincia: ProvinciaMZ;
  localizacaoEspecifica?: string;
  prazoSubmissao: string; // ISO 8601
  dataAbertura: string;   // ISO 8601
  dataCriacao: string;    // ISO 8601
  dataPublicacao?: string; // ISO 8601
  estado: EstadoConcurso;
  criadoPorId: string;
  criadoPorNome: string;
  juriDesignadoIds: string[]; // Técnicos nomeados como júri
  documentos: ConcursoDocumento[];
  criterioAvaliacao: CriterioAvaliacao;
  pesoTecnico: number;      // e.g. 60
  pesoFinanceiro: number;   // e.g. 40
  trocoEstradaId?: string;  // Ligação ao SIG
  despachoAprovacao?: string;
  despachoAdjudicacao?: string;
  justificacaoCancelamento?: string;
  vencedorAdjudicadoId?: string;
  vencedorAdjudicadoNome?: string;
  valorAdjudicadoMZN?: number;
  dataAdjudicacao?: string;
}

export interface ConcursoFilter {
  texto?: string;
  modalidade?: ModalidadeId | 'TODAS';
  estado?: EstadoConcurso | 'TODOS';
  provincia?: ProvinciaMZ | 'TODAS';
}

export interface StateTransitionRule {
  de: EstadoConcurso;
  para: EstadoConcurso;
  perfisPermitidos: ('ADMIN' | 'GESTAO' | 'TECNICO')[];
  descricao: string;
}

export const CONCURSO_STATE_TRANSITIONS: StateTransitionRule[] = [
  {
    de: 'RASCUNHO',
    para: 'PENDENTE_APROVACAO',
    perfisPermitidos: ['TECNICO', 'ADMIN'],
    descricao: 'Submeter rascunho de concurso para aprovação pela Gestão'
  },
  {
    de: 'PENDENTE_APROVACAO',
    para: 'PUBLICADO',
    perfisPermitidos: ['GESTAO', 'ADMIN'],
    descricao: 'Homologar e publicar oficialmente o concurso no portal'
  },
  {
    de: 'PENDENTE_APROVACAO',
    para: 'RASCUNHO',
    perfisPermitidos: ['GESTAO', 'ADMIN'],
    descricao: 'Devolver concurso à UGEA para correcção ou esclarecimentos'
  },
  {
    de: 'PUBLICADO',
    para: 'EM_AVALIACAO',
    perfisPermitidos: ['TECNICO', 'GESTAO', 'ADMIN'],
    descricao: 'Ato de abertura pública das propostas pelo Júri (após fim do prazo/data de abertura)'
  },
  {
    de: 'EM_AVALIACAO',
    para: 'ADJUDICADO',
    perfisPermitidos: ['GESTAO', 'ADMIN'],
    descricao: 'Aprovação do Relatório de Avaliação e Despacho de Adjudicação'
  },
  {
    de: 'EM_AVALIACAO',
    para: 'CANCELADO',
    perfisPermitidos: ['GESTAO', 'ADMIN'],
    descricao: 'Cancelar o concurso por razões de interesse público justificadas'
  },
  {
    de: 'EM_AVALIACAO',
    para: 'INVALIDADO',
    perfisPermitidos: ['GESTAO', 'ADMIN'],
    descricao: 'Invalidar o concurso (ex: todas as propostas desclassificadas)'
  },
  {
    de: 'ADJUDICADO',
    para: 'EM_EXECUCAO',
    perfisPermitidos: ['GESTAO', 'TECNICO', 'ADMIN'],
    descricao: 'Celebração de contrato e início de fiscalização e execução'
  },
  {
    de: 'EM_EXECUCAO',
    para: 'CONCLUIDO',
    perfisPermitidos: ['GESTAO', 'TECNICO', 'ADMIN'],
    descricao: 'Recepção definitiva da obra/serviço e encerramento administrativo'
  }
];
