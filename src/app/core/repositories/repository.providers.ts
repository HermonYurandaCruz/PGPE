import { Provider } from '@angular/core';
import {
  CONCURSO_REPOSITORY,
  PROPOSTA_REPOSITORY,
  CONTRATO_REPOSITORY,
  ESTRADA_REPOSITORY,
  AUDIT_REPOSITORY,
  USER_REPOSITORY,
  ESCLARECIMENTO_REPOSITORY,
  RECLAMACAO_REPOSITORY,
  DENUNCIA_REPOSITORY
} from './repository.tokens';
import {
  LocalConcursoRepository,
  LocalPropostaRepository,
  LocalContratoRepository,
  LocalEstradaRepository,
  LocalAuditRepository,
  LocalUserRepository,
  LocalEsclarecimentoRepository,
  LocalReclamacaoRepository,
  LocalDenunciaRepository
} from './local-repositories';

export const REPOSITORY_PROVIDERS: Provider[] = [
  { provide: CONCURSO_REPOSITORY, useClass: LocalConcursoRepository },
  { provide: PROPOSTA_REPOSITORY, useClass: LocalPropostaRepository },
  { provide: CONTRATO_REPOSITORY, useClass: LocalContratoRepository },
  { provide: ESTRADA_REPOSITORY, useClass: LocalEstradaRepository },
  { provide: AUDIT_REPOSITORY, useClass: LocalAuditRepository },
  { provide: USER_REPOSITORY, useClass: LocalUserRepository },
  { provide: ESCLARECIMENTO_REPOSITORY, useClass: LocalEsclarecimentoRepository },
  { provide: RECLAMACAO_REPOSITORY, useClass: LocalReclamacaoRepository },
  { provide: DENUNCIA_REPOSITORY, useClass: LocalDenunciaRepository }
];
