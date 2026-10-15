export interface DenunciaCidada {
  id: string;
  data: string;
  nomeCidadao?: string;
  emailContato?: string;
  telefoneContato?: string;
  concursoId?: string;
  concursoTitulo?: string;
  tipo: 'IRREGULARIDADE' | 'SUGESTAO' | 'DENUNCIA_CORRUPCAO' | 'ELOGIO';
  descricao: string;
  estado: 'RECEBIDA' | 'EM_ANALISE' | 'CONCLUIDA' | 'ARQUIVADA';
  respostaOficial?: string;
}
