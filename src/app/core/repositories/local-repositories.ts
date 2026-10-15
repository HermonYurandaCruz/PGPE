import { Injectable, inject } from '@angular/core';
import { LocalDataStoreService } from '../storage/local-data-store.service';
import {
  IConcursoRepository,
  IPropostaRepository,
  IContratoRepository,
  IEstradaRepository,
  IAuditRepository,
  IUserRepository,
  IEsclarecimentoRepository,
  IReclamacaoRepository,
  IDenunciaRepository
} from './repository.tokens';
import { Concurso, ConcursoFilter } from '../../shared/models/concurso.models';
import { Proposta, AtaAbertura } from '../../shared/models/proposta.models';
import { Contrato, AutoMedicao, PagamentoContrato, OcorrenciaContrato, AdendaContrato } from '../../shared/models/contrato.models';
import { TrocoEstrada } from '../../shared/models/estrada.models';
import { RegistoAuditoria } from '../../shared/models/audit.models';
import { User } from '../../shared/models/auth.models';
import { PedidoEsclarecimento } from '../../shared/models/esclarecimento.models';
import { ReclamacaoRecurso } from '../../shared/models/reclamacao.models';
import { DenunciaCidada } from '../../shared/models/denuncia.models';

@Injectable({ providedIn: 'root' })
export class LocalConcursoRepository implements IConcursoRepository {
  private store = inject(LocalDataStoreService);

  async listar(filtro?: ConcursoFilter): Promise<Concurso[]> {
    return this.store.getConcursos(filtro);
  }

  async obterPorId(id: string): Promise<Concurso | null> {
    return this.store.getConcursoById(id);
  }

  async salvar(concurso: Concurso): Promise<Concurso> {
    return this.store.saveConcurso(concurso);
  }

  async atualizar(id: string, alteracoes: Partial<Concurso>): Promise<Concurso> {
    return this.store.updateConcurso(id, alteracoes);
  }

  async remover(id: string): Promise<boolean> {
    // Soft remove or archive if needed
    const c = this.store.getConcursoById(id);
    if (!c) return false;
    this.store.updateConcurso(id, { estado: 'CANCELADO' });
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalPropostaRepository implements IPropostaRepository {
  private store = inject(LocalDataStoreService);

  async listarPorConcurso(concursoId: string, incluirSeladas = false): Promise<Proposta[]> {
    return this.store.getPropostasPorConcurso(concursoId, incluirSeladas);
  }

  async listarPorConcorrente(concorrenteId: string): Promise<Proposta[]> {
    return this.store.getPropostasPorConcorrente(concorrenteId);
  }

  async obterPorId(id: string): Promise<Proposta | null> {
    return this.store.getPropostaById(id);
  }

  async submeter(proposta: Proposta): Promise<Proposta> {
    return this.store.saveProposta(proposta);
  }

  async atualizar(id: string, alteracoes: Partial<Proposta>): Promise<Proposta> {
    return this.store.updateProposta(id, alteracoes);
  }

  async obterAtaAbertura(concursoId: string): Promise<AtaAbertura | null> {
    return this.store.getAtaAbertura(concursoId);
  }

  async salvarAtaAbertura(ata: AtaAbertura): Promise<AtaAbertura> {
    return this.store.saveAtaAbertura(ata);
  }
}

@Injectable({ providedIn: 'root' })
export class LocalContratoRepository implements IContratoRepository {
  private store = inject(LocalDataStoreService);

  async listar(): Promise<Contrato[]> {
    return this.store.getContratos();
  }

  async obterPorId(id: string): Promise<Contrato | null> {
    return this.store.getContratoById(id);
  }

  async obterPorConcursoId(concursoId: string): Promise<Contrato | null> {
    return this.store.getContratoByConcursoId(concursoId);
  }

  async salvar(contrato: Contrato): Promise<Contrato> {
    return this.store.saveContrato(contrato);
  }

  async atualizar(id: string, alteracoes: Partial<Contrato>): Promise<Contrato> {
    return this.store.updateContrato(id, alteracoes);
  }

  async listarMedicoes(contratoId: string): Promise<AutoMedicao[]> {
    return this.store.getMedicoes(contratoId);
  }

  async adicionarMedicao(medicao: AutoMedicao): Promise<AutoMedicao> {
    return this.store.addMedicao(medicao);
  }

  async listarPagamentos(contratoId: string): Promise<PagamentoContrato[]> {
    return this.store.getPagamentos(contratoId);
  }

  async adicionarPagamento(pagamento: PagamentoContrato): Promise<PagamentoContrato> {
    return this.store.addPagamento(pagamento);
  }

  async listarOcorrencias(contratoId: string): Promise<OcorrenciaContrato[]> {
    return this.store.getOcorrencias(contratoId);
  }

  async adicionarOcorrencia(ocorrencia: OcorrenciaContrato): Promise<OcorrenciaContrato> {
    return this.store.addOcorrencia(ocorrencia);
  }

  async listarAdendas(contratoId: string): Promise<AdendaContrato[]> {
    return this.store.getAdendas(contratoId);
  }

  async adicionarAdenda(adenda: AdendaContrato): Promise<AdendaContrato> {
    return this.store.addAdenda(adenda);
  }

  async atualizarAdenda(id: string, alteracoes: Partial<AdendaContrato>): Promise<AdendaContrato> {
    return this.store.updateAdenda(id, alteracoes);
  }
}

@Injectable({ providedIn: 'root' })
export class LocalEstradaRepository implements IEstradaRepository {
  private store = inject(LocalDataStoreService);

  async listar(): Promise<TrocoEstrada[]> {
    return this.store.getTrocosEstrada();
  }

  async obterPorId(id: string): Promise<TrocoEstrada | null> {
    return this.store.getTrocoEstradaById(id);
  }

  async atualizar(id: string, alteracoes: Partial<TrocoEstrada>): Promise<TrocoEstrada> {
    return this.store.updateTrocoEstrada(id, alteracoes);
  }
}

@Injectable({ providedIn: 'root' })
export class LocalAuditRepository implements IAuditRepository {
  private store = inject(LocalDataStoreService);

  async listar(filtro?: { usuarioId?: string; acao?: string; entidade?: string }): Promise<RegistoAuditoria[]> {
    return this.store.getAuditoria(filtro);
  }

  async registar(registo: Omit<RegistoAuditoria, 'id' | 'timestamp'>): Promise<RegistoAuditoria> {
    return this.store.logAudit(registo);
  }
}

@Injectable({ providedIn: 'root' })
export class LocalUserRepository implements IUserRepository {
  private store = inject(LocalDataStoreService);

  async listar(): Promise<User[]> {
    return this.store.getUsers();
  }

  async obterPorId(id: string): Promise<User | null> {
    return this.store.getUserById(id);
  }

  async obterPorEmail(email: string): Promise<User | null> {
    return this.store.getUserByEmail(email);
  }

  async salvar(user: User): Promise<User> {
    return this.store.saveUser(user);
  }

  async atualizar(id: string, alteracoes: Partial<User>): Promise<User> {
    return this.store.updateUser(id, alteracoes);
  }
}

@Injectable({ providedIn: 'root' })
export class LocalEsclarecimentoRepository implements IEsclarecimentoRepository {
  private store = inject(LocalDataStoreService);

  async listarPorConcurso(concursoId: string): Promise<PedidoEsclarecimento[]> {
    return this.store.getEsclarecimentos(concursoId);
  }

  async salvar(pedido: PedidoEsclarecimento): Promise<PedidoEsclarecimento> {
    return this.store.saveEsclarecimento(pedido);
  }

  async responder(id: string, resposta: string, respondidoPorNome: string): Promise<PedidoEsclarecimento> {
    return this.store.responderEsclarecimento(id, resposta, respondidoPorNome);
  }
}

@Injectable({ providedIn: 'root' })
export class LocalReclamacaoRepository implements IReclamacaoRepository {
  private store = inject(LocalDataStoreService);

  async listarPorConcurso(concursoId: string): Promise<ReclamacaoRecurso[]> {
    return this.store.getReclamacoes(concursoId);
  }

  async salvar(reclamacao: ReclamacaoRecurso): Promise<ReclamacaoRecurso> {
    return this.store.saveReclamacao(reclamacao);
  }

  async decidir(id: string, decisao: 'DEFERIDO' | 'INDEFERIDO', despacho: string, decididoPorNome: string): Promise<ReclamacaoRecurso> {
    return this.store.decidirReclamacao(id, decisao, despacho, decididoPorNome);
  }
}

@Injectable({ providedIn: 'root' })
export class LocalDenunciaRepository implements IDenunciaRepository {
  private store = inject(LocalDataStoreService);

  async listar(): Promise<DenunciaCidada[]> {
    return this.store.getDenuncias();
  }

  async salvar(denuncia: DenunciaCidada): Promise<DenunciaCidada> {
    return this.store.saveDenuncia(denuncia);
  }

  async atualizar(id: string, alteracoes: Partial<DenunciaCidada>): Promise<DenunciaCidada> {
    return this.store.updateDenuncia(id, alteracoes);
  }
}
