export interface RegistoAuditoria {
  id: string;
  timestamp: string; // ISO 8601
  usuarioId: string;
  usuarioNome: string;
  perfil: string;
  acao: string;
  entidade: 'CONCURSO' | 'PROPOSTA' | 'JURI' | 'CONTRATO' | 'MEDICAO' | 'PAGAMENTO' | 'UTILIZADOR' | 'DEMO' | 'SISTEMA';
  entidadeId?: string;
  detalhes: string;
  ipOrigem?: string;
}
