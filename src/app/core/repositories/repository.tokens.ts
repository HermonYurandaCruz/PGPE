import { InjectionToken } from '@angular/core';
import { Concurso, ConcursoFilter } from '../../shared/models/concurso.models';
import { Proposta, AtaAbertura } from '../../shared/models/proposta.models';
import { Contrato, AutoMedicao, PagamentoContrato, OcorrenciaContrato, AdendaContrato } from '../../shared/models/contrato.models';
import { TrocoEstrada } from '../../shared/models/estrada.models';
import { RegistoAuditoria } from '../../shared/models/audit.models';
import { User } from '../../shared/models/auth.models';
import { PedidoEsclarecimento } from '../../shared/models/esclarecimento.models';
import { ReclamacaoRecurso } from '../../shared/models/reclamacao.models';
import { DenunciaCidada } from '../../shared/models/denuncia.models';

export interface IConcursoRepository {
  listar(filtro?: ConcursoFilter): Promise<Concurso[]>;
  obterPorId(id: string): Promise<Concurso | null>;
  salvar(concurso: Concurso): Promise<Concurso>;
  atualizar(id: string, alteracoes: Partial<Concurso>): Promise<Concurso>;
  remover(id: string): Promise<boolean>;
}

export interface IPropostaRepository {
  listarPorConcurso(concursoId: string, incluirSeladas?: boolean): Promise<Proposta[]>;
  listarPorConcorrente(concorrenteId: string): Promise<Proposta[]>;
  obterPorId(id: string): Promise<Proposta | null>;
  submeter(proposta: Proposta): Promise<Proposta>;
  atualizar(id: string, alteracoes: Partial<Proposta>): Promise<Proposta>;
  obterAtaAbertura(concursoId: string): Promise<AtaAbertura | null>;
  salvarAtaAbertura(ata: AtaAbertura): Promise<AtaAbertura>;
}

export interface IContratoRepository {
  listar(): Promise<Contrato[]>;
  obterPorId(id: string): Promise<Contrato | null>;
  obterPorConcursoId(concursoId: string): Promise<Contrato | null>;
  salvar(contrato: Contrato): Promise<Contrato>;
  atualizar(id: string, alteracoes: Partial<Contrato>): Promise<Contrato>;
  
  listarMedicoes(contratoId: string): Promise<AutoMedicao[]>;
  adicionarMedicao(medicao: AutoMedicao): Promise<AutoMedicao>;
  
  listarPagamentos(contratoId: string): Promise<PagamentoContrato[]>;
  adicionarPagamento(pagamento: PagamentoContrato): Promise<PagamentoContrato>;
  
  listarOcorrencias(contratoId: string): Promise<OcorrenciaContrato[]>;
  adicionarOcorrencia(ocorrencia: OcorrenciaContrato): Promise<OcorrenciaContrato>;
  
  listarAdendas(contratoId: string): Promise<AdendaContrato[]>;
  adicionarAdenda(adenda: AdendaContrato): Promise<AdendaContrato>;
  atualizarAdenda(id: string, alteracoes: Partial<AdendaContrato>): Promise<AdendaContrato>;
}

export interface IEstradaRepository {
  listar(): Promise<TrocoEstrada[]>;
  obterPorId(id: string): Promise<TrocoEstrada | null>;
  atualizar(id: string, alteracoes: Partial<TrocoEstrada>): Promise<TrocoEstrada>;
}

export interface IAuditRepository {
  listar(filtro?: { usuarioId?: string; acao?: string; entidade?: string }): Promise<RegistoAuditoria[]>;
  registar(registo: Omit<RegistoAuditoria, 'id' | 'timestamp'>): Promise<RegistoAuditoria>;
}

export interface IUserRepository {
  listar(): Promise<User[]>;
  obterPorId(id: string): Promise<User | null>;
  obterPorEmail(email: string): Promise<User | null>;
  salvar(user: User): Promise<User>;
  atualizar(id: string, alteracoes: Partial<User>): Promise<User>;
}

export interface IEsclarecimentoRepository {
  listarPorConcurso(concursoId: string): Promise<PedidoEsclarecimento[]>;
  salvar(pedido: PedidoEsclarecimento): Promise<PedidoEsclarecimento>;
  responder(id: string, resposta: string, respondidoPorNome: string): Promise<PedidoEsclarecimento>;
}

export interface IReclamacaoRepository {
  listarPorConcurso(concursoId: string): Promise<ReclamacaoRecurso[]>;
  salvar(reclamacao: ReclamacaoRecurso): Promise<ReclamacaoRecurso>;
  decidir(id: string, decisao: 'DEFERIDO' | 'INDEFERIDO', despacho: string, decididoPorNome: string): Promise<ReclamacaoRecurso>;
}

export interface IDenunciaRepository {
  listar(): Promise<DenunciaCidada[]>;
  salvar(denuncia: DenunciaCidada): Promise<DenunciaCidada>;
  atualizar(id: string, alteracoes: Partial<DenunciaCidada>): Promise<DenunciaCidada>;
}

export const CONCURSO_REPOSITORY = new InjectionToken<IConcursoRepository>('CONCURSO_REPOSITORY');
export const PROPOSTA_REPOSITORY = new InjectionToken<IPropostaRepository>('PROPOSTA_REPOSITORY');
export const CONTRATO_REPOSITORY = new InjectionToken<IContratoRepository>('CONTRATO_REPOSITORY');
export const ESTRADA_REPOSITORY = new InjectionToken<IEstradaRepository>('ESTRADA_REPOSITORY');
export const AUDIT_REPOSITORY = new InjectionToken<IAuditRepository>('AUDIT_REPOSITORY');
export const USER_REPOSITORY = new InjectionToken<IUserRepository>('USER_REPOSITORY');
export const ESCLARECIMENTO_REPOSITORY = new InjectionToken<IEsclarecimentoRepository>('ESCLARECIMENTO_REPOSITORY');
export const RECLAMACAO_REPOSITORY = new InjectionToken<IReclamacaoRepository>('RECLAMACAO_REPOSITORY');
export const DENUNCIA_REPOSITORY = new InjectionToken<IDenunciaRepository>('DENUNCIA_REPOSITORY');
