import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User, UserRole } from '../../shared/models/auth.models';
import { AppStatusBadge } from '../../shared/ui/status-badge.component';

@Component({
  selector: 'app-modo-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AppStatusBadge],
  template: `
    <div class="max-w-[880px] mx-auto space-y-6">
      <!-- Header -->
      <div class="border-b border-[#EFEFEC] pb-4">
        <div class="text-[12px] text-[#E8920C] font-medium mb-1 flex items-center gap-1.5">
          <span class="mat-icon text-[16px]">tune</span>
          Painel de Controlo de Demonstração
        </div>
        <h1 class="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
          Modo Demonstração & Aceleração de Fluxos
        </h1>
        <p class="text-[13px] text-[#6B6A66] mt-0.5">
          Ferramentas para testar rapidamente o ciclo de vida completo: publicação → selagem → fecho de prazo → abertura pelo júri → adjudicação
        </p>
      </div>

      <!-- Card 1: Fast Role Switcher -->
      <div class="bg-white border border-[#EDEDEA] rounded-[16px] p-6 shadow-xs space-y-4">
        <div>
          <h2 class="text-[16px] font-medium text-[#1A1A1A]">1. Alternar Perfil de Autenticação (RBAC)</h2>
          <p class="text-[12px] text-[#6B6A66]">
            Alterne instantaneamente entre os 4 perfis para testar permissões e restrições de e-procurement
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          @for (u of demoUsers(); track u.id) {
            <button
              type="button"
              (click)="auth.loginAs(u)"
              class="p-3.5 rounded-[12px] border text-left transition-all cursor-pointer shadow-xs flex flex-col justify-between"
              [class]="auth.currentUser()?.id === u.id
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] ring-2 ring-[#1A1A1A]/10'
                : 'bg-[#FCFCFB] text-[#1A1A1A] border-[#E6E5E1] hover:border-[#8E8D88] hover:bg-white'"
            >
              <div>
                <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block mb-2"
                  [class]="auth.currentUser()?.id === u.id ? 'bg-white/20 text-white' : 'bg-[#EDEDEA] text-[#6B6A66]'"
                >
                  {{ u.role }}
                </span>
                <div class="font-medium text-[13px] leading-snug line-clamp-1">
                  {{ u.name }}
                </div>
                <div class="text-[11px] mt-0.5 truncate" [class]="auth.currentUser()?.id === u.id ? 'text-[#D9D8D3]' : 'text-[#8E8D88]'">
                  {{ u.cargo || u.companyName || u.email }}
                </div>
              </div>

              @if (auth.currentUser()?.id === u.id) {
                <div class="text-[11px] font-medium text-[#34B26A] mt-3 flex items-center gap-1">
                  <span class="mat-icon text-[14px]">check_circle</span> Perfil Activo
                </div>
              } @else {
                <div class="text-[11px] text-[#6B6A66] mt-3 flex items-center gap-1">
                  <span>Mudar para este</span> <span class="mat-icon text-[13px]">arrow_forward</span>
                </div>
              }
            </button>
          }
        </div>
      </div>

      <!-- Card 2: Simular Fim do Prazo de Concurso -->
      <div class="bg-white border border-[#EDEDEA] rounded-[16px] p-6 shadow-xs space-y-4">
        <div>
          <h2 class="text-[16px] font-medium text-[#1A1A1A]">2. Simular Fim do Prazo de Concurso</h2>
          <p class="text-[12px] text-[#6B6A66]">
            Permite adiantar o relógio do sistema: muda a data limite de propostas para <strong>agora</strong>, bloqueando novas submissões de concorrentes e habilitando o Júri a realizar o <strong>Ato de Abertura</strong> e deslacragem das propostas.
          </p>
        </div>

        <div class="space-y-3">
          @for (c of concursosPublicados(); track c.id) {
            <div class="p-4 rounded-[12px] bg-[#FCFCFB] border border-[#EDEDEA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-mono text-[11px] bg-[#F1F1EF] px-1.5 py-0.5 rounded text-[#4A4946]">
                    {{ c.numeroProcesso }}
                  </span>
                  <app-status-badge [estado]="c.estado" mode="badge" />
                </div>
                <h4 class="text-[13px] font-medium text-[#1A1A1A] truncate max-w-[480px]">
                  {{ c.titulo }}
                </h4>
                <div class="text-[11px] text-[#8E8D88] mt-0.5">
                  Prazo de Propostas: {{ c.prazoSubmissao }}
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  (click)="simularFimPrazo(c.id, c.numeroProcesso)"
                  class="h-8 px-3 rounded-lg bg-[#E8920C] text-white hover:bg-[#D9622B] text-[12px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                >
                  <span class="mat-icon text-[15px]">fast_forward</span>
                  <span>Simular Fim do Prazo</span>
                </button>
                <a
                  [routerLink]="['/concursos', c.id]"
                  class="h-8 px-3 rounded-lg border border-[#E6E5E1] text-[12px] text-[#1A1A1A] hover:bg-[#F1F1EF] inline-flex items-center"
                >
                  Ver
                </a>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Card 3: Repor Dados de Demonstração -->
      <div class="bg-white border border-[#EDEDEA] rounded-[16px] p-6 shadow-xs space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-[16px] font-medium text-[#1A1A1A]">3. Reposição Integral dos Dados de Demonstração</h2>
            <p class="text-[12px] text-[#6B6A66] max-w-[560px]">
              Restaura a base de dados local para o estado inicial com os 8 concursos em vários estados, troços de estrada na EN1/EN6/EN8, propostas seladas, autos de medição e utilizadores padrão.
            </p>
          </div>
          <button
            type="button"
            (click)="reporDadosDemo()"
            class="h-10 px-4 rounded-lg bg-[#D64545] text-white hover:bg-[#B93838] text-[13px] font-medium transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
          >
            <span class="mat-icon text-[18px]">restart_alt</span>
            <span>Repor Dados Demo</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminModoDemoComponent {
  private store = inject(LocalDataStoreService);
  private notification = inject(NotificationService);
  auth = inject(AuthService);

  demoUsers = computed(() => this.store.users().slice(0, 4));

  concursosPublicados = computed(() => {
    return this.store.concursos().filter(c => c.estado === 'PUBLICADO');
  });

  simularFimPrazo(concursoId: string, processo: string): void {
    this.store.simularFimPrazo(concursoId);
    this.notification.success(`Prazo do concurso ${processo} alterado para agora. Propostas prontas para abertura!`, 'Prazo Encerrado');
  }

  reporDadosDemo(): void {
    this.store.resetToDemoSeed();
    this.notification.success('Dados de demonstração repuseram o estado padrão com sucesso.', 'Dados Reiniciados');
  }
}
