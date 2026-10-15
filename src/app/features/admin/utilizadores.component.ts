import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuditService } from '../../core/services/audit.service';
import { AppModal } from '../../shared/ui/modal.component';
import { User, UserRole } from '../../shared/models/auth.models';

@Component({
  selector: 'app-admin-utilizadores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AppModal],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="text-[12px] text-[#8E8D88] font-normal mb-1">
            Administração do Sistema • Controlo de Acessos
          </div>
          <h1 class="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
            Gestão de Utilizadores e Perfis (RBAC)
          </h1>
          <p class="text-[13px] text-[#6B6A66] mt-0.5">
            Configuração de acessos para Administradores, Gestores da Autoridade Competente, Técnicos UGEA e Concorrentes
          </p>
        </div>

        <button
          type="button"
          (click)="openModalCriar.set(true)"
          class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span class="mat-icon text-[16px]">person_add</span>
          <span>Criar Utilizador</span>
        </button>
      </div>

      <!-- Users Table -->
      <div class="bg-white border border-[#E6E5E1] rounded-[12px] p-5 shadow-xs space-y-4">
        <div class="overflow-x-auto rounded-[10px] border border-[#EDEDEA]">
          <table class="w-full text-left border-collapse text-[13px]">
            <thead class="bg-[#F5F5F3] border-b border-[#EDEDEA] text-[#6B6A66] text-[12px]">
              <tr>
                <th class="py-2.5 px-4 font-normal">Utilizador</th>
                <th class="py-2.5 px-4 font-normal">Perfil / Role</th>
                <th class="py-2.5 px-4 font-normal">Departamento / Cargo</th>
                <th class="py-2.5 px-4 font-normal">NUIT</th>
                <th class="py-2.5 px-4 font-normal">Estado</th>
                <th class="py-2.5 px-4 font-normal text-right">Acções</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F1EF]">
              @for (u of users(); track u.id) {
                <tr class="hover:bg-[#F8F8F6] transition-colors">
                  <td class="py-3 px-4">
                    <div class="font-medium text-[#1A1A1A]">{{ u.name }}</div>
                    <div class="text-[11px] text-[#8E8D88]">{{ u.email }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium" [class]="getRoleBadgeClass(u.role)">
                      {{ u.role }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-[#6B6A66] text-[12px]">
                    {{ u.cargo || u.departamento || u.areaActividade || '-' }}
                  </td>
                  <td class="py-3 px-4 font-mono text-[12px] text-[#6B6A66]">
                    {{ u.nuit || '-' }}
                  </td>
                  <td class="py-3 px-4">
                    <span class="inline-flex items-center gap-1 text-[11px] font-medium" [class]="u.active ? 'text-[#2E9E5B]' : 'text-[#D64545]'">
                      <span class="w-1.5 h-1.5 rounded-full" [class]="u.active ? 'bg-[#34B26A]' : 'bg-[#E5484D]'"></span>
                      <span>{{ u.active ? 'Activo' : 'Inactivo' }}</span>
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        (click)="auth.loginAs(u)"
                        class="h-7 px-2.5 rounded-md border border-[#E6E5E1] hover:bg-[#F1F1EF] text-[#1A1A1A] text-[11px] font-medium transition-colors cursor-pointer"
                        title="Simular sessão como este utilizador"
                      >
                        Entrar como
                      </button>
                      <button
                        type="button"
                        (click)="toggleActive(u)"
                        class="h-7 px-2 rounded-md hover:bg-[#F1F1EF] text-[#8E8D88] hover:text-[#1A1A1A] text-[11px] cursor-pointer"
                        [title]="u.active ? 'Desactivar' : 'Activar'"
                      >
                        <span class="mat-icon text-[16px]">{{ u.active ? 'toggle_on' : 'toggle_off' }}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL: Criar Novo Utilizador -->
      <app-modal
        [isOpen]="openModalCriar()"
        title="Criar Novo Utilizador no Sistema"
        subtitle="Controlo de Acessos MTL"
        (closed)="openModalCriar.set(false)"
      >
        <form [formGroup]="userForm" (ngSubmit)="salvarNovoUtilizador()" modal-body class="space-y-4">
          <div>
            <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Nome Completo *</label>
            <input
              type="text"
              formControlName="name"
              class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Email Institucional *</label>
              <input
                type="email"
                formControlName="email"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Perfil (RBAC) *</label>
              <select
                formControlName="role"
                class="w-full h-10 px-2.5 rounded-lg border border-[#E6E5E1] bg-white text-[13px] text-[#1A1A1A] focus:outline-none"
              >
                <option value="TECNICO">Técnico (UGEA / Júri / Fiscal)</option>
                <option value="GESTAO">Gestão (Autoridade Competente)</option>
                <option value="ADMIN">Administrador</option>
                <option value="CONCORRENTE">Concorrente</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Cargo / Departamento</label>
            <input
              type="text"
              formControlName="cargo"
              placeholder="Ex: Engenheiro Civil • Fiscal de Obras"
              class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] focus:outline-none"
            />
          </div>
        </form>

        <div modal-footer>
          <button
            type="button"
            (click)="openModalCriar.set(false)"
            class="h-9 px-3.5 rounded-lg border border-[#E6E5E1] text-[#6B6A66] text-[12px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            [disabled]="userForm.invalid"
            (click)="salvarNovoUtilizador()"
            class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white text-[12px] font-medium cursor-pointer disabled:bg-[#EDEDEA] disabled:text-[#B8B7B1]"
          >
            Criar Utilizador
          </button>
        </div>
      </app-modal>
    </div>
  `
})
export class AdminUtilizadoresComponent {
  private store = inject(LocalDataStoreService);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private audit = inject(AuditService);
  auth = inject(AuthService);

  openModalCriar = signal(false);

  userForm = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    role: this.fb.nonNullable.control<UserRole>('TECNICO', [Validators.required]),
    cargo: this.fb.nonNullable.control('')
  });

  users = computed(() => this.store.users());

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'ADMIN': return 'bg-[#FDE8E8] text-[#D64545]';
      case 'GESTAO': return 'bg-[#E8EEFD] text-[#3B6FE0]';
      case 'TECNICO': return 'bg-[#FEF3E0] text-[#E8920C]';
      case 'CONCORRENTE': return 'bg-[#E6F6EC] text-[#2E9E5B]';
      default: return 'bg-[#F1F1EF] text-[#6B6A66]';
    }
  }

  async toggleActive(user: User): Promise<void> {
    const updated = this.store.updateUser(user.id, { active: !user.active });
    await this.audit.log(
      this.auth.currentUser(),
      'ALTERACAO_ESTADO_UTILIZADOR',
      'UTILIZADOR',
      `Utilizador ${user.name} alterado para estado ${updated.active ? 'Activo' : 'Inactivo'}`,
      user.id
    );
    this.notification.success(`Utilizador ${updated.name} ${updated.active ? 'activado' : 'desactivado'}.`, 'Actualizado');
  }

  async salvarNovoUtilizador(): Promise<void> {
    if (this.userForm.invalid) return;

    const raw = this.userForm.getRawValue();
    const newUser: User = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: raw.name,
      email: raw.email,
      role: raw.role,
      cargo: raw.cargo,
      departamento: 'MTL Moçambique',
      active: true,
      avatar: raw.name.substring(0, 2).toUpperCase()
    };

    this.store.saveUser(newUser);

    await this.audit.log(
      this.auth.currentUser(),
      'CRIACAO_UTILIZADOR',
      'UTILIZADOR',
      `Novo utilizador criado: ${newUser.name} (${newUser.role})`,
      newUser.id
    );

    this.openModalCriar.set(false);
    this.userForm.reset({ role: 'TECNICO', name: '', email: '', cargo: '' });
    this.notification.success(`Utilizador ${newUser.name} criado com sucesso.`, 'Utilizador Registado');
  }
}
