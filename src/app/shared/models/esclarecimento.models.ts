export interface PedidoEsclarecimento {
  id: string;
  concursoId: string;
  autorId: string;
  autorNome: string;
  autorNuit?: string;
  dataPergunta: string; // ISO
  pergunta: string;
  resposta?: string;
  dataResposta?: string;
  respondidoPorNome?: string;
  publicado: boolean;
}
