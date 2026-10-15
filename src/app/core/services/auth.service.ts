import { Injectable, computed, inject, signal } from '@angular/core';
import { User, UserRole } from '../../shared/models/auth.models';
import { USER_REPOSITORY } from '../repositories/repository.tokens';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

const AUTH_USER_KEY = 'CONTRATUS_CURRENT_USER';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userRepo = inject(USER_REPOSITORY);
  private auditService = inject(AuditService);
  private notification = inject(NotificationService);

  private currentUserSignal = signal<User | null>(this.getStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly userRole = computed<UserRole>(() => this.currentUserSignal()?.role ?? 'PUBLICO');

  constructor() {
    // If no user is stored, default to GESTAO or public preview initially
    if (!this.currentUserSignal()) {
      this.initDefaultSession();
    }
  }

  private getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private async initDefaultSession(): Promise<void> {
    const users = await this.userRepo.listar();
    // Default to Gestao for immediate rich demonstration experience
    const defaultUser = users.find(u => u.role === 'GESTAO') || users[0];
    if (defaultUser) {
      this.setCurrentUser(defaultUser, false);
    }
  }

  private setCurrentUser(user: User | null, recordAudit = true): void {
    this.currentUserSignal.set(user);
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }

    if (recordAudit && user) {
      this.auditService.log(
        user,
        'INICIO_SESSAO',
        'UTILIZADOR',
        `Autenticação iniciada como ${user.name} (${user.role})`
      );
    }
  }

  async loginWithEmail(email: string): Promise<boolean> {
    const user = await this.userRepo.obterPorEmail(email);
    if (user && user.active) {
      this.setCurrentUser(user);
      this.notification.success(`Bem-vindo, ${user.name}!`, 'Sessão Iniciada');
      return true;
    }
    this.notification.error('Utilizador não encontrado ou inactivo.', 'Erro de Autenticação');
    return false;
  }

  async loginAs(user: User): Promise<void> {
    this.setCurrentUser(user);
    this.notification.success(`Sessão alterada para ${user.name} (${user.role})`, 'Perfil Carregado');
  }

  async registerCompetitor(data: {
    name: string;
    email: string;
    companyName: string;
    companyType: User['companyType'];
    nuit: string;
    areaActividade: string;
    telefone: string;
  }): Promise<User> {
    const newUser: User = {
      id: 'user-cnc-' + Math.random().toString(36).substring(2, 9),
      name: data.companyName,
      email: data.email,
      role: 'CONCORRENTE',
      companyName: data.companyName,
      companyType: data.companyType,
      nuit: data.nuit,
      areaActividade: data.areaActividade,
      telefone: data.telefone,
      active: true,
      avatar: data.companyName.substring(0, 2).toUpperCase()
    };

    const saved = await this.userRepo.salvar(newUser);
    this.setCurrentUser(saved);
    this.notification.success('Registo de concorrente concluído com sucesso!', 'Cadastro Oficial MTL');
    return saved;
  }

  logout(): void {
    const prevUser = this.currentUserSignal();
    if (prevUser) {
      this.auditService.log(prevUser, 'TERMINO_SESSAO', 'UTILIZADOR', 'Sessão terminada pelo utilizador');
    }
    this.setCurrentUser(null, false);
    this.notification.info('Sessão encerrada.', 'Até breve');
  }

  hasRole(...roles: UserRole[]): boolean {
    const current = this.userRole();
    return roles.includes(current);
  }

  canOpenSealedBids(concursoPrazoAberto: boolean): boolean {
    // Sealed bids can NEVER be read by anyone while the deadline is open.
    // After opening deadline, only authorized Jury members, Gestao or Admin can trigger the unsealing.
    if (concursoPrazoAberto) {
      return false;
    }
    return this.hasRole('TECNICO', 'GESTAO', 'ADMIN');
  }
}
