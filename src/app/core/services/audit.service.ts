import { Injectable, inject } from '@angular/core';
import { AUDIT_REPOSITORY } from '../repositories/repository.tokens';
import { RegistoAuditoria } from '../../shared/models/audit.models';
import { User } from '../../shared/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private auditRepo = inject(AUDIT_REPOSITORY);

  async log(
    actor: User | null,
    acao: string,
    entidade: RegistoAuditoria['entidade'],
    detalhes: string,
    entidadeId?: string
  ): Promise<RegistoAuditoria> {
    const usuarioId = actor?.id ?? 'anonimo';
    const usuarioNome = actor?.name ?? 'Utilizador Público / Não Autenticado';
    const perfil = actor?.role ?? 'PUBLICO';

    return this.auditRepo.registar({
      usuarioId,
      usuarioNome,
      perfil,
      acao,
      entidade,
      entidadeId,
      detalhes,
      ipOrigem: '102.217.112.45 (Maputo, MZ)'
    });
  }

  async getLogs(filtro?: { usuarioId?: string; acao?: string; entidade?: string }): Promise<RegistoAuditoria[]> {
    return this.auditRepo.listar(filtro);
  }
}
