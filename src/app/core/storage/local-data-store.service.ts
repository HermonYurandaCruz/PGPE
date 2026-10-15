import { Injectable, signal } from '@angular/core';
import { User } from '../../shared/models/auth.models';
import { Concurso, ConcursoFilter } from '../../shared/models/concurso.models';
import { Proposta, AtaAbertura } from '../../shared/models/proposta.models';
import { Contrato, AutoMedicao, PagamentoContrato, OcorrenciaContrato, AdendaContrato } from '../../shared/models/contrato.models';
import { TrocoEstrada } from '../../shared/models/estrada.models';
import { RegistoAuditoria } from '../../shared/models/audit.models';
import { PedidoEsclarecimento } from '../../shared/models/esclarecimento.models';
import { ReclamacaoRecurso } from '../../shared/models/reclamacao.models';
import { DenunciaCidada } from '../../shared/models/denuncia.models';
import {
  SEED_USERS,
  SEED_CONCURSOS,
  SEED_PROPOSTAS,
  SEED_ATAS_ABERTURA,
  SEED_CONTRATOS,
  SEED_MEDICOES,
  SEED_PAGAMENTOS,
  SEED_OCORRENCIAS,
  SEED_ADENDAS,
  SEED_TROCOS_ESTRADA,
  SEED_ESCLARECIMENTOS,
  SEED_RECLAMACOES,
  SEED_DENUNCIAS,
  SEED_AUDITORIA
} from './seed-data';

const STORAGE_KEY = 'CONTRATUS_MTL_DB_V1';

interface AppStorageSchema {
  version: number;
  users: User[];
  concursos: Concurso[];
  propostas: Proposta[];
  atasAbertura: AtaAbertura[];
  contratos: Contrato[];
  medicoes: AutoMedicao[];
  pagamentos: PagamentoContrato[];
  ocorrencias: OcorrenciaContrato[];
  adendas: AdendaContrato[];
  trocosEstrada: TrocoEstrada[];
  esclarecimentos: PedidoEsclarecimento[];
  reclamacoes: ReclamacaoRecurso[];
  denuncias: DenunciaCidada[];
  auditoria: RegistoAuditoria[];
}

@Injectable({
  providedIn: 'root'
})
export class LocalDataStoreService {
  private schemaVersion = 1;
  private state = signal<AppStorageSchema>(this.initData());

  // Public readonly signals for reactive bindings
  readonly users = signal<User[]>([]);
  readonly concursos = signal<Concurso[]>([]);
  readonly propostas = signal<Proposta[]>([]);
  readonly contratos = signal<Contrato[]>([]);
  readonly trocosEstrada = signal<TrocoEstrada[]>([]);
  readonly auditoria = signal<RegistoAuditoria[]>([]);

  constructor() {
    this.syncSignalsFromState();
  }

  private initData(): AppStorageSchema {
    if (typeof window === 'undefined') {
      return this.createInitialSeed();
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppStorageSchema;
        if (parsed.version === this.schemaVersion && Array.isArray(parsed.concursos)) {
          return parsed;
        }
      }
    } catch {
      // Ignore and fallback to seed
    }

    const initial = this.createInitialSeed();
    this.persist(initial);
    return initial;
  }

  private createInitialSeed(): AppStorageSchema {
    return {
      version: this.schemaVersion,
      users: JSON.parse(JSON.stringify(SEED_USERS)),
      concursos: JSON.parse(JSON.stringify(SEED_CONCURSOS)),
      propostas: JSON.parse(JSON.stringify(SEED_PROPOSTAS)),
      atasAbertura: JSON.parse(JSON.stringify(SEED_ATAS_ABERTURA)),
      contratos: JSON.parse(JSON.stringify(SEED_CONTRATOS)),
      medicoes: JSON.parse(JSON.stringify(SEED_MEDICOES)),
      pagamentos: JSON.parse(JSON.stringify(SEED_PAGAMENTOS)),
      ocorrencias: JSON.parse(JSON.stringify(SEED_OCORRENCIAS)),
      adendas: JSON.parse(JSON.stringify(SEED_ADENDAS)),
      trocosEstrada: JSON.parse(JSON.stringify(SEED_TROCOS_ESTRADA)),
      esclarecimentos: JSON.parse(JSON.stringify(SEED_ESCLARECIMENTOS)),
      reclamacoes: JSON.parse(JSON.stringify(SEED_RECLAMACOES)),
      denuncias: JSON.parse(JSON.stringify(SEED_DENUNCIAS)),
      auditoria: JSON.parse(JSON.stringify(SEED_AUDITORIA))
    };
  }

  private persist(data: AppStorageSchema): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // LocalStorage may be full or disabled
      }
    }
    this.state.set(data);
    this.syncSignalsFromState();
  }

  private syncSignalsFromState(): void {
    const s = this.state();
    this.users.set(s.users);
    this.concursos.set(s.concursos);
    this.propostas.set(s.propostas);
    this.contratos.set(s.contratos);
    this.trocosEstrada.set(s.trocosEstrada);
    this.auditoria.set(s.auditoria);
  }

  // --- Reset Demo Data ---
  resetToDemoSeed(): void {
    const fresh = this.createInitialSeed();
    this.persist(fresh);
    this.logAudit({
      usuarioId: 'user-admin',
      usuarioNome: 'Administrador do Sistema',
      perfil: 'ADMIN',
      acao: 'REPOSICAO_DADOS_DEMO',
      entidade: 'DEMO',
      detalhes: 'Reposição integral dos dados originais de demonstração do MTL'
    });
  }

  // --- Simulate Deadline Expiry ---
  simularFimPrazo(concursoId: string): boolean {
    const s = this.state();
    const idx = s.concursos.findIndex(c => c.id === concursoId);
    if (idx === -1) return false;

    const agora = new Date(Date.now() - 60 * 1000).toISOString(); // 1 minuto no passado
    s.concursos[idx].prazoSubmissao = agora;
    s.concursos[idx].dataAbertura = agora;

    this.persist({ ...s });
    this.logAudit({
      usuarioId: 'user-admin',
      usuarioNome: 'Administrador do Sistema',
      perfil: 'ADMIN',
      acao: 'SIMULAR_FIM_PRAZO',
      entidade: 'CONCURSO',
      entidadeId: concursoId,
      detalhes: `Simulação de encerramento do prazo de submissão do concurso ${s.concursos[idx].numeroProcesso} para a hora actual.`
    });
    return true;
  }

  // --- Concursos ---
  getConcursos(filtro?: ConcursoFilter): Concurso[] {
    let list = [...this.state().concursos];
    if (!filtro) return list;

    if (filtro.texto && filtro.texto.trim()) {
      const q = filtro.texto.toLowerCase().trim();
      list = list.filter(c =>
        c.titulo.toLowerCase().includes(q) ||
        c.numeroProcesso.toLowerCase().includes(q) ||
        c.objecto.toLowerCase().includes(q)
      );
    }
    if (filtro.modalidade && filtro.modalidade !== 'TODAS') {
      list = list.filter(c => c.modalidadeId === filtro.modalidade);
    }
    if (filtro.estado && filtro.estado !== 'TODOS') {
      list = list.filter(c => c.estado === filtro.estado);
    }
    if (filtro.provincia && filtro.provincia !== 'TODAS') {
      list = list.filter(c => c.provincia === filtro.provincia);
    }
    return list;
  }

  getConcursoById(id: string): Concurso | null {
    return this.state().concursos.find(c => c.id === id) || null;
  }

  saveConcurso(concurso: Concurso): Concurso {
    const s = this.state();
    const idx = s.concursos.findIndex(c => c.id === concurso.id);
    if (idx >= 0) {
      s.concursos[idx] = concurso;
    } else {
      s.concursos.unshift(concurso);
    }
    this.persist({ ...s });
    return concurso;
  }

  updateConcurso(id: string, alteracoes: Partial<Concurso>): Concurso {
    const s = this.state();
    const idx = s.concursos.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Concurso não encontrado');
    s.concursos[idx] = { ...s.concursos[idx], ...alteracoes };
    this.persist({ ...s });
    return s.concursos[idx];
  }

  // --- Propostas ---
  getPropostasPorConcurso(concursoId: string, incluirSeladas = false): Proposta[] {
    const propostas = this.state().propostas.filter(p => p.concursoId === concursoId);
    if (incluirSeladas) return propostas;

    // Se não incluir seladas, mas a proposta for selada, mascara valores e documentos
    return propostas.map(p => {
      if (p.selada) {
        return {
          ...p,
          valorPropostoMZN: 0,
          prazoExecucaoMeses: 0,
          documentos: []
        };
      }
      return p;
    });
  }

  getPropostasPorConcorrente(concorrenteId: string): Proposta[] {
    return this.state().propostas.filter(p => p.concorrenteId === concorrenteId);
  }

  getPropostaById(id: string): Proposta | null {
    return this.state().propostas.find(p => p.id === id) || null;
  }

  saveProposta(proposta: Proposta): Proposta {
    const s = this.state();
    const idx = s.propostas.findIndex(p => p.id === proposta.id);
    if (idx >= 0) {
      s.propostas[idx] = proposta;
    } else {
      s.propostas.push(proposta);
    }
    this.persist({ ...s });
    return proposta;
  }

  updateProposta(id: string, alteracoes: Partial<Proposta>): Proposta {
    const s = this.state();
    const idx = s.propostas.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Proposta não encontrada');
    s.propostas[idx] = { ...s.propostas[idx], ...alteracoes };
    this.persist({ ...s });
    return s.propostas[idx];
  }

  getAtaAbertura(concursoId: string): AtaAbertura | null {
    return this.state().atasAbertura.find(a => a.concursoId === concursoId) || null;
  }

  saveAtaAbertura(ata: AtaAbertura): AtaAbertura {
    const s = this.state();
    const idx = s.atasAbertura.findIndex(a => a.concursoId === ata.concursoId);
    if (idx >= 0) {
      s.atasAbertura[idx] = ata;
    } else {
      s.atasAbertura.push(ata);
    }
    this.persist({ ...s });
    return ata;
  }

  // --- Contratos ---
  getContratos(): Contrato[] {
    return [...this.state().contratos];
  }

  getContratoById(id: string): Contrato | null {
    return this.state().contratos.find(c => c.id === id) || null;
  }

  getContratoByConcursoId(concursoId: string): Contrato | null {
    return this.state().contratos.find(c => c.concursoId === concursoId) || null;
  }

  saveContrato(contrato: Contrato): Contrato {
    const s = this.state();
    const idx = s.contratos.findIndex(c => c.id === contrato.id);
    if (idx >= 0) {
      s.contratos[idx] = contrato;
    } else {
      s.contratos.unshift(contrato);
    }
    this.persist({ ...s });
    return contrato;
  }

  updateContrato(id: string, alteracoes: Partial<Contrato>): Contrato {
    const s = this.state();
    const idx = s.contratos.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Contrato não encontrado');
    s.contratos[idx] = { ...s.contratos[idx], ...alteracoes };
    this.persist({ ...s });
    return s.contratos[idx];
  }

  getMedicoes(contratoId: string): AutoMedicao[] {
    return this.state().medicoes.filter(m => m.contratoId === contratoId);
  }

  addMedicao(medicao: AutoMedicao): AutoMedicao {
    const s = this.state();
    s.medicoes.push(medicao);
    
    // Atualizar progresso físico no troço de estrada se associado ao contrato
    const contrato = s.contratos.find(c => c.id === medicao.contratoId);
    if (contrato && contrato.trocoEstradaId) {
      const trocoIdx = s.trocosEstrada.findIndex(t => t.id === contrato.trocoEstradaId);
      if (trocoIdx >= 0) {
        s.trocosEstrada[trocoIdx].progressoFisico = medicao.percentualFisicoAcumulado;
      }
    }

    this.persist({ ...s });
    return medicao;
  }

  getPagamentos(contratoId: string): PagamentoContrato[] {
    return this.state().pagamentos.filter(p => p.contratoId === contratoId);
  }

  addPagamento(pagamento: PagamentoContrato): PagamentoContrato {
    const s = this.state();
    s.pagamentos.push(pagamento);

    // Calcular percentual financeiro acumulado
    const contrato = s.contratos.find(c => c.id === pagamento.contratoId);
    if (contrato && contrato.trocoEstradaId && contrato.valorAtualizadoMZN > 0) {
      const trocoIdx = s.trocosEstrada.findIndex(t => t.id === contrato.trocoEstradaId);
      if (trocoIdx >= 0) {
        const totalPago = s.pagamentos
          .filter(p => p.contratoId === pagamento.contratoId)
          .reduce((sum, p) => sum + p.valorPagoMZN, 0);
        const percFin = Math.min(100, Math.round((totalPago / contrato.valorAtualizadoMZN) * 1000) / 10);
        s.trocosEstrada[trocoIdx].progressoFinanceiro = percFin;
      }
    }

    this.persist({ ...s });
    return pagamento;
  }

  getOcorrencias(contratoId: string): OcorrenciaContrato[] {
    return this.state().ocorrencias.filter(o => o.contratoId === contratoId);
  }

  addOcorrencia(ocorrencia: OcorrenciaContrato): OcorrenciaContrato {
    const s = this.state();
    s.ocorrencias.unshift(ocorrencia);
    this.persist({ ...s });
    return ocorrencia;
  }

  getAdendas(contratoId: string): AdendaContrato[] {
    return this.state().adendas.filter(a => a.contratoId === contratoId);
  }

  addAdenda(adenda: AdendaContrato): AdendaContrato {
    const s = this.state();
    s.adendas.unshift(adenda);
    this.persist({ ...s });
    return adenda;
  }

  updateAdenda(id: string, alteracoes: Partial<AdendaContrato>): AdendaContrato {
    const s = this.state();
    const idx = s.adendas.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Adenda não encontrada');
    s.adendas[idx] = { ...s.adendas[idx], ...alteracoes };
    
    // Se foi aprovada com valor adicional, reflete no contrato
    if (alteracoes.estado === 'APROVADA') {
      const ad = s.adendas[idx];
      const ctIdx = s.contratos.findIndex(c => c.id === ad.contratoId);
      if (ctIdx >= 0 && ad.valorAdicionalMZN) {
        s.contratos[ctIdx].valorAtualizadoMZN += ad.valorAdicionalMZN;
      }
    }

    this.persist({ ...s });
    return s.adendas[idx];
  }

  // --- Estradas SIG ---
  getTrocosEstrada(): TrocoEstrada[] {
    return [...this.state().trocosEstrada];
  }

  getTrocoEstradaById(id: string): TrocoEstrada | null {
    return this.state().trocosEstrada.find(t => t.id === id) || null;
  }

  updateTrocoEstrada(id: string, alteracoes: Partial<TrocoEstrada>): TrocoEstrada {
    const s = this.state();
    const idx = s.trocosEstrada.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Troço não encontrado');
    s.trocosEstrada[idx] = { ...s.trocosEstrada[idx], ...alteracoes };
    this.persist({ ...s });
    return s.trocosEstrada[idx];
  }

  // --- Utilizadores ---
  getUsers(): User[] {
    return [...this.state().users];
  }

  getUserById(id: string): User | null {
    return this.state().users.find(u => u.id === id) || null;
  }

  getUserByEmail(email: string): User | null {
    return this.state().users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  saveUser(user: User): User {
    const s = this.state();
    const idx = s.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      s.users[idx] = user;
    } else {
      s.users.push(user);
    }
    this.persist({ ...s });
    return user;
  }

  updateUser(id: string, alteracoes: Partial<User>): User {
    const s = this.state();
    const idx = s.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Utilizador não encontrado');
    s.users[idx] = { ...s.users[idx], ...alteracoes };
    this.persist({ ...s });
    return s.users[idx];
  }

  // --- Auditoria ---
  getAuditoria(filtro?: { usuarioId?: string; acao?: string; entidade?: string }): RegistoAuditoria[] {
    let list = [...this.state().auditoria];
    if (filtro) {
      if (filtro.usuarioId) list = list.filter(a => a.usuarioId === filtro.usuarioId);
      if (filtro.acao) list = list.filter(a => a.acao === filtro.acao);
      if (filtro.entidade) list = list.filter(a => a.entidade === filtro.entidade);
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  logAudit(registo: Omit<RegistoAuditoria, 'id' | 'timestamp'>): RegistoAuditoria {
    const novo: RegistoAuditoria = {
      ...registo,
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };
    const s = this.state();
    s.auditoria.unshift(novo);
    this.persist({ ...s });
    return novo;
  }

  // --- Esclarecimentos ---
  getEsclarecimentos(concursoId: string): PedidoEsclarecimento[] {
    return this.state().esclarecimentos.filter(e => e.concursoId === concursoId);
  }

  saveEsclarecimento(item: PedidoEsclarecimento): PedidoEsclarecimento {
    const s = this.state();
    s.esclarecimentos.unshift(item);
    this.persist({ ...s });
    return item;
  }

  responderEsclarecimento(id: string, resposta: string, respondidoPorNome: string): PedidoEsclarecimento {
    const s = this.state();
    const idx = s.esclarecimentos.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Pedido não encontrado');
    s.esclarecimentos[idx] = {
      ...s.esclarecimentos[idx],
      resposta,
      respondidoPorNome,
      dataResposta: new Date().toISOString(),
      publicado: true
    };
    this.persist({ ...s });
    return s.esclarecimentos[idx];
  }

  // --- Reclamações ---
  getReclamacoes(concursoId: string): ReclamacaoRecurso[] {
    return this.state().reclamacoes.filter(r => r.concursoId === concursoId);
  }

  saveReclamacao(item: ReclamacaoRecurso): ReclamacaoRecurso {
    const s = this.state();
    s.reclamacoes.unshift(item);
    this.persist({ ...s });
    return item;
  }

  decidirReclamacao(id: string, decisao: 'DEFERIDO' | 'INDEFERIDO', despacho: string, decididoPorNome: string): ReclamacaoRecurso {
    const s = this.state();
    const idx = s.reclamacoes.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Reclamação não encontrada');
    s.reclamacoes[idx] = {
      ...s.reclamacoes[idx],
      decisao,
      despachoDecisao: despacho,
      decididoPorNome,
      dataDecisao: new Date().toISOString()
    };
    this.persist({ ...s });
    return s.reclamacoes[idx];
  }

  // --- Denúncias / Participação Cidadã ---
  getDenuncias(): DenunciaCidada[] {
    return [...this.state().denuncias];
  }

  saveDenuncia(item: DenunciaCidada): DenunciaCidada {
    const s = this.state();
    s.denuncias.unshift(item);
    this.persist({ ...s });
    return item;
  }

  updateDenuncia(id: string, alteracoes: Partial<DenunciaCidada>): DenunciaCidada {
    const s = this.state();
    const idx = s.denuncias.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Denúncia não encontrada');
    s.denuncias[idx] = { ...s.denuncias[idx], ...alteracoes };
    this.persist({ ...s });
    return s.denuncias[idx];
  }
}
