import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { User } from '../../shared/models/auth.models';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-[840px] mx-auto py-6 space-y-8">
      <!-- Title -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 mx-auto rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-[16px] tracking-wider mb-2">
          MTL
        </div>
        <h1 class="text-[26px] font-medium text-[#1A1A1A] tracking-[-0.015em]">
          Plataforma de Contratação Electrónica (e-Procurement)
        </h1>
        <p class="text-[13px] text-[#6B6A66] max-w-[540px] mx-auto">
          Ministério dos Transportes e Logística • República de Moçambique (Decreto n.º 79/2022)
        </p>
      </div>

      <!-- Quick 1-Click Demo Profiles (Central for seamless evaluation) -->
      <div class="bg-white border border-[#EDEDEA] rounded-[16px] p-6 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-[#EFEFEC] pb-3">
          <div>
            <h2 class="text-[15px] font-medium text-[#1A1A1A]">Entrar com Perfil de Demonstração (1 Clique)</h2>
            <p class="text-[12px] text-[#6B6A66]">Seleccione uma conta institucional para testar as permissões e fluxos</p>
          </div>
          <span class="text-[11px] font-medium text-[#E8920C] bg-[#FEF3E0] px-2 py-0.5 rounded-full">
            Modo Demonstração Activo
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          @for (u of demoUsers(); track u.id) {
            <button
              type="button"
              (click)="entrarComo(u)"
              class="p-4 rounded-[12px] border border-[#E6E5E1] bg-[#FCFCFB] hover:bg-white hover:border-[#1A1A1A] text-left transition-all cursor-pointer shadow-xs group flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="font-medium text-[14px] text-[#1A1A1A] group-hover:underline">
                    {{ u.name }}
                  </span>
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" [class]="getRoleBadge(u.role)">
                    {{ u.role }}
                  </span>
                </div>
                <div class="text-[12px] text-[#6B6A66] mb-1">
                  {{ u.cargo || u.companyName || u.departamento }}
                </div>
                <div class="text-[11px] text-[#8E8D88]">
                  {{ getRoleDescription(u.role) }}
                </div>
              </div>

              <div class="mt-3 pt-2 border-t border-[#EDEDEA] flex items-center justify-between text-[11px] text-[#1A1A1A] font-medium">
                <span>Email: {{ u.email }}</span>
                <span class="inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Entrar <span class="mat-icon text-[14px]">arrow_forward</span>
                </span>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Traditional Email Login Form + Registration Link -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Direct Login by Email -->
        <div class="bg-white border border-[#EDEDEA] rounded-[16px] p-6 shadow-xs space-y-4">
          <h3 class="text-[15px] font-medium text-[#1A1A1A]">Entrar com Credenciais</h3>
          <form [formGroup]="loginForm" (ngSubmit)="onLoginSubmit()" class="space-y-3">
            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Email Institucional</label>
              <input
                type="email"
                formControlName="email"
                placeholder="gestao@mtl.demo"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Palavra-passe (Demo: qualquer valor)</label>
              <input
                type="password"
                formControlName="password"
                value="demo123"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
            <button
              type="submit"
              class="w-full h-10 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors cursor-pointer shadow-xs"
            >
              Iniciar Sessão
            </button>
          </form>
        </div>

        <!-- Competitor Self-Registration Link -->
        <div class="bg-[#FCFCFB] border border-[#EDEDEA] rounded-[16px] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="w-8 h-8 rounded-full bg-[#E8EEFD] text-[#3B6FE0] flex items-center justify-center">
              <span class="mat-icon text-[18px]">business</span>
            </div>
            <h3 class="text-[15px] font-medium text-[#1A1A1A]">Registo de Concorrente (Empresa)</h3>
            <p class="text-[12px] text-[#6B6A66] leading-relaxed">
              É um operador económico, empreiteiro de obras públicas ou fornecedor de bens e serviços? Registe a sua empresa para submeter propostas seladas electrónicas no MTL.
            </p>
          </div>

          <a
            routerLink="/auth/registo"
            class="h-10 px-4 rounded-lg border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[13px] font-medium transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Criar Cadastro de Concorrente</span>
            <span class="mat-icon text-[16px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class AuthLoginComponent {
  private store = inject(LocalDataStoreService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  demoUsers = computed(() => this.store.users().slice(0, 4));

  loginForm = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control('gestao@mtl.demo', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('demo123')
  });

  async entrarComo(u: User): Promise<void> {
    await this.auth.loginAs(u);
    this.router.navigate(['/']);
  }

  async onLoginSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;
    const email = this.loginForm.getRawValue().email;
    const ok = await this.auth.loginWithEmail(email);
    if (ok) {
      this.router.navigate(['/']);
    }
  }

  getRoleBadge(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-[#FDE8E8] text-[#D64545]';
      case 'GESTAO': return 'bg-[#E8EEFD] text-[#3B6FE0]';
      case 'TECNICO': return 'bg-[#FEF3E0] text-[#E8920C]';
      case 'CONCORRENTE': return 'bg-[#E6F6EC] text-[#2E9E5B]';
      default: return 'bg-[#F1F1EF] text-[#6B6A66]';
    }
  }

  getRoleDescription(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Auditoria geral, gestão de utilizadores e modo de demonstração.';
      case 'GESTAO': return 'Aprovação/publicação de concursos e despacho de adjudicações.';
      case 'TECNICO': return 'Instrução de concursos, abertura de propostas no júri e fiscalização.';
      case 'CONCORRENTE': return 'Submissão de propostas seladas com SHA-256 e pedidos de esclarecimento.';
      default: return '';
    }
  }
}
