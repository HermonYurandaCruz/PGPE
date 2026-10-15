export type EstadoEstrada =
  | 'PLANEADO'
  | 'EM_CONCURSO'
  | 'EM_CONSTRUCAO'
  | 'CONCLUIDO'
  | 'EM_MANUTENCAO';

export interface TrocoEstrada {
  id: string;
  codigo: string;          // Ex: EN1, EN6, EN8, EN101
  designacao: string;      // Ex: Maputo - Xai-Xai (Lote 1: Marracuene a Manhiça)
  provincia: string;
  extensaoKm: number;
  estado: EstadoEstrada;
  concursoId?: string;
  contratoId?: string;
  empreiteiroNome?: string;
  progressoFisico: number;      // 0 a 100
  progressoFinanceiro: number;   // 0 a 100
  coordenadas: [number, number][]; // Lat, Lng
  detalhesTecnicos: {
    tipoPavimento: 'BETUMINOSO' | 'TERRA_BATIDA' | 'CONCRETO' | 'TRATAMENTO_SUPERFICIAL';
    larguraFaixaMetros: number;
    pontesAssociadas: number;
    anoInicio?: number;
    anoPrevisaoConclusao?: number;
  };
}
