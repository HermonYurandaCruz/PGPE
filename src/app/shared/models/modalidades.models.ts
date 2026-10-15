export type ModalidadeId =
  | 'CONCURSO_PUBLICO'
  | 'CONCURSO_PREVIA_QUALIFICACAO'
  | 'CONCURSO_DUAS_ETAPAS'
  | 'CONCURSO_LIMITADO'
  | 'CONCURSO_LANCES'
  | 'CONCURSO_PEQUENA_DIMENSAO'
  | 'CONCURSO_COTACOES'
  | 'AJUSTE_DIRECTO';

export interface ModalidadeContratacao {
  id: ModalidadeId;
  codigo: string;
  nome: string;
  descricao: string;
  aplicacaoTipica: string;
  prazoMinimoDias: number;
  documentosExigiveis: string[];
  baseLegal: string;
  limiteValorMaximo?: number; // em MZN quando aplicável
}

export const MODALIDADES_DECRETO_79_2022: Record<ModalidadeId, ModalidadeContratacao> = {
  CONCURSO_PUBLICO: {
    id: 'CONCURSO_PUBLICO',
    codigo: 'CP',
    nome: 'Concurso Público',
    descricao: 'Modalidade regra para contratações gerais acima dos limiares regulamentares com participação aberta.',
    aplicacaoTipica: 'Obras de grande vulto, fornecimento de bens e serviços de grande escala para infraestruturas de transportes.',
    prazoMinimoDias: 21,
    documentosExigiveis: [
      'Caderno de Encargos Completo',
      'Termos de Referência',
      'Programa do Concurso',
      'Minuta do Contrato',
      'Garantia Provisória de Proposta'
    ],
    baseLegal: 'Artigo 45 a 49 do Regulamento de Contratação de Empreitada de Obras Públicas (Dec. 79/2022).'
  },
  CONCURSO_PREVIA_QUALIFICACAO: {
    id: 'CONCURSO_PREVIA_QUALIFICACAO',
    codigo: 'CPQ',
    nome: 'Concurso com Prévia Qualificação',
    descricao: 'Processo em duas fases onde primeiro se afere a capacidade técnica e financeira antes da apresentação de propostas.',
    aplicacaoTipica: 'Projectos complexos de engenharia viária, pontes metálicas, túneis e sistemas ferroviários.',
    prazoMinimoDias: 30,
    documentosExigiveis: [
      'Documento de Solicitação de Manifestação de Interesse',
      'Critérios de Qualificação Técnica e Financeira',
      'Caderno de Encargos Preliminar',
      'Declaração de Capacidade Instalada'
    ],
    baseLegal: 'Artigo 50 a 53 do Dec. 79/2022.'
  },
  CONCURSO_DUAS_ETAPAS: {
    id: 'CONCURSO_DUAS_ETAPAS',
    codigo: 'CDE',
    nome: 'Concurso em Duas Etapas',
    descricao: 'Primeira etapa técnica sem preços para definição da solução técnica óptima, seguida de propostas finais com preço.',
    aplicacaoTipica: 'Projectos de alta tecnologia de controlo de tráfego, pedagens electrónicas e fiscalização inteligente.',
    prazoMinimoDias: 30,
    documentosExigiveis: [
      'Documento de Especificações Funcionais',
      'Directrizes para Proposta Técnica Inicial',
      'Metodologia de Ajuste dos Cadernos de Encargos'
    ],
    baseLegal: 'Artigo 54 a 56 do Dec. 79/2022.'
  },
  CONCURSO_LIMITADO: {
    id: 'CONCURSO_LIMITADO',
    codigo: 'CL',
    nome: 'Concurso Limitado',
    descricao: 'Convite dirigido a um número determinado de operadores registados no Cadastro Único com qualificação compatível.',
    aplicacaoTipica: 'Serviços especializados de consultoria de engenharia ou manutenção especializada de equipamentos viários.',
    prazoMinimoDias: 15,
    documentosExigiveis: [
      'Carta-Convite com Lista de Concorrentes Convidados',
      'Termos de Referência Específicos',
      'Modelo de Proposta Financeira'
    ],
    baseLegal: 'Artigo 57 a 60 do Dec. 79/2022.'
  },
  CONCURSO_LANCES: {
    id: 'CONCURSO_LANCES',
    codigo: 'CLP',
    nome: 'Concurso por Lances',
    descricao: 'Sessão pública sucessiva de lances decrescentes de preços após admissão prévia de conformidade técnica.',
    aplicacaoTipica: 'Aquisição de combustíveis a granel, asfalto betuminoso padrão e sinalização vertical convencional.',
    prazoMinimoDias: 10,
    documentosExigiveis: [
      'Edital de Lances',
      'Regras de Degrau Mínimo de Lance',
      'Ficha Técnica Padronizada dos Bens'
    ],
    baseLegal: 'Artigo 61 a 64 do Dec. 79/2022.'
  },
  CONCURSO_PEQUENA_DIMENSAO: {
    id: 'CONCURSO_PEQUENA_DIMENSAO',
    codigo: 'CPD',
    nome: 'Concurso de Pequena Dimensão',
    descricao: 'Procedimento simplificado destinado a incentivar micro, pequenas e médias empresas moçambicanas.',
    aplicacaoTipica: 'Reparações pontuais de estradas terciárias, aquisição de peças sobressalentes e serviços correntes.',
    prazoMinimoDias: 7,
    limiteValorMaximo: 5000000,
    documentosExigiveis: [
      'Edital Simplificado',
      'Caderno de Encargos Resumido',
      'Declaração de Elegibilidade MPME'
    ],
    baseLegal: 'Artigo 65 a 68 do Dec. 79/2022.'
  },
  CONCURSO_COTACOES: {
    id: 'CONCURSO_COTACOES',
    codigo: 'CC',
    nome: 'Concurso por Cotações',
    descricao: 'Solicitação formal de pelo menos três cotações escritas a fornecedores qualificados do ramo.',
    aplicacaoTipica: 'Serviços imediatos de desobstrução de vias, sinalização de emergência e fornecimentos de baixo valor.',
    prazoMinimoDias: 3,
    limiteValorMaximo: 1500000,
    documentosExigiveis: [
      'Pedido Formal de Cotação',
      'Mapa de Quantidades e Preços Unitários'
    ],
    baseLegal: 'Artigo 69 a 72 do Dec. 79/2022.'
  },
  AJUSTE_DIRECTO: {
    id: 'AJUSTE_DIRECTO',
    codigo: 'AD',
    nome: 'Ajuste Directo',
    descricao: 'Contratação directa em situações excepcionais devidamente justificadas (urgência imperiosa, fornecedor exclusivo, calamidade).',
    aplicacaoTipica: 'Intervenções de emergência pós-ciclone em pontes e estradas nacionais cortadas.',
    prazoMinimoDias: 1,
    documentosExigiveis: [
      'Despacho Fundamentado de Autorização da Autoridade Competente',
      'Parecer Técnico de Excepcionalidade',
      'Proposta Única Detalhada'
    ],
    baseLegal: 'Artigo 73 a 77 do Dec. 79/2022.'
  }
};
