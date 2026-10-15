export interface ReclamacaoRecurso {
  id: string;
  concursoId: string;
  concorrenteId: string;
  concorrenteNome: string;
  concorrenteNuit: string;
  dataSubmissao: string;
  tipo: 'RECLAMACAO' | 'RECURSO_HIERARQUICO';
  fundamentacao: string;
  decisao?: 'DEFERIDO' | 'INDEFERIDO';
  despachoDecisao?: string;
  dataDecisao?: string;
  decididoPorNome?: string;
}
