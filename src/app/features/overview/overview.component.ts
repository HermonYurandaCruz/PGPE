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
import { AppStatCard } from '../../shared/ui/stat-card.component';
import { AppStatusBadge } from '../../shared/ui/status-badge.component';
import { AppProgressBar } from '../../shared/ui/progress-bar.component';
import { AppCountdown } from '../../shared/ui/countdown.component';
import { AppTabsPill } from '../../shared/ui/tabs-pill.component';
import { MznCurrencyPipe, MzDatePipe } from '../../shared/pipes/format.pipes';

@Component({
  selector: 'app-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AppStatCard,
    AppStatusBadge,
    AppProgressBar,
    AppCountdown,
    MznCurrencyPipe,
    MzDatePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="text-[12px] text-[#8E8D88] font-normal mb-1">
            Ministério dos Transportes e Logística • República de Moçambique
          </div>
          <h1 class="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
            Visão Geral e Operações
          </h1>
          <p class="text-[13px] text-[#6B6A66] mt-0.5">
            Monitorização integrada de concursos, contratos viários e fiscalização de empreitadas
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <a
            routerLink="/concursos"
            class="h-9 px-3.5 rounded-lg border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <span class="mat-icon text-[16px]">list</span>
            <span>Ver Concursos</span>
          </a>
          @if (auth.hasRole('TECNICO', 'ADMIN')) {
            <a
              routerLink="/concursos/novo"
              class="h-9 px-3.5 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <span class="mat-icon text-[16px]">add</span>
              <span>Novo Concurso</span>
            </a>
          }
        </div>
      </div>

      <!-- KPI Grid (Contratus Stat Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          label="Contratos Activos"
          [value]="contratosActivos()"
          icon="description"
          tint="info"
          delta="+12%"
          [deltaPositive]="true"
        />
        <app-stat-card
          label="Concursos em Aberto"
          [value]="concursosAbertos()"
          icon="gavel"
          tint="warning"
          delta="4 a encerrar"
          [deltaPositive]="false"
          deltaSuffix="este mês"
        />
        <app-stat-card
          label="Valor em Carteira"
          [value]="valorTotalCarteiraFormatted()"
          icon="account_balance_wallet"
          tint="success"
          delta="+8.4%"
          [deltaPositive]="true"
        />
        <app-stat-card
          label="Troços em Construção"
          [value]="trocosConstrucao()"
          icon="add_road"
          tint="violet"
          delta="189 km"
          [deltaPositive]="true"
          deltaSuffix="em execução"
        />
      </div>

      <!-- Middle Grid: Prazos Próximos (2fr) + Actividades Recentes (1fr) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Prazos Próximos / Concursos em Destaque -->
        <div class="lg:col-span-2 bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-[18px] font-medium text-[#1A1A1A] tracking-[-0.01em]">
                Prazos e Sessões de Abertura
              </h2>
              <p class="text-[12px] text-[#6B6A66]">
                Concursos públicos com prazos de submissão a decorrer ou prontos para abertura
              </p>
            </div>
            <a
              routerLink="/concursos"
              class="h-7 px-3.5 rounded-full border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#6B6A66] hover:text-[#1A1A1A] text-[12px] font-medium transition-colors inline-flex items-center gap-1 shadow-xs"
            >
              Ver todos
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            @for (c of concursosProximos(); track c.id) {
              <div class="border border-[#EDEDEA] hover:border-[#D9D8D3] rounded-[10px] p-4 bg-[#FCFCFB] hover:bg-white transition-all flex flex-col justify-between shadow-xs">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="text-[10px] font-mono text-[#8E8D88] uppercase bg-[#F1F1EF] px-1.5 py-0.5 rounded">
                      {{ c.numeroProcesso }}
                    </span>
                    <app-status-badge [estado]="c.estado" mode="badge" />
                  </div>

                  <h3 class="text-[13px] font-medium text-[#1A1A1A] line-clamp-2 leading-snug mb-2">
                    {{ c.titulo }}
                  </h3>

                  <div class="space-y-1.5 text-[12px] text-[#6B6A66] mb-3">
                    <div class="flex items-center justify-between">
                      <span class="text-[#8E8D88]">Província:</span>
                      <span class="font-medium text-[#1A1A1A]">{{ c.provincia }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-[#8E8D88]">Valor Estimado:</span>
                      <span class="font-medium text-[#1A1A1A] tnum">{{ c.valorEstimadoMZN | mznCurrency }}</span>
                    </div>
                  </div>
                </div>

                <div class="pt-3 border-t border-[#EFEFEC] flex items-center justify-between gap-2">
                  <app-countdown [targetDate]="c.prazoSubmissao" />
                  <a
                    [routerLink]="['/concursos', c.id]"
                    class="text-[12px] font-medium text-[#1A1A1A] hover:underline inline-flex items-center gap-0.5"
                  >
                    Detalhes <span class="mat-icon text-[14px]">chevron_right</span>
                  </a>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Actividades Recentes / Audit Feed -->
        <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-[18px] font-medium text-[#1A1A1A] tracking-[-0.01em]">
                Actividades Recentes
              </h2>
              <p class="text-[12px] text-[#6B6A66]">
                Registo contínuo de auditoria e operações
              </p>
            </div>
            <a
              routerLink="/admin/auditoria"
              class="text-[12px] text-[#6B6A66] hover:text-[#1A1A1A] font-medium"
            >
              Histórico
            </a>
          </div>

          <div class="space-y-3 divide-y divide-[#F1F1EF] overflow-y-auto max-h-[360px] pr-1">
            @for (log of ultimasActividades(); track log.id) {
              <div class="pt-3 first:pt-0 flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-full bg-[#F1F1EF] text-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5">
                  <span class="mat-icon text-[14px] leading-none">{{ getLogIcon(log.acao) }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-[12px] font-medium text-[#1A1A1A] leading-snug line-clamp-1">
                    {{ log.detalhes }}
                  </div>
                  <div class="flex items-center gap-2 mt-0.5 text-[11px] text-[#8E8D88]">
                    <span>{{ log.usuarioNome }}</span>
                    <span>•</span>
                    <span class="tnum">{{ log.timestamp | mzDate:true }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Execution Overview Table (Contratos e Empreitadas) -->
      <div class="bg-white border border-[#E6E5E1] rounded-[12px] p-5 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 class="text-[18px] font-medium text-[#1A1A1A] tracking-[-0.01em]">
              Execução de Obras e Empreitadas Rodoviárias
            </h2>
            <p class="text-[12px] text-[#6B6A66]">
              Acompanhamento de progresso físico e financeiro com alertas de desvio
            </p>
          </div>

          <a
            routerLink="/contratos"
            class="h-8 px-3.5 rounded-full border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] text-[12px] font-medium transition-colors inline-flex items-center gap-1 shadow-xs"
          >
            Ver todos contratos
          </a>
        </div>

        <div class="overflow-x-auto rounded-[8px] border border-[#EDEDEA]">
          <table class="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr class="bg-[#F5F5F3] border-b border-[#EDEDEA] text-[#6B6A66] text-[12px]">
                <th class="py-2.5 px-4 font-normal">Nº Contrato</th>
                <th class="py-2.5 px-4 font-normal">Objecto da Empreitada</th>
                <th class="py-2.5 px-4 font-normal">Adjudicatário</th>
                <th class="py-2.5 px-4 font-normal text-right">Valor Total</th>
                <th class="py-2.5 px-4 font-normal">Visto TA</th>
                <th class="py-2.5 px-4 font-normal">Progresso Físico</th>
                <th class="py-2.5 px-4 font-normal text-right">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F1EF]">
              @for (ct of contratosExecucao(); track ct.id) {
                <tr class="hover:bg-[#F5F5F3] transition-colors cursor-pointer" [routerLink]="['/contratos', ct.id]">
                  <td class="py-3 px-4 font-mono text-[12px] text-[#1A1A1A]">{{ ct.numeroContrato }}</td>
                  <td class="py-3 px-4 font-medium text-[#1A1A1A] max-w-[280px] truncate">{{ ct.objecto }}</td>
                  <td class="py-3 px-4 text-[#6B6A66]">{{ ct.adjudicatarioNome }}</td>
                  <td class="py-3 px-4 text-right font-medium text-[#1A1A1A] tnum">{{ ct.valorAtualizadoMZN | mznCurrency }}</td>
                  <td class="py-3 px-4">
                    <app-status-badge [estado]="ct.vistoTribunalAdministrativo" mode="badge" />
                  </td>
                  <td class="py-3 px-4">
                    <app-progress-bar [value]="getProgressoFisico(ct.id)" />
                  </td>
                  <td class="py-3 px-4 text-right">
                    <span class="text-[12px] font-medium text-[#1A1A1A] hover:underline">Abrir</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class OverviewComponent {
  private store = inject(LocalDataStoreService);
  auth = inject(AuthService);

  contratosActivos = computed(() => this.store.contratos().filter(c => c.estado === 'VIGENTE').length);
  concursosAbertos = computed(() => this.store.concursos().filter(c => c.estado === 'PUBLICADO').length);

  valorTotalCarteiraFormatted = computed(() => {
    const total = this.store.contratos().reduce((acc, c) => acc + c.valorAtualizadoMZN, 0);
    return `MZN ${(total / 1000000).toFixed(1)}M`;
  });

  trocosConstrucao = computed(() => this.store.trocosEstrada().filter(t => t.estado === 'EM_CONSTRUCAO').length);

  concursosProximos = computed(() => {
    return this.store.concursos()
      .filter(c => c.estado === 'PUBLICADO' || c.estado === 'EM_AVALIACAO')
      .slice(0, 4);
  });

  ultimasActividades = computed(() => {
    return this.store.auditoria().slice(0, 6);
  });

  contratosExecucao = computed(() => {
    return this.store.contratos().slice(0, 4);
  });

  getProgressoFisico(contratoId: string): number {
    const medicoes = this.store.getMedicoes(contratoId);
    if (medicoes.length === 0) return 0;
    return medicoes[medicoes.length - 1].percentualFisicoAcumulado;
  }

  getLogIcon(acao: string): string {
    if (acao.includes('CONCURSO')) return 'gavel';
    if (acao.includes('PROPOSTA')) return 'lock';
    if (acao.includes('MEDICAO')) return 'straighten';
    if (acao.includes('PAGAMENTO')) return 'payments';
    if (acao.includes('SESSAO')) return 'login';
    return 'info';
  }
}
