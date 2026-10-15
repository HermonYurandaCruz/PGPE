export interface PropostaDocumento {
  id: string;
  nome: string;
  tipo: 'PROPOSTA_TECNICA' | 'PROPOSTA_FINANCEIRA' | 'QUALIFICACAO' | 'GARANTIA_BANCARIA' | 'OUTRO';
  tamanhoBytes: number;
  tipoMime: string;
  dataUpload: string;
}

export interface PropostaVersao {
  versao: number;
  dataSubmissao: string;
  hashSHA256: string;
  valorPropostoMZN: number;
  prazoExecucaoMeses: number;
  motivoSubstituicao?: string;
}

export interface Proposta {
  id: string;
  concursoId: string;
  concorrenteId: string;
  concorrenteNome: string;
  concorrenteNuit: string;
  concorrenteEmail: string;
  valorPropostoMZN: number;
  prazoExecucaoMeses: number;
  dataSubmissao: string; // ISO 8601
  versao: number;
  hashSHA256: string;
  codigoReferencia: string; // Ex: PROP-MZ-2026-X892
  carimboTemporal: string;
  selada: boolean; // Se true, conteúdo sensível (valores/docs) só é revelado após o ato de abertura pelo júri
  documentos: PropostaDocumento[];
  historicoVersoes: PropostaVersao[];
  
  // Avaliação pelo Júri
  admitida?: boolean;
  motivoInadmissao?: string;
  pontuacaoTecnica?: number;     // 0 a 100
  pontuacaoFinanceira?: number;  // 0 a 100
  pontuacaoFinal?: number;       // Calculada ponderada
  classificacao?: number;        // 1º, 2º, 3º...
  recomendadaParaAdjudicacao?: boolean;
  parecerJuri?: string;
}

export interface AtaAbertura {
  id: string;
  concursoId: string;
  dataAbertura: string;
  juriPresentes: string[];
  totalPropostasRecebidas: number;
  propostasResumo: {
    concorrenteNome: string;
    concorrenteNuit: string;
    codigoReferencia: string;
    dataSubmissao: string;
    hashSHA256: string;
    valorPropostoMZN: number;
    seloIntegro: boolean;
  }[];
  observacoesAto: string;
  geradaEm: string;
}
