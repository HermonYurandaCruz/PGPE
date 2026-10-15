import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuditService } from '../../core/services/audit.service';
import { AppStatusBadge } from '../../shared/ui/status-badge.component';
import { AppProgressBar } from '../../shared/ui/progress-bar.component';
import { AppModal } from '../../shared/ui/modal.component';
import { MznCurrencyPipe, MzDatePipe } from '../../shared/pipes/format.pipes';
import {
  Contrato,
  AutoMedicao,
  PagamentoContrato,
  OcorrenciaContrato,
  AdendaContrato,
  VistoTAEstado
} from '../../shared/models/contrato.models';

@Component({
  selector: 'app-contrato-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AppStatusBadge,
    AppProgressBar,
    AppModal,
    MznCurrencyPipe,
    MzDatePipe
  ],
  template: `
    @if (contrato(); as ct) {
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFEFEC] pb-4">
          <div>
            <nav class="text-[12px] text-[#8E8D88] mb-1.5 flex items-center gap-1.5">
              <a routerLink="/contratos" class="hover:underline">Contratos</a>
              <span>/</span>
              <span class="font-mono text-[#1A1A1A]">{{ ct.numeroContrato }}</span>
            </nav>
            <div class="flex flex-wrap items-center gap-2.5">
              <h1 class="text-[22px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
                {{ ct.objecto }}
              </h1>
              <app-status-badge [estado]="ct.vistoTribunalAdministrativo" mode="badge" />
              <app-status-badge [estado]="ct.estado" mode="badge" />
            </div>
            <div class="text-[12px] text-[#6B6A66] mt-1 flex flex-wrap items-center gap-3">
              <span><strong>Adjudicatário:</strong> {{ ct.adjudicatarioNome }} (NUIT: {{ ct.adjudicatarioNuit }})</span>
              <span>•</span>
              <span><strong>Gestor:</strong> {{ ct.gestorContratoNome }}</span>
              <span>•</span>
              <span><strong>Fiscal da Obra:</strong> {{ ct.fiscalObraNome }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2.5 shrink-0">
            @if (ct.concursoId) {
              <a
                [routerLink]="['/concursos', ct.concursoId]"
                class="h-9 px-3.5 rounded-lg border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] text-[12px] font-medium transition-colors inline-flex items-center gap-1 shadow-xs"
              >
                <span class="mat-icon text-[16px]">gavel</span>
                <span>Ver Concurso Origem</span>
              </a>
            }

            @if (auth.hasRole('TECNICO', 'ADMIN')) {
              <button
                type="button"
                (click)="openModalMedicao.set(true)"
                class="h-9 px-3.5 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[12px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span class="mat-icon text-[16px]">straighten</span>
                <span>Novo Auto de Medição</span>
              </button>
            }

            @if (auth.hasRole('GESTAO', 'ADMIN')) {
              <button
                type="button"
                (click)="openModalPagamento.set(true)"
                class="h-9 px-3.5 rounded-lg border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] text-[12px] font-medium transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span class="mat-icon text-[16px]">payments</span>
                <span>Registar Pagamento</span>
              </button>
            }
          </div>
        </div>

        <!-- KPI Cards of Contract Performance & Discrepancy Warnings -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Valor do Contrato -->
          <div class="bg-white border border-[#EDEDEA] rounded-[10px] p-4 shadow-xs">
            <span class="text-[12px] text-[#8E8D88] block mb-1">Valor Contratual Atualizado</span>
            <div class="text-[20px] font-medium text-[#1A1A1A] tnum">{{ ct.valorAtualizadoMZN | mznCurrency }}</div>
            <span class="text-[11px] text-[#6B6A66] mt-1 block">Inicial: {{ ct.valorInicialMZN | mznCurrency }}</span>
          </div>

          <!-- Execução Física -->
          <div class="bg-white border border-[#EDEDEA] rounded-[10px] p-4 shadow-xs">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[12px] text-[#8E8D88]">Progresso Físico</span>
              <span class="text-[13px] font-medium text-[#1A1A1A] tnum">{{ progressoFisico() }}%</span>
            </div>
            <div class="h-2 bg-[#EDEDEA] rounded-full overflow-hidden mt-2 mb-2">
              <div class="h-full bg-[#34B26A] rounded-full" [style.width.%]="progressoFisico()"></div>
            </div>
            <span class="text-[11px] text-[#6B6A66]">{{ medicoes().length }} autos de medição validados</span>
          </div>

          <!-- Execução Financeira -->
          <div class="bg-white border border-[#EDEDEA] rounded-[10px] p-4 shadow-xs">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[12px] text-[#8E8D88]">Execução Financeira</span>
              <span class="text-[13px] font-medium text-[#1A1A1A] tnum">{{ progressoFinanceiro() }}%</span>
            </div>
            <div class="h-2 bg-[#EDEDEA] rounded-full overflow-hidden mt-2 mb-2">
              <div class="h-full bg-[#4C7DF0] rounded-full" [style.width.%]="progressoFinanceiro()"></div>
            </div>
            <span class="text-[11px] text-[#6B6A66] tnum">Total Pago: {{ totalPago() | mznCurrency }}</span>
          </div>

          <!-- Visto Tribunal Administrativo -->
          <div class="bg-white border border-[#EDEDEA] rounded-[10px] p-4 shadow-xs flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[12px] text-[#8E8D88]">Visto Prévio TA</span>
              <app-status-badge [estado]="ct.vistoTribunalAdministrativo" mode="badge" />
            </div>
            <div class="text-[12px] font-mono text-[#1A1A1A] mt-2">
              {{ ct.numeroProcessoTA || 'Pendente de Notificação' }}
            </div>
            @if (auth.hasRole('GESTAO', 'ADMIN')) {
              <button
                type="button"
                (click)="openModalTA.set(true)"
                class="text-[11px] text-[#3B6FE0] hover:underline text-left mt-1 cursor-pointer"
              >
                Actualizar Visto do TA
              </button>
            }
          </div>
        </div>

        <!-- Discrepancy Alert Banner if physical vs financial or deadline shows skew -->
        @if (temAlertaDesvio()) {
          <div class="p-4 rounded-[12px] bg-[#FEF3E0] border border-[#F8D9A6] text-[#E8920C] flex items-start gap-3 shadow-xs">
            <span class="mat-icon text-[20px] shrink-0 mt-0.5">warning</span>
            <div class="text-[12px] leading-relaxed text-[#1A1A1A]">
              <strong class="font-medium text-[#D9622B] block mb-0.5">Alerta Automático de Desvio de Execução:</strong>
              O progresso financeiro acumulado ({{ progressoFinanceiro() }}%) ou tempo decorrido apresenta discrepância em relação à execução física certificada em obra ({{ progressoFisico() }}%). Recomenda-se verificação rigorosa pelo Fiscal de Obra no próximo auto de medição.
            </div>
          </div>
        }

        <!-- Navigation Tabs -->
        <div class="border-b border-[#E6E5E1] flex items-center gap-6 overflow-x-auto text-[13px]">
          <button
            type="button"
            (click)="activeTab.set('medicoes')"
            class="py-2.5 font-medium border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap"
            [class]="activeTab() === 'medicoes' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#6B6A66] hover:text-[#1A1A1A]'"
          >
            Autos de Medição ({{ medicoes().length }})
          </button>
          <button
            type="button"
            (click)="activeTab.set('pagamentos')"
            class="py-2.5 font-medium border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap"
            [class]="activeTab() === 'pagamentos' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#6B6A66] hover:text-[#1A1A1A]'"
          >
            Pagamentos e Liquidações ({{ pagamentos().length }})
          </button>
          <button
            type="button"
            (click)="activeTab.set('ocorrencias')"
            class="py-2.5 font-medium border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap"
            [class]="activeTab() === 'ocorrencias' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#6B6A66] hover:text-[#1A1A1A]'"
          >
            Ocorrências e Penalidades ({{ ocorrencias().length }})
          </button>
          <button
            type="button"
            (click)="activeTab.set('adendas')"
            class="py-2.5 font-medium border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap"
            [class]="activeTab() === 'adendas' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#6B6A66] hover:text-[#1A1A1A]'"
          >
            Adendas e Alterações ({{ adendas().length }})
          </button>
          <button
            type="button"
            (click)="activeTab.set('habilitacao')"
            class="py-2.5 font-medium border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap"
            [class]="activeTab() === 'habilitacao' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#6B6A66] hover:text-[#1A1A1A]'"
          >
            Requisitos e Habilitação
          </button>
        </div>

        <!-- TAB 1: Autos de Medição -->
        @if (activeTab() === 'medicoes') {
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-[15px] font-medium text-[#1A1A1A]">Histórico de Medições de Obras Públicas</h3>
                <p class="text-[12px] text-[#6B6A66]">Certificação física de quantidades executadas no terreno pelo Fiscal</p>
              </div>
              @if (auth.hasRole('TECNICO', 'ADMIN')) {
                <button
                  type="button"
                  (click)="openModalMedicao.set(true)"
                  class="h-8 px-3 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[12px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                >
                  <span class="mat-icon text-[15px]">add</span>
                  <span>Novo Auto</span>
                </button>
              }
            </div>

            <div class="space-y-3">
              @for (m of medicoes(); track m.id) {
                <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-[11px] font-bold flex items-center justify-center">
                        #{{ m.numeroAuto }}
                      </span>
                      <h4 class="text-[14px] font-medium text-[#1A1A1A]">Auto de Medição nº {{ m.numeroAuto }}</h4>
                    </div>
                    <span class="text-[12px] text-[#8E8D88] tnum">{{ m.dataMedicao | mzDate }}</span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-[8px] bg-[#FCFCFB] border border-[#EDEDEA] text-[12px]">
                    <div>
                      <span class="text-[#8E8D88] block text-[11px]">Progresso do Período:</span>
                      <span class="font-medium text-[#1A1A1A]">+{{ m.percentualFisicoPeriodo }}%</span>
                    </div>
                    <div>
                      <span class="text-[#8E8D88] block text-[11px]">Progresso Acumulado:</span>
                      <span class="font-medium text-[#2E9E5B]">{{ m.percentualFisicoAcumulado }}%</span>
                    </div>
                    <div>
                      <span class="text-[#8E8D88] block text-[11px]">Valor Certificado:</span>
                      <span class="font-medium text-[#1A1A1A] tnum">{{ m.valorMedicaoMZN | mznCurrency }}</span>
                    </div>
                  </div>

                  <p class="text-[13px] text-[#4A4946] leading-relaxed">
                    {{ m.observacoes }}
                  </p>

                  @if (m.fotoSimuladaDescricao) {
                    <div class="p-2.5 rounded-[8px] bg-[#F7F7F6] border border-[#E6E5E1] text-[12px] text-[#6B6A66] flex items-center gap-2">
                      <span class="mat-icon text-[18px] text-[#3B6FE0]">photo_camera</span>
                      <span><strong>Evidência Fotográfica do Fiscal:</strong> {{ m.fotoSimuladaDescricao }}</span>
                    </div>
                  }

                  <div class="pt-2 text-[11px] text-[#8E8D88] flex items-center justify-between border-t border-[#F1F1EF]">
                    <span>Registado e homologado por: {{ m.registadoPorNome }}</span>
                    <span class="text-[#2E9E5B] font-medium flex items-center gap-1">
                      <span class="mat-icon text-[14px]">check_circle</span> Fiscalização Aprovada
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- TAB 2: Pagamentos -->
        @if (activeTab() === 'pagamentos') {
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-[15px] font-medium text-[#1A1A1A]">Liquidações e Pagamentos Financeiros</h3>
                <p class="text-[12px] text-[#6B6A66]">Registo de desembolsos orçamentais da Autoridade Competente</p>
              </div>
              @if (auth.hasRole('GESTAO', 'ADMIN')) {
                <button
                  type="button"
                  (click)="openModalPagamento.set(true)"
                  class="h-8 px-3 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[12px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                >
                  <span class="mat-icon text-[15px]">add</span>
                  <span>Registar Pagamento</span>
                </button>
              }
            </div>

            <div class="border border-[#EDEDEA] rounded-[10px] overflow-hidden bg-white shadow-xs">
              <table class="w-full text-left border-collapse text-[13px]">
                <thead class="bg-[#F5F5F3] text-[#6B6A66] text-[12px]">
                  <tr>
                    <th class="p-3">Nº Fatura</th>
                    <th class="p-3">Tipo de Pagamento</th>
                    <th class="p-3">Data Liquidação</th>
                    <th class="p-3 text-right">Valor Pago (MZN)</th>
                    <th class="p-3">Observações</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F1F1EF]">
                  @for (pg of pagamentos(); track pg.id) {
                    <tr>
                      <td class="p-3 font-mono font-medium">{{ pg.numeroFatura }}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E8EEFD] text-[#3B6FE0]">
                          {{ pg.tipo }}
                        </span>
                      </td>
                      <td class="p-3 tnum">{{ pg.dataPagamento | mzDate }}</td>
                      <td class="p-3 text-right font-medium tnum">{{ pg.valorPagoMZN | mznCurrency }}</td>
                      <td class="p-3 text-[#6B6A66] text-[12px]">{{ pg.observacoes || '-' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- TAB 3: Ocorrências e Penalidades -->
        @if (activeTab() === 'ocorrencias') {
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-[15px] font-medium text-[#1A1A1A]">Livro de Ocorrências da Obra</h3>
                <p class="text-[12px] text-[#6B6A66]">Registo oficial de incidentes, intempéries e notificações contratuais</p>
              </div>
              <button
                type="button"
                (click)="openModalOcorrencia.set(true)"
                class="h-8 px-3 rounded-lg border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] text-[12px] font-medium transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
              >
                <span class="mat-icon text-[15px]">report_problem</span>
                <span>Registar Ocorrência</span>
              </button>
            </div>

            <div class="space-y-3">
              @for (oco of ocorrencias(); track oco.id) {
                <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-4 shadow-xs space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-medium" [class]="oco.tipo === 'PENALIDADE' ? 'bg-[#FDE8E8] text-[#D64545]' : 'bg-[#FEF3E0] text-[#E8920C]'">
                        {{ oco.tipo }}
                      </span>
                      <h4 class="text-[13px] font-medium text-[#1A1A1A]">{{ oco.titulo }}</h4>
                    </div>
                    <span class="text-[11px] text-[#8E8D88] tnum">{{ oco.dataRegisto | mzDate }}</span>
                  </div>
                  <p class="text-[12px] text-[#4A4946] leading-relaxed">{{ oco.descricao }}</p>
                  @if (oco.resolvida && oco.resolucaoDescricao) {
                    <div class="p-2 rounded bg-[#E6F6EC] text-[11px] text-[#2E9E5B]">
                      <strong>Resolução:</strong> {{ oco.resolucaoDescricao }}
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- TAB 4: Adendas e Alterações Contratuais -->
        @if (activeTab() === 'adendas') {
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-[15px] font-medium text-[#1A1A1A]">Modificações Contratuais (Adendas)</h3>
                <p class="text-[12px] text-[#6B6A66]">Alterações de prazo ou valor orçamental fundamentadas nos limites legais</p>
              </div>
              @if (auth.hasRole('TECNICO', 'ADMIN')) {
                <button
                  type="button"
                  (click)="openModalAdenda.set(true)"
                  class="h-8 px-3 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[12px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                >
                  <span class="mat-icon text-[15px]">post_add</span>
                  <span>Propor Adenda</span>
                </button>
              }
            </div>

            <div class="space-y-3">
              @for (ad of adendas(); track ad.id) {
                <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-3">
                  <div class="flex items-center justify-between">
                    <h4 class="text-[14px] font-medium text-[#1A1A1A]">Adenda Contratual nº {{ ad.numeroAdenda }} ({{ ad.tipo }})</h4>
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium" [class]="ad.estado === 'APROVADA' ? 'bg-[#E6F6EC] text-[#2E9E5B]' : 'bg-[#FEF3E0] text-[#E8920C]'">
                      {{ ad.estado }}
                    </span>
                  </div>

                  <p class="text-[12px] text-[#4A4946] leading-relaxed">
                    <strong>Justificação Técnica:</strong> {{ ad.justificacao }}
                  </p>

                  <div class="grid grid-cols-2 gap-3 p-3 rounded-[8px] bg-[#FCFCFB] text-[12px]">
                    @if (ad.valorAdicionalMZN) {
                      <div>
                        <span class="text-[#8E8D88] block text-[11px]">Valor Adicional:</span>
                        <span class="font-medium text-[#1A1A1A] tnum">{{ ad.valorAdicionalMZN | mznCurrency }}</span>
                      </div>
                    }
                    @if (ad.prazoAdicionalDias) {
                      <div>
                        <span class="text-[#8E8D88] block text-[11px]">Prazo Adicional:</span>
                        <span class="font-medium text-[#1A1A1A]">+{{ ad.prazoAdicionalDias }} Dias</span>
                      </div>
                    }
                  </div>

                  @if (ad.estado === 'PENDENTE' && auth.hasRole('GESTAO', 'ADMIN')) {
                    <div class="pt-2 border-t border-[#F1F1EF] flex items-center justify-end gap-2">
                      <button
                        type="button"
                        (click)="aprovarAdenda(ad.id)"
                        class="h-7 px-3 rounded-md bg-[#2E9E5B] text-white hover:bg-[#25824A] text-[11px] font-medium cursor-pointer"
                      >
                        Aprovar Adenda
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- TAB 5: Requisitos e Habilitação -->
        @if (activeTab() === 'habilitacao') {
          <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-4">
            <div>
              <h3 class="text-[15px] font-medium text-[#1A1A1A]">Checklist de Requisitos do Adjudicatário</h3>
              <p class="text-[12px] text-[#6B6A66]">
                Conformidade documental obrigatória para celebração e manutenção do contrato de empreitada
              </p>
            </div>

            <div class="border border-[#EDEDEA] rounded-[10px] divide-y divide-[#F1F1EF]">
              <div class="p-3.5 flex items-center justify-between">
                <div>
                  <div class="font-medium text-[13px] text-[#1A1A1A]">Certidão de Quitação Fiscal (Autoridade Tributária)</div>
                  <div class="text-[11px] text-[#8E8D88]">Impostos fiscais em dia (IVA, IRPC)</div>
                </div>
                <span class="text-[#2E9E5B] text-[12px] font-medium flex items-center gap-1">
                  <span class="mat-icon text-[16px]">check_circle</span> Cumprida
                </span>
              </div>

              <div class="p-3.5 flex items-center justify-between">
                <div>
                  <div class="font-medium text-[13px] text-[#1A1A1A]">Certidão de Quitação INSS (Segurança Social)</div>
                  <div class="text-[11px] text-[#8E8D88]">Contribuições de trabalhadores em dia</div>
                </div>
                <span class="text-[#2E9E5B] text-[12px] font-medium flex items-center gap-1">
                  <span class="mat-icon text-[16px]">check_circle</span> Cumprida
                </span>
              </div>

              <div class="p-3.5 flex items-center justify-between">
                <div>
                  <div class="font-medium text-[13px] text-[#1A1A1A]">Garantia Definitiva Bancária (5% a 10%)</div>
                  <div class="text-[11px] text-[#8E8D88]">Garantia de bom cumprimento das obrigações contratuais</div>
                </div>
                @if (ct.checklistHabilitacao.garantiaDefinitivaBancaria) {
                  <span class="text-[#2E9E5B] text-[12px] font-medium flex items-center gap-1">
                    <span class="mat-icon text-[16px]">check_circle</span> Depositada
                  </span>
                } @else {
                  <button
                    type="button"
                    (click)="marcarGarantiaDepositada(ct)"
                    class="h-7 px-2.5 rounded-md border border-[#E6E5E1] text-[11px] text-[#E8920C] hover:bg-[#FEF3E0] cursor-pointer"
                  >
                    Marcar como Depositada
                  </button>
                }
              </div>

              <div class="p-3.5 flex items-center justify-between">
                <div>
                  <div class="font-medium text-[13px] text-[#1A1A1A]">Alvará de Construção Válido</div>
                  <div class="text-[11px] text-[#8E8D88]">MOPHR - Classe compatível com a empreitada</div>
                </div>
                <span class="text-[#2E9E5B] text-[12px] font-medium flex items-center gap-1">
                  <span class="mat-icon text-[16px]">check_circle</span> Válido
                </span>
              </div>
            </div>
          </div>
        }

        <!-- MODAL: Novo Auto de Medição -->
        <app-modal
          [isOpen]="openModalMedicao()"
          title="Registar Auto de Medição Física de Obra"
          subtitle="Fiscalização Técnica MTL"
          (closed)="openModalMedicao.set(false)"
        >
          <div modal-body class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">
                  % Físico Adicional do Período *
                </label>
                <input
                  type="number"
                  [value]="novaMedicaoPerc()"
                  (input)="novaMedicaoPerc.set(+$any($event.target).value)"
                  placeholder="Ex: 15.0"
                  class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] font-mono focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">
                  Valor da Medição (MZN) *
                </label>
                <input
                  type="number"
                  [value]="novaMedicaoValor()"
                  (input)="novaMedicaoValor.set(+$any($event.target).value)"
                  placeholder="Ex: 35000000"
                  class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">
                Observações e Trabalhos Medidos *
              </label>
              <textarea
                [value]="novaMedicaoObs()"
                (input)="novaMedicaoObs.set($any($event.target).value)"
                rows="3"
                placeholder="Descreva os trabalhos executados no terreno (ex: aplicação de camada de desgaste em 10 km)..."
                class="w-full p-2.5 rounded-lg border border-[#E6E5E1] text-[12px] focus:outline-none focus:border-[#1A1A1A]"
              ></textarea>
            </div>
          </div>
          <div modal-footer>
            <button
              type="button"
              (click)="openModalMedicao.set(false)"
              class="h-9 px-3.5 rounded-lg border border-[#E6E5E1] text-[#6B6A66] text-[12px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="confirmarMedicao(ct)"
              class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white text-[12px] font-medium cursor-pointer"
            >
              Salvar e Homologar Medição
            </button>
          </div>
        </app-modal>

        <!-- MODAL: Registar Pagamento -->
        <app-modal
          [isOpen]="openModalPagamento()"
          title="Registar Liquidação / Pagamento de Fatura"
          subtitle="Execução Financeira MTL"
          (closed)="openModalPagamento.set(false)"
        >
          <div modal-body class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Nº da Fatura do Empreiteiro *</label>
                <input
                  type="text"
                  [value]="novoPagamentoFatura()"
                  (input)="novoPagamentoFatura.set($any($event.target).value)"
                  placeholder="Ex: FT-CETA-2026/045"
                  class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] font-mono focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Valor Pago (MZN) *</label>
                <input
                  type="number"
                  [value]="novoPagamentoValor()"
                  (input)="novoPagamentoValor.set(+$any($event.target).value)"
                  placeholder="Ex: 35000000"
                  class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Observações de Liquidação</label>
              <input
                type="text"
                [value]="novoPagamentoObs()"
                (input)="novoPagamentoObs.set($any($event.target).value)"
                placeholder="Ex: Liquidação correspondente ao auto de medição nº 3"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[12px] focus:outline-none"
              />
            </div>
          </div>
          <div modal-footer>
            <button
              type="button"
              (click)="openModalPagamento.set(false)"
              class="h-9 px-3 rounded-lg border border-[#E6E5E1] text-[#6B6A66] text-[12px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="confirmarPagamento(ct)"
              class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white text-[12px] font-medium cursor-pointer"
            >
              Confirmar Pagamento
            </button>
          </div>
        </app-modal>

        <!-- MODAL: Actualizar Visto do Tribunal Administrativo -->
        <app-modal
          [isOpen]="openModalTA()"
          title="Actualização da Fiscalização Prévia do Tribunal Administrativo"
          subtitle="Secção de Contas Públicas"
          (closed)="openModalTA.set(false)"
        >
          <div modal-body class="space-y-4">
            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Decisão do Tribunal Administrativo *</label>
              <select
                [value]="novoVistoTA()"
                (change)="novoVistoTA.set($any($event.target).value)"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] text-[#1A1A1A] focus:outline-none"
              >
                <option value="VISADO">Visado com Parecer Favorável</option>
                <option value="PENDENTE">Pendente de Notificação</option>
                <option value="RECUSADO">Visto Recusado com Objecções</option>
              </select>
            </div>

            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Nº do Processo do TA</label>
              <input
                type="text"
                [value]="novoNumeroProcessoTA()"
                (input)="novoNumeroProcessoTA.set($any($event.target).value)"
                placeholder="Ex: Proc. TA-1ª Secção nº 890/2026"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] font-mono focus:outline-none"
              />
            </div>
          </div>
          <div modal-footer>
            <button
              type="button"
              (click)="openModalTA.set(false)"
              class="h-9 px-3 rounded-lg border border-[#E6E5E1] text-[#6B6A66] text-[12px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="confirmarVistoTA(ct)"
              class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white text-[12px] font-medium cursor-pointer"
            >
              Gravar Decisão do TA
            </button>
          </div>
        </app-modal>
      </div>
    }
  `
})
export class ContratoDetailComponent {
  private store = inject(LocalDataStoreService);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);
  private audit = inject(AuditService);
  auth = inject(AuthService);

  contratoId = signal<string>('');
  activeTab = signal<'medicoes' | 'pagamentos' | 'ocorrencias' | 'adendas' | 'habilitacao'>('medicoes');

  openModalMedicao = signal(false);
  openModalPagamento = signal(false);
  openModalOcorrencia = signal(false);
  openModalAdenda = signal(false);
  openModalTA = signal(false);

  novaMedicaoPerc = signal(12.0);
  novaMedicaoValor = signal(30000000);
  novaMedicaoObs = signal('');

  novoPagamentoFatura = signal('FT-EMPR-2026/001');
  novoPagamentoValor = signal(30000000);
  novoPagamentoObs = signal('');

  novoVistoTA = signal<VistoTAEstado>('VISADO');
  novoNumeroProcessoTA = signal('Proc. TA-1ª Secção nº 512/2026');

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.contratoId.set(id);
      }
    });
  }

  contrato = computed(() => {
    return this.store.getContratoById(this.contratoId());
  });

  medicoes = computed(() => {
    const id = this.contratoId();
    return id ? this.store.getMedicoes(id) : [];
  });

  pagamentos = computed(() => {
    const id = this.contratoId();
    return id ? this.store.getPagamentos(id) : [];
  });

  ocorrencias = computed(() => {
    const id = this.contratoId();
    return id ? this.store.getOcorrencias(id) : [];
  });

  adendas = computed(() => {
    const id = this.contratoId();
    return id ? this.store.getAdendas(id) : [];
  });

  progressoFisico = computed(() => {
    const med = this.medicoes();
    if (med.length === 0) return 0;
    return med[med.length - 1].percentualFisicoAcumulado;
  });

  totalPago = computed(() => {
    return this.pagamentos().reduce((acc, p) => acc + p.valorPagoMZN, 0);
  });

  progressoFinanceiro = computed(() => {
    const ct = this.contrato();
    if (!ct || ct.valorAtualizadoMZN === 0) return 0;
    return Math.min(100, Math.round((this.totalPago() / ct.valorAtualizadoMZN) * 1000) / 10);
  });

  temAlertaDesvio = computed(() => {
    const fis = this.progressoFisico();
    const fin = this.progressoFinanceiro();
    // Ex: financeiro 15% acima do físico
    return fin > fis + 15;
  });

  async confirmarMedicao(ct: Contrato): Promise<void> {
    const ultimoAuto = this.medicoes().length > 0
      ? this.medicoes()[this.medicoes().length - 1].numeroAuto
      : 0;

    const acum = Math.min(100, this.progressoFisico() + this.novaMedicaoPerc());

    const novoAuto: AutoMedicao = {
      id: 'med-' + Math.random().toString(36).substring(2, 9),
      contratoId: ct.id,
      numeroAuto: ultimoAuto + 1,
      dataMedicao: new Date().toISOString(),
      percentualFisicoPeriodo: this.novaMedicaoPerc(),
      percentualFisicoAcumulado: acum,
      valorMedicaoMZN: this.novaMedicaoValor(),
      observacoes: this.novaMedicaoObs() || 'Auto de medição física certificado pela fiscalização.',
      fotoSimuladaDescricao: `Registo fotográfico do Auto ${ultimoAuto + 1} com verificação in loco.`,
      registadoPorNome: this.auth.currentUser()?.name || 'Fiscal de Obra',
      aprovadoPorFiscal: true
    };

    this.store.addMedicao(novoAuto);

    await this.audit.log(
      this.auth.currentUser(),
      'REGISTO_MEDICAO',
      'MEDICAO',
      `Auto de medição nº ${novoAuto.numeroAuto} registado no contrato ${ct.numeroContrato} com progresso acumulado de ${acum}%`,
      ct.id
    );

    this.openModalMedicao.set(false);
    this.novaMedicaoObs.set('');
    this.notification.success(`Auto de medição nº ${novoAuto.numeroAuto} gravado com sucesso!`, 'Medição Homologada');
  }

  async confirmarPagamento(ct: Contrato): Promise<void> {
    const novoPg: PagamentoContrato = {
      id: 'pg-' + Math.random().toString(36).substring(2, 9),
      contratoId: ct.id,
      numeroFatura: this.novoPagamentoFatura(),
      tipo: 'MEDICAO',
      valorPagoMZN: this.novoPagamentoValor(),
      dataPagamento: new Date().toISOString(),
      observacoes: this.novoPagamentoObs(),
      registadoPor: this.auth.currentUser()?.name || 'Gestão MTL'
    };

    this.store.addPagamento(novoPg);

    await this.audit.log(
      this.auth.currentUser(),
      'REGISTO_PAGAMENTO',
      'PAGAMENTO',
      `Liquidação da fatura ${novoPg.numeroFatura} no valor de MZN ${novoPg.valorPagoMZN} no contrato ${ct.numeroContrato}`,
      ct.id
    );

    this.openModalPagamento.set(false);
    this.notification.success(`Pagamento da fatura ${novoPg.numeroFatura} registado.`, 'Desembolso Efetuado');
  }

  async confirmarVistoTA(ct: Contrato): Promise<void> {
    this.store.updateContrato(ct.id, {
      vistoTribunalAdministrativo: this.novoVistoTA(),
      numeroProcessoTA: this.novoNumeroProcessoTA(),
      dataVistoTA: new Date().toISOString()
    });

    await this.audit.log(
      this.auth.currentUser(),
      'ACTUALIZACAO_VISTO_TA',
      'CONTRATO',
      `Estado do visto do Tribunal Administrativo actualizado para ${this.novoVistoTA()} (${this.novoNumeroProcessoTA()})`,
      ct.id
    );

    this.openModalTA.set(false);
    this.notification.success('Fiscalização prévia do Tribunal Administrativo actualizada.', 'Decisão do TA');
  }

  async aprovarAdenda(adendaId: string): Promise<void> {
    this.store.updateAdenda(adendaId, {
      estado: 'APROVADA',
      aprovadaPorNome: this.auth.currentUser()?.name || 'Directora Nacional',
      dataAprovacao: new Date().toISOString()
    });
    this.notification.success('Adenda contratual aprovada pela Gestão.', 'Adenda Aprovada');
  }

  marcarGarantiaDepositada(ct: Contrato): void {
    const chk = { ...ct.checklistHabilitacao, garantiaDefinitivaBancaria: true };
    this.store.updateContrato(ct.id, { checklistHabilitacao: chk });
    this.notification.success('Garantia definitiva bancária marcada como cumprida.', 'Habilitação');
  }
}
