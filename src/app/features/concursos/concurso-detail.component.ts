import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuditService } from '../../core/services/audit.service';
import { AppStatusBadge } from '../../shared/ui/status-badge.component';
import { AppCountdown } from '../../shared/ui/countdown.component';
import { AppModal } from '../../shared/ui/modal.component';
import { MznCurrencyPipe, MzDatePipe } from '../../shared/pipes/format.pipes';
import { Concurso } from '../../shared/models/concurso.models';
import { AtaAbertura } from '../../shared/models/proposta.models';
import { MODALIDADES_DECRETO_79_2022 } from '../../shared/models/modalidades.models';
import { Contrato } from '../../shared/models/contrato.models';

@Component({
  selector: 'app-concurso-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AppStatusBadge,
    AppCountdown,
    AppModal,
    MznCurrencyPipe,
    MzDatePipe
  ],
  template: `
    @if (concurso(); as c) {
      <div class="space-y-6">
        <!-- Breadcrumb + Navigation Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFEFEC] pb-4">
          <div>
            <nav class="text-[12px] text-[#8E8D88] mb-1.5 flex items-center gap-1.5">
              <a routerLink="/concursos" class="hover:underline">Concursos</a>
              <span>/</span>
              <span class="font-mono text-[#1A1A1A]">{{ c.numeroProcesso }}</span>
            </nav>
            <div class="flex flex-wrap items-center gap-2.5">
              <h1 class="text-[22px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
                {{ c.titulo }}
              </h1>
              <app-status-badge [estado]="c.estado" mode="badge" />
            </div>
            <div class="text-[12px] text-[#6B6A66] mt-1 flex flex-wrap items-center gap-3">
              <span><strong>Modalidade:</strong> {{ modalidadeInfo()?.nome }}</span>
              <span>•</span>
              <span><strong>Província:</strong> {{ c.provincia }}</span>
              <span>•</span>
              <span><strong>Valor Estimado:</strong> <span class="font-medium text-[#1A1A1A] tnum">{{ c.valorEstimadoMZN | mznCurrency }}</span></span>
            </div>
          </div>

          <!-- Dynamic Action Buttons based on User Role & Contest State Machine -->
          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <!-- State: RASCUNHO -> Send to Approval (Tecnico/Admin) -->
            @if (c.estado === 'RASCUNHO' && auth.hasRole('TECNICO', 'ADMIN')) {
              <button
                type="button"
                (click)="enviarParaAprovacao(c)"
                class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span class="mat-icon text-[16px]">send</span>
                <span>Submeter para Aprovação (UGEA)</span>
              </button>
            }

            <!-- State: PENDENTE_APROVACAO -> Approve & Publish (Gestao/Admin) -->
            @if (c.estado === 'PENDENTE_APROVACAO' && auth.hasRole('GESTAO', 'ADMIN')) {
              <button
                type="button"
                (click)="openModalAprovacao.set(true)"
                class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span class="mat-icon text-[16px]">verified</span>
                <span>Aprovar e Publicar Concurso</span>
              </button>
            }

            <!-- State: PUBLICADO -> Submit Sealed Bid (Concorrente) -->
            @if (c.estado === 'PUBLICADO' && auth.hasRole('CONCORRENTE')) {
              @if (isDeadlineOpen()) {
                <a
                  [routerLink]="['/concorrente/submeter', c.id]"
                  class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span class="mat-icon text-[16px]">lock</span>
                  <span>{{ minhaProposta() ? 'Substituir Proposta (v' + minhaProposta()!.versao + ')' : 'Submeter Proposta Selada' }}</span>
                </a>
              } @else {
                <span class="h-9 px-3 rounded-lg bg-[#FDE8E8] text-[#D64545] text-[12px] font-medium inline-flex items-center gap-1">
                  <span class="mat-icon text-[15px]">timer_off</span>
                  <span>Prazo de Submissão Encerrado</span>
                </span>
              }
            }

            <!-- State: PUBLICADO & Deadline Over -> Perform Jury Opening (Tecnico/Gestao/Admin) -->
            @if (c.estado === 'PUBLICADO' && auth.hasRole('TECNICO', 'GESTAO', 'ADMIN')) {
              @if (!isDeadlineOpen()) {
                <button
                  type="button"
                  (click)="realizarAtoAbertura(c)"
                  class="h-9 px-4 rounded-lg bg-[#2E9E5B] text-white hover:bg-[#25824A] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span class="mat-icon text-[16px]">lock_open</span>
                  <span>Realizar Ato de Abertura (Júri)</span>
                </button>
              } @else {
                <button
                  type="button"
                  (click)="simularFimPrazo(c.id)"
                  class="h-9 px-3 rounded-lg border border-[#E8920C] text-[#E8920C] hover:bg-[#FEF3E0] text-[12px] font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Acelerar demonstração: fecha o prazo imediatamente"
                >
                  <span class="mat-icon text-[15px]">fast_forward</span>
                  <span>Simular Fim do Prazo</span>
                </button>
              }
            }

            <!-- State: EM_AVALIACAO -> Adjudicate (Gestao/Admin) -->
            @if (c.estado === 'EM_AVALIACAO' && auth.hasRole('GESTAO', 'ADMIN')) {
              <button
                type="button"
                (click)="openModalAdjudicacao.set(true)"
                class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span class="mat-icon text-[16px]">gavel</span>
                <span>Homologar e Adjudicar</span>
              </button>
            }

            <!-- State: ADJUDICADO or EM_EXECUCAO -> Go to Contract -->
            @if (contratoAssociado(); as ct) {
              <a
                [routerLink]="['/contratos', ct.id]"
                class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <span class="mat-icon text-[16px]">description</span>
                <span>Ver Contrato ({{ ct.numeroContrato }})</span>
              </a>
            }
          </div>
        </div>

        <!-- Banner for Countdown or Awarded State -->
        @if (c.estado === 'PUBLICADO') {
          <div class="p-4 rounded-[12px] bg-[#FCFCFB] border border-[#E6E5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-[#E8EEFD] text-[#3B6FE0] flex items-center justify-center shrink-0">
                <span class="mat-icon text-[18px]">alarm</span>
              </div>
              <div>
                <h4 class="text-[13px] font-medium text-[#1A1A1A]">Contagem Regressiva do Prazo de Submissão</h4>
                <p class="text-[12px] text-[#6B6A66]">
                  Data limite: {{ c.prazoSubmissao | mzDate:true }} • Abertura pública: {{ c.dataAbertura | mzDate:true }}
                </p>
              </div>
            </div>
            <app-countdown [targetDate]="c.prazoSubmissao" />
          </div>
        }

        @if (c.estado === 'ADJUDICADO') {
          <div class="p-4 rounded-[12px] bg-[#E6F6EC] border border-[#BFE6CF] text-[#2E9E5B] flex items-center justify-between gap-3 shadow-xs">
            <div class="flex items-center gap-3">
              <span class="mat-icon text-[24px]">verified</span>
              <div>
                <h4 class="text-[14px] font-medium text-[#1A1A1A]">Procedimento Concluído com Adjudicação</h4>
                <p class="text-[12px] text-[#2E9E5B]">
                  Adjudicado a <strong>{{ c.vencedorAdjudicadoNome }}</strong> no valor de {{ c.valorAdjudicadoMZN | mznCurrency }}
                </p>
              </div>
            </div>
          </div>
        }

        <!-- Tabs Navigation -->
        <div class="border-b border-[#E6E5E1] flex items-center gap-6 overflow-x-auto text-[13px]">
          <button
            type="button"
            (click)="activeTab.set('visao-geral')"
            class="py-2.5 font-medium border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap"
            [class]="activeTab() === 'visao-geral' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#6B6A66] hover:text-[#1A1A1A]'"
          >
            Visão Geral e Escopo
          </button>
          <button
            type="button"
            (click)="activeTab.set('documentos')"
            class="py-2.5 font-medium border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap"
            [class]="activeTab() === 'documentos' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#6B6A66] hover:text-[#1A1A1A]'"
          >
            Peças do Concurso ({{ c.documentos.length }})
          </button>
          <button
            type="button"
            (click)="activeTab.set('esclarecimentos')"
            class="py-2.5 font-medium border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap"
            [class]="activeTab() === 'esclarecimentos' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#6B6A66] hover:text-[#1A1A1A]'"
          >
            Pedidos de Esclarecimento ({{ esclarecimentos().length }})
          </button>
          <button
            type="button"
            (click)="activeTab.set('propostas')"
            class="py-2.5 font-medium border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap"
            [class]="activeTab() === 'propostas' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#6B6A66] hover:text-[#1A1A1A]'"
          >
            Propostas e Avaliação ({{ propostas().length }})
          </button>
        </div>

        <!-- Tab Content 1: Visão Geral -->
        @if (activeTab() === 'visao-geral') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
              <!-- Objecto Completo -->
              <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-3">
                <h3 class="text-[15px] font-medium text-[#1A1A1A]">Objecto da Contratação</h3>
                <p class="text-[13px] text-[#4A4946] leading-relaxed whitespace-pre-line">
                  {{ c.objecto }}
                </p>
                @if (c.localizacaoEspecifica) {
                  <div class="pt-2 text-[12px] text-[#6B6A66] flex items-center gap-1.5">
                    <span class="mat-icon text-[16px] text-[#8E8D88]">place</span>
                    <span>Localização: <strong>{{ c.localizacaoEspecifica }}</strong></span>
                  </div>
                }
              </div>

              <!-- Troço SIG Associado -->
              @if (trocoAssociado(); as tr) {
                <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="text-[15px] font-medium text-[#1A1A1A]">Módulo Geoespacial Viário (SIG)</h3>
                    <a routerLink="/mapa" class="text-[12px] font-medium text-[#3B6FE0] hover:underline flex items-center gap-1">
                      Ver no Mapa Completo <span class="mat-icon text-[14px]">map</span>
                    </a>
                  </div>
                  <div class="p-3 bg-[#FCFCFB] border border-[#E6E5E1] rounded-[8px] flex items-center justify-between">
                    <div>
                      <div class="font-medium text-[#1A1A1A] text-[13px]">{{ tr.codigo }}: {{ tr.designacao }}</div>
                      <div class="text-[11px] text-[#8E8D88]">Extensão: {{ tr.extensaoKm }} km • Pavimento: {{ tr.detalhesTecnicos.tipoPavimento }}</div>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#E8EEFD] text-[#3B6FE0]">
                      {{ tr.estado }}
                    </span>
                  </div>
                </div>
              }

              <!-- Critérios de Avaliação -->
              <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-3">
                <h3 class="text-[15px] font-medium text-[#1A1A1A]">Critérios de Selecção e Ponderação</h3>
                <p class="text-[13px] text-[#6B6A66]">
                  @if (c.criterioAvaliacao === 'COMBINADO') {
                    Método de Avaliação Combinada: Proposta Técnica ({{ c.pesoTecnico }}%) e Proposta Financeira ({{ c.pesoFinanceiro }}%).
                  } @else {
                    Método do Menor Preço Avaliado em conformidade técnica com o Caderno de Encargos.
                  }
                </p>
              </div>
            </div>

            <!-- Coluna Lateral: Metadados e Júri -->
            <div class="space-y-4">
              <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-3">
                <h4 class="text-[13px] font-medium uppercase tracking-wider text-[#8E8D88]">Dados Administrativos</h4>
                <div class="space-y-2.5 text-[12px] divide-y divide-[#F1F1EF]">
                  <div class="flex justify-between pt-1">
                    <span class="text-[#8E8D88]">Órgão Requisitante:</span>
                    <span class="font-medium text-[#1A1A1A]">MTL / UGEA</span>
                  </div>
                  <div class="flex justify-between pt-2">
                    <span class="text-[#8E8D88]">Data de Criação:</span>
                    <span class="font-medium text-[#1A1A1A] tnum">{{ c.dataCriacao | mzDate }}</span>
                  </div>
                  <div class="flex justify-between pt-2">
                    <span class="text-[#8E8D88]">Técnico Instrutor:</span>
                    <span class="font-medium text-[#1A1A1A]">{{ c.criadoPorNome }}</span>
                  </div>
                  <div class="flex justify-between pt-2">
                    <span class="text-[#8E8D88]">Prazo Regulamentar:</span>
                    <span class="font-medium text-[#1A1A1A]">Mínimo {{ modalidadeInfo()?.prazoMinimoDias }} dias</span>
                  </div>
                </div>
              </div>

              <!-- Júri de Avaliação -->
              <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-3">
                <h4 class="text-[13px] font-medium uppercase tracking-wider text-[#8E8D88]">Comissão de Júri Designada</h4>
                <div class="space-y-2">
                  <div class="p-2.5 rounded-lg bg-[#F7F7F6] text-[12px] flex items-center gap-2">
                    <span class="mat-icon text-[16px] text-[#6B6A66]">badge</span>
                    <div>
                      <div class="font-medium text-[#1A1A1A]">Eng. Sérgio Macuácua</div>
                      <div class="text-[10px] text-[#8E8D88]">Presidente do Júri • UGEA</div>
                    </div>
                  </div>
                  <div class="p-2.5 rounded-lg bg-[#F7F7F6] text-[12px] flex items-center gap-2">
                    <span class="mat-icon text-[16px] text-[#6B6A66]">person</span>
                    <div>
                      <div class="font-medium text-[#1A1A1A]">Dr. Salvador Matsinhe</div>
                      <div class="text-[10px] text-[#8E8D88]">Vogal Jurídico • TIC</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Tab Content 2: Documentos do Concurso -->
        @if (activeTab() === 'documentos') {
          <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-[15px] font-medium text-[#1A1A1A]">Peças Oficiais do Procedimento</h3>
                <p class="text-[12px] text-[#6B6A66]">Documentos disponibilizados publicamente para elaboração das propostas</p>
              </div>
            </div>

            <div class="space-y-2">
              @for (doc of c.documentos; track doc.id) {
                <div class="h-12 px-4 border border-[#E6E5E1] rounded-[10px] bg-[#FCFCFB] hover:bg-white transition-all flex items-center justify-between gap-3 shadow-xs">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-7 h-7 rounded-full bg-[#E8EEFD] text-[#3B6FE0] flex items-center justify-center shrink-0">
                      <span class="mat-icon text-[15px]">description</span>
                    </div>
                    <div class="min-w-0">
                      <div class="text-[13px] font-medium text-[#1A1A1A] truncate">{{ doc.nome }}</div>
                      <div class="text-[11px] text-[#8E8D88]">{{ doc.descricao || 'Peça oficial de concurso' }}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    (click)="downloadSimulado(doc.nome)"
                    class="h-7 px-3 rounded-md border border-[#E6E5E1] hover:bg-[#F1F1EF] text-[#1A1A1A] text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span class="mat-icon text-[14px]">download</span>
                    <span>Descarregar</span>
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- Tab Content 3: Pedidos de Esclarecimento -->
        @if (activeTab() === 'esclarecimentos') {
          <div class="space-y-4">
            <!-- Ask Question Form for Competitor -->
            @if (auth.hasRole('CONCORRENTE')) {
              <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-3">
                <h3 class="text-[15px] font-medium text-[#1A1A1A]">Submeter Pedido de Esclarecimento</h3>
                <p class="text-[12px] text-[#6B6A66]">
                  A resposta prestada pela UGEA será comunicada com publicidade a todos os interessados no portal.
                </p>
                <div class="space-y-2">
                  <textarea
                    [value]="novoEsclarecimentoTexto()"
                    (input)="onNovoEsclarecimentoInput($event)"
                    rows="3"
                    placeholder="Escreva a sua dúvida relativa ao Caderno de Encargos ou especificações técnicas..."
                    class="w-full p-3 rounded-lg border border-[#E6E5E1] text-[13px] focus:outline-none focus:border-[#1A1A1A]"
                  ></textarea>
                  <div class="flex justify-end">
                    <button
                      type="button"
                      [disabled]="!novoEsclarecimentoTexto().trim()"
                      (click)="enviarPerguntaEsclarecimento(c)"
                      class="h-8 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] disabled:bg-[#EDEDEA] disabled:text-[#B8B7B1] text-[12px] font-medium transition-colors cursor-pointer"
                    >
                      Enviar Pergunta
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- List of Clarifications -->
            <div class="space-y-3">
              @for (escl of esclarecimentos(); track escl.id) {
                <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-3">
                  <div class="flex items-center justify-between text-[11px] text-[#8E8D88]">
                    <span>Submetido por: <strong class="text-[#1A1A1A]">{{ escl.autorNome }}</strong></span>
                    <span class="tnum">{{ escl.dataPergunta | mzDate:true }}</span>
                  </div>

                  <div class="p-3 bg-[#F7F7F6] rounded-[8px] text-[13px] text-[#1A1A1A]">
                    <strong class="text-[12px] text-[#6B6A66] block mb-1">Dúvida / Questão formulada:</strong>
                    {{ escl.pergunta }}
                  </div>

                  @if (escl.resposta) {
                    <div class="p-3 bg-[#E8EEFD] border border-[#C5D4F8] rounded-[8px] text-[13px] text-[#1A1A1A] space-y-1">
                      <div class="flex items-center justify-between text-[11px] text-[#3B6FE0] font-medium">
                        <span>Resposta Oficial UGEA • {{ escl.respondidoPorNome }}</span>
                        <span class="tnum">{{ escl.dataResposta | mzDate:true }}</span>
                      </div>
                      <p class="leading-relaxed">{{ escl.resposta }}</p>
                    </div>
                  } @else {
                    @if (auth.hasRole('TECNICO', 'ADMIN')) {
                      <!-- Form to reply as tecnico -->
                      <div class="pt-2 space-y-2">
                        <textarea
                          #respInput
                          rows="2"
                          placeholder="Redigir resposta oficial da UGEA..."
                          class="w-full p-2.5 rounded-lg border border-[#E6E5E1] text-[12px] focus:outline-none focus:border-[#1A1A1A]"
                        ></textarea>
                        <div class="flex justify-end">
                          <button
                            type="button"
                            (click)="responderPergunta(escl.id, respInput.value)"
                            class="h-7 px-3 rounded-md bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[11px] font-medium cursor-pointer"
                          >
                            Publicar Resposta Oficial
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="text-[12px] text-[#E8920C] flex items-center gap-1 italic">
                        <span class="mat-icon text-[14px]">schedule</span>
                        <span>Aguardando resposta oficial da comissão técnica da UGEA.</span>
                      </div>
                    }
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Tab Content 4: Propostas e Avaliação -->
        @if (activeTab() === 'propostas') {
          <div class="space-y-4">
            <!-- Sealed Bids Confidentiality Notice -->
            @if (c.estado === 'PUBLICADO' && isDeadlineOpen()) {
              <div class="p-4 rounded-[12px] bg-[#FCFCFB] border border-[#E6E5E1] flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shrink-0">
                  <span class="mat-icon text-[18px]">lock</span>
                </div>
                <div>
                  <h4 class="text-[13px] font-medium text-[#1A1A1A]">Regime de Sigilo Estrito de Propostas Seladas</h4>
                  <p class="text-[12px] text-[#6B6A66]">
                    Em conformidade com o Artigo 68 do Decreto 79/2022, as propostas submetidas encontram-se seladas criptograficamente com SHA-256. Nenhum utilizador (incluindo Júri e Administradores) tem acesso aos valores ou documentos antes da sessão solene de abertura.
                  </p>
                </div>
              </div>
            }

            <!-- Ata de Abertura if Generated -->
            @if (ataAbertura(); as ata) {
              <div class="p-4 rounded-[12px] bg-[#E8EEFD] border border-[#C5D4F8] flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <span class="mat-icon text-[24px] text-[#3B6FE0]">description</span>
                  <div>
                    <h4 class="text-[13px] font-medium text-[#1A1A1A]">Ata Oficial da Sessão de Abertura Pública</h4>
                    <p class="text-[11px] text-[#6B6A66]">
                      Ato realizado em {{ ata.dataAbertura | mzDate:true }} com {{ ata.totalPropostasRecebidas }} propostas admitidas com integridade criptográfica certificada.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="openModalAta.set(true)"
                  class="h-8 px-3 rounded-lg bg-white border border-[#C5D4F8] hover:bg-[#F5F5F3] text-[#3B6FE0] text-[12px] font-medium transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  Consultar Ata
                </button>
              </div>
            }

            <!-- Proposals List -->
            <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-[15px] font-medium text-[#1A1A1A]">Propostas Submetidas</h3>
                  <p class="text-[12px] text-[#6B6A66]">Registo de submissão electrónica de concorrentes</p>
                </div>
              </div>

              <div class="overflow-x-auto rounded-[8px] border border-[#EDEDEA]">
                <table class="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr class="bg-[#F5F5F3] border-b border-[#EDEDEA] text-[#6B6A66] text-[12px]">
                      <th class="py-2.5 px-4 font-normal">Referência</th>
                      <th class="py-2.5 px-4 font-normal">Concorrente</th>
                      <th class="py-2.5 px-4 font-normal">NUIT</th>
                      <th class="py-2.5 px-4 font-normal">Data / Carimbo</th>
                      <th class="py-2.5 px-4 font-normal">Estado Selo</th>
                      <th class="py-2.5 px-4 font-normal text-right">Valor Proposto</th>
                      @if (c.estado === 'EM_AVALIACAO' || c.estado === 'ADJUDICADO' || c.estado === 'EM_EXECUCAO') {
                        <th class="py-2.5 px-4 font-normal text-right">Pontuação</th>
                        <th class="py-2.5 px-4 font-normal text-center">Classificação</th>
                      }
                      <th class="py-2.5 px-4 font-normal text-right">Acção</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#F1F1EF]">
                    @for (p of propostas(); track p.id) {
                      <tr class="hover:bg-[#F8F8F6] transition-colors">
                        <td class="py-3 px-4 font-mono text-[12px] text-[#1A1A1A]">{{ p.codigoReferencia }}</td>
                        <td class="py-3 px-4 font-medium text-[#1A1A1A]">{{ p.concorrenteNome }}</td>
                        <td class="py-3 px-4 font-mono text-[12px] text-[#6B6A66]">{{ p.concorrenteNuit }}</td>
                        <td class="py-3 px-4 text-[12px] text-[#6B6A66] tnum">{{ p.dataSubmissao | mzDate:true }}</td>
                        <td class="py-3 px-4">
                          @if (p.selada) {
                            <span class="inline-flex items-center gap-1 text-[11px] font-medium text-[#E8920C] px-2 py-0.5 rounded-full bg-[#FEF3E0]">
                              <span class="mat-icon text-[13px]">lock</span> Selada
                            </span>
                          } @else {
                            <span class="inline-flex items-center gap-1 text-[11px] font-medium text-[#2E9E5B] px-2 py-0.5 rounded-full bg-[#E6F6EC]">
                              <span class="mat-icon text-[13px]">lock_open</span> Deslacrada
                            </span>
                          }
                        </td>
                        <td class="py-3 px-4 text-right font-medium text-[#1A1A1A] tnum">
                          @if (p.selada) {
                            <span class="text-[#8E8D88] italic">Confidencial</span>
                          } @else {
                            {{ p.valorPropostoMZN | mznCurrency }}
                          }
                        </td>
                        @if (c.estado === 'EM_AVALIACAO' || c.estado === 'ADJUDICADO' || c.estado === 'EM_EXECUCAO') {
                          <td class="py-3 px-4 text-right font-medium text-[#1A1A1A] tnum">
                            {{ p.pontuacaoFinal ? p.pontuacaoFinal + ' pts' : '-' }}
                          </td>
                          <td class="py-3 px-4 text-center">
                            @if (p.classificacao) {
                              <span class="px-2 py-0.5 rounded-full text-[11px] font-medium" [class]="p.classificacao === 1 ? 'bg-[#E6F6EC] text-[#2E9E5B]' : 'bg-[#F1F1EF] text-[#6B6A66]'">
                                {{ p.classificacao }}º Lugar
                              </span>
                            } @else {
                              <span class="text-[#8E8D88]">-</span>
                            }
                          </td>
                        }
                        <td class="py-3 px-4 text-right">
                          <a
                            [routerLink]="['/concorrente/comprovativo', p.id]"
                            class="text-[12px] font-medium text-[#3B6FE0] hover:underline"
                          >
                            Recibo SHA
                          </a>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Recurso / Reclamação Section -->
            @if (c.estado === 'EM_AVALIACAO' || c.estado === 'ADJUDICADO') {
              <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-[15px] font-medium text-[#1A1A1A]">Direito de Reclamação e Recurso Hierárquico</h3>
                    <p class="text-[12px] text-[#6B6A66]">
                      Prazo regulamentar de 5 dias úteis para impugnação da deliberação do Júri (Artigo 112 do Dec. 79/2022)
                    </p>
                  </div>
                  @if (auth.hasRole('CONCORRENTE')) {
                    <button
                      type="button"
                      (click)="openModalReclamacao.set(true)"
                      class="h-8 px-3.5 rounded-lg border border-[#E6E5E1] hover:bg-[#F7F7F6] text-[#1A1A1A] text-[12px] font-medium transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
                    >
                      <span class="mat-icon text-[15px] text-[#E8920C]">announcement</span>
                      <span>Submeter Reclamação</span>
                    </button>
                  }
                </div>

                @if (reclamacoes().length > 0) {
                  <div class="space-y-2 pt-2">
                    @for (rec of reclamacoes(); track rec.id) {
                      <div class="p-3 bg-[#FCFCFB] border border-[#E6E5E1] rounded-[8px] text-[12px] space-y-1.5">
                        <div class="flex items-center justify-between font-medium">
                          <span>Reclamação de: {{ rec.concorrenteNome }}</span>
                          <span class="px-2 py-0.5 rounded text-[10px]" [class]="rec.decisao ? 'bg-[#E6F6EC] text-[#2E9E5B]' : 'bg-[#FEF3E0] text-[#E8920C]'">
                            {{ rec.decisao || 'Em Análise' }}
                          </span>
                        </div>
                        <p class="text-[#4A4946]">{{ rec.fundamentacao }}</p>
                        @if (rec.despachoDecisao) {
                          <div class="pt-1 text-[11px] text-[#6B6A66] border-t border-[#EDEDEA]">
                            <strong>Decisão:</strong> {{ rec.despachoDecisao }} (por {{ rec.decididoPorNome }})
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- MODAL 1: Aprovação e Publicação (Gestao) -->
        <app-modal
          [isOpen]="openModalAprovacao()"
          title="Aprovação e Publicação Oficial de Concurso"
          subtitle="Autoridade Competente • Ministério dos Transportes e Logística"
          (closed)="openModalAprovacao.set(false)"
        >
          <div modal-body class="space-y-4">
            <p class="text-[13px] text-[#4A4946] leading-relaxed">
              Confirma a conformidade jurídica do processo <strong>{{ c.numeroProcesso }}</strong> nos termos do Decreto n.º 79/2022? O concurso ficará imediatamente visível no portal público para recepção de propostas.
            </p>
            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">
                Despacho de Aprovação / Autorização *
              </label>
              <textarea
                [value]="despachoAprovacaoTexto()"
                (input)="despachoAprovacaoTexto.set($any($event.target).value)"
                rows="3"
                placeholder="Ex: Autorizo a abertura do procedimento por reunir os pressupostos legais e cabimento orçamental garantido..."
                class="w-full p-2.5 rounded-lg border border-[#E6E5E1] text-[12px] focus:outline-none focus:border-[#1A1A1A]"
              ></textarea>
            </div>
          </div>
          <div modal-footer>
            <button
              type="button"
              (click)="openModalAprovacao.set(false)"
              class="h-9 px-3.5 rounded-lg border border-[#E6E5E1] text-[#6B6A66] text-[13px] font-medium hover:bg-[#F1F1EF] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="confirmarAprovacao(c)"
              class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium cursor-pointer shadow-xs"
            >
              Homologar e Publicar
            </button>
          </div>
        </app-modal>

        <!-- MODAL 2: Homologação de Adjudicação (Gestão) -->
        <app-modal
          [isOpen]="openModalAdjudicacao()"
          title="Despacho de Adjudicação e Emissão de Contrato"
          subtitle="Autoridade Competente • Despacho Homologatório"
          (closed)="openModalAdjudicacao.set(false)"
        >
          <div modal-body class="space-y-4">
            <p class="text-[13px] text-[#4A4946]">
              Seleccione o concorrente vencedor apurado pelo relatório do Júri para homologação final da contratação:
            </p>

            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Concorrente Proposto para Adjudicação *</label>
              <select
                [value]="adjudicatarioSelecionadoId()"
                (change)="adjudicatarioSelecionadoId.set($any($event.target).value)"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] text-[#1A1A1A] focus:outline-none"
              >
                @for (p of propostas(); track p.id) {
                  <option [value]="p.concorrenteId">
                    {{ p.concorrenteNome }} — {{ p.valorPropostoMZN | mznCurrency }}
                  </option>
                }
              </select>
            </div>

            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Despacho Ministerial de Adjudicação *</label>
              <textarea
                [value]="despachoAdjudicacaoTexto()"
                (input)="despachoAdjudicacaoTexto.set($any($event.target).value)"
                rows="3"
                placeholder="Ex: Homologo o Relatório de Avaliação nº 03/JURI/2026 e determino a adjudicação da empreitada..."
                class="w-full p-2.5 rounded-lg border border-[#E6E5E1] text-[12px] focus:outline-none focus:border-[#1A1A1A]"
              ></textarea>
            </div>
          </div>
          <div modal-footer>
            <button
              type="button"
              (click)="openModalAdjudicacao.set(false)"
              class="h-9 px-3.5 rounded-lg border border-[#E6E5E1] text-[#6B6A66] text-[13px] font-medium hover:bg-[#F1F1EF] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="confirmarAdjudicacao(c)"
              class="h-9 px-4 rounded-lg bg-[#2E9E5B] text-white hover:bg-[#25824A] text-[13px] font-medium cursor-pointer shadow-xs"
            >
              Confirmar Adjudicação & Gerar Contrato
            </button>
          </div>
        </app-modal>

        <!-- MODAL 3: Consulta de Ata de Abertura -->
        @if (ataAbertura(); as ata) {
          <app-modal
            [isOpen]="openModalAta()"
            title="Ata de Abertura Pública de Propostas"
            subtitle="Emitida pela Comissão de Júri nos termos do Regulamento de Contratação"
            size="lg"
            (closed)="openModalAta.set(false)"
          >
            <div modal-body class="space-y-4">
              <div class="p-3 bg-[#F7F7F6] rounded-[8px] text-[12px] space-y-1">
                <div><strong>Data e Hora do Ato:</strong> {{ ata.dataAbertura | mzDate:true }}</div>
                <div><strong>Júri Presente:</strong> {{ ata.juriPresentes.join(', ') }}</div>
                <div><strong>Total de Propostas:</strong> {{ ata.totalPropostasRecebidas }}</div>
              </div>

              <div class="space-y-2">
                <h5 class="text-[13px] font-medium text-[#1A1A1A]">Mapa de Propostas Abertas</h5>
                <div class="border border-[#EDEDEA] rounded-[8px] overflow-hidden">
                  <table class="w-full text-left text-[12px]">
                    <thead class="bg-[#F5F5F3] text-[#6B6A66]">
                      <tr>
                        <th class="p-2">Concorrente</th>
                        <th class="p-2">Referência</th>
                        <th class="p-2">Hash SHA-256</th>
                        <th class="p-2 text-right">Valor Ofertado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-[#F1F1EF]">
                      @for (p of ata.propostasResumo; track p.codigoReferencia) {
                        <tr>
                          <td class="p-2 font-medium">{{ p.concorrenteNome }}</td>
                          <td class="p-2 font-mono text-[11px]">{{ p.codigoReferencia }}</td>
                          <td class="p-2 font-mono text-[10px] max-w-[120px] truncate" [title]="p.hashSHA256">{{ p.hashSHA256 }}</td>
                          <td class="p-2 text-right font-medium tnum">{{ p.valorPropostoMZN | mznCurrency }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <p class="text-[12px] text-[#6B6A66] italic">
                {{ ata.observacoesAto }}
              </p>
            </div>
            <div modal-footer>
              <button
                type="button"
                (click)="openModalAta.set(false)"
                class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white text-[13px] font-medium cursor-pointer"
              >
                Fechar Ata
              </button>
            </div>
          </app-modal>
        }

        <!-- MODAL 4: Submeter Reclamação -->
        <app-modal
          [isOpen]="openModalReclamacao()"
          title="Submissão de Reclamação / Recurso Administrativo"
          subtitle="Ao abrigo do Artigo 112 do Decreto 79/2022"
          (closed)="openModalReclamacao.set(false)"
        >
          <div modal-body class="space-y-3">
            <p class="text-[12px] text-[#6B6A66]">
              Apresente os fundamentos de facto e de direito da sua reclamação dirigida à Autoridade Competente do MTL.
            </p>
            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Fundamentação *</label>
              <textarea
                [value]="reclamacaoTexto()"
                (input)="reclamacaoTexto.set($any($event.target).value)"
                rows="4"
                placeholder="Exponha com clareza os pontos controvertidos..."
                class="w-full p-2.5 rounded-lg border border-[#E6E5E1] text-[12px] focus:outline-none focus:border-[#1A1A1A]"
              ></textarea>
            </div>
          </div>
          <div modal-footer>
            <button
              type="button"
              (click)="openModalReclamacao.set(false)"
              class="h-9 px-3 rounded-lg border border-[#E6E5E1] text-[12px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              [disabled]="!reclamacaoTexto().trim()"
              (click)="submeterReclamacao(c)"
              class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white text-[12px] font-medium cursor-pointer disabled:bg-[#EDEDEA] disabled:text-[#B8B7B1]"
            >
              Submeter Reclamação
            </button>
          </div>
        </app-modal>
      </div>
    }
  `
})
export class ConcursoDetailComponent {
  private store = inject(LocalDataStoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private audit = inject(AuditService);
  auth = inject(AuthService);

  concursoId = signal<string>('');
  activeTab = signal<'visao-geral' | 'documentos' | 'esclarecimentos' | 'propostas'>('visao-geral');

  openModalAprovacao = signal(false);
  openModalAdjudicacao = signal(false);
  openModalAta = signal(false);
  openModalReclamacao = signal(false);

  despachoAprovacaoTexto = signal('Autorizo e homologo a publicação oficial do presente concurso público nos termos do Decreto 79/2022.');
  despachoAdjudicacaoTexto = signal('Homologo o Relatório Final da Comissão de Júri e determino a adjudicação da empreitada com celebração de contrato de obras públicas.');
  adjudicatarioSelecionadoId = signal('');
  reclamacaoTexto = signal('');
  novoEsclarecimentoTexto = signal('');

  onNovoEsclarecimentoInput(e: Event): void {
    this.novoEsclarecimentoTexto.set((e.target as HTMLTextAreaElement).value);
  }

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.concursoId.set(id);
      }
    });
  }

  concurso = computed(() => {
    const id = this.concursoId();
    return this.store.concursos().find(c => c.id === id) || null;
  });

  modalidadeInfo = computed(() => {
    const c = this.concurso();
    return c ? MODALIDADES_DECRETO_79_2022[c.modalidadeId] : null;
  });

  trocoAssociado = computed(() => {
    const c = this.concurso();
    if (!c?.trocoEstradaId) return null;
    return this.store.getTrocoEstradaById(c.trocoEstradaId);
  });

  contratoAssociado = computed(() => {
    const c = this.concurso();
    if (!c) return null;
    return this.store.getContratoByConcursoId(c.id);
  });

  propostas = computed(() => {
    const c = this.concurso();
    if (!c) return [];
    // If user is competitor, only show their own proposal unmasked, others masked.
    // If deadline passed & ato de abertura performed, proposals are unsealed.
    const isJuriOrGestao = this.auth.hasRole('TECNICO', 'GESTAO', 'ADMIN');
    return this.store.getPropostasPorConcurso(c.id, isJuriOrGestao && c.estado !== 'PUBLICADO');
  });

  minhaProposta = computed(() => {
    const user = this.auth.currentUser();
    const c = this.concurso();
    if (!user || !c) return null;
    return this.store.getPropostasPorConcorrente(user.id).find(p => p.concursoId === c.id) || null;
  });

  esclarecimentos = computed(() => {
    const c = this.concurso();
    if (!c) return [];
    return this.store.getEsclarecimentos(c.id);
  });

  ataAbertura = computed(() => {
    const c = this.concurso();
    if (!c) return null;
    return this.store.getAtaAbertura(c.id);
  });

  reclamacoes = computed(() => {
    const c = this.concurso();
    if (!c) return [];
    return this.store.getReclamacoes(c.id);
  });

  isDeadlineOpen = computed(() => {
    const c = this.concurso();
    if (!c) return false;
    return new Date(c.prazoSubmissao).getTime() > Date.now();
  });

  async enviarParaAprovacao(c: Concurso): Promise<void> {
    this.store.updateConcurso(c.id, { estado: 'PENDENTE_APROVACAO' });
    await this.audit.log(
      this.auth.currentUser(),
      'SUBMISSAO_APROVACAO',
      'CONCURSO',
      `Concurso ${c.numeroProcesso} submetido para aprovação da Autoridade Competente`,
      c.id
    );
    this.notification.success('Procedimento submetido à Gestão para aprovação e publicação.', 'Submetido');
  }

  async confirmarAprovacao(c: Concurso): Promise<void> {
    const agora = new Date().toISOString();
    this.store.updateConcurso(c.id, {
      estado: 'PUBLICADO',
      dataPublicacao: agora,
      despachoAprovacao: this.despachoAprovacaoTexto()
    });

    await this.audit.log(
      this.auth.currentUser(),
      'APROVACAO_E_PUBLICACAO',
      'CONCURSO',
      `Homologação e publicação do concurso ${c.numeroProcesso}. Despacho: ${this.despachoAprovacaoTexto()}`,
      c.id
    );

    this.openModalAprovacao.set(false);
    this.notification.success('Concurso aprovado e publicado oficialmente no portal!', 'Publicação Concluída');
  }

  simularFimPrazo(concursoId: string): void {
    this.store.simularFimPrazo(concursoId);
    this.notification.info('Prazo de submissão encerrado para a hora actual.', 'Modo Demo Activo');
  }

  async realizarAtoAbertura(c: Concurso): Promise<void> {
    // Unseal proposals
    const propostasAll = this.store.getPropostasPorConcurso(c.id, true);
    for (const p of propostasAll) {
      this.store.updateProposta(p.id, { selada: false });
    }

    // Generate Ata de Abertura
    const ata: AtaAbertura = {
      id: 'ata-' + Math.random().toString(36).substring(2, 9),
      concursoId: c.id,
      dataAbertura: new Date().toISOString(),
      juriPresentes: ['Eng. Sérgio Macuácua (Presidente do Júri)', 'Dr. Salvador Matsinhe (Vogal)'],
      totalPropostasRecebidas: propostasAll.length,
      propostasResumo: propostasAll.map(p => ({
        concorrenteNome: p.concorrenteNome,
        concorrenteNuit: p.concorrenteNuit,
        codigoReferencia: p.codigoReferencia,
        dataSubmissao: p.dataSubmissao,
        hashSHA256: p.hashSHA256,
        valorPropostoMZN: p.valorPropostoMZN,
        seloIntegro: true
      })),
      observacoesAto: 'Ato público solene de abertura das propostas realizado pelo Júri. Todos os selos SHA-256 foram validados sem qualquer quebra de integridade.',
      geradaEm: new Date().toISOString()
    };
    this.store.saveAtaAbertura(ata);

    // Transition contest to EM_AVALIACAO
    this.store.updateConcurso(c.id, { estado: 'EM_AVALIACAO' });

    await this.audit.log(
      this.auth.currentUser(),
      'ATO_ABERTURA_JURI',
      'JURI',
      `Sessão pública de deslacragem e abertura de ${propostasAll.length} propostas no concurso ${c.numeroProcesso}`,
      c.id
    );

    this.notification.success('Ato de abertura concluído com sucesso e ata gerada!', 'Propostas Deslacradas');
    this.activeTab.set('propostas');
  }

  async confirmarAdjudicacao(c: Concurso): Promise<void> {
    const propostas = this.store.getPropostasPorConcurso(c.id, true);
    const selId = this.adjudicatarioSelecionadoId();
    const vencedor = propostas.find(p => p.concorrenteId === selId) || propostas[0];
    if (!vencedor) {
      this.notification.error('Nenhum concorrente seleccionado.', 'Erro');
      return;
    }

    const valorAdjudicado = vencedor.valorPropostoMZN || c.valorEstimadoMZN;
    const agora = new Date().toISOString();

    // Update contest to ADJUDICADO
    this.store.updateConcurso(c.id, {
      estado: 'ADJUDICADO',
      vencedorAdjudicadoId: vencedor.concorrenteId,
      vencedorAdjudicadoNome: vencedor.concorrenteNome,
      valorAdjudicadoMZN: valorAdjudicado,
      dataAdjudicacao: agora,
      despachoAdjudicacao: this.despachoAdjudicacaoTexto()
    });

    // Generate formal Contrato automatically
    const novoContrato: Contrato = {
      id: 'ct-' + Math.random().toString(36).substring(2, 9),
      concursoId: c.id,
      numeroContrato: `CT-MTL/DNEP/2026/0${Math.floor(Math.random() * 50 + 10)}`,
      objecto: c.titulo,
      adjudicatarioId: vencedor.concorrenteId,
      adjudicatarioNome: vencedor.concorrenteNome,
      adjudicatarioNuit: vencedor.concorrenteNuit,
      valorInicialMZN: valorAdjudicado,
      valorAtualizadoMZN: valorAdjudicado,
      dataAssinatura: agora,
      prazoMeses: vencedor.prazoExecucaoMeses || 12,
      dataFimPrevista: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      gestorContratoNome: 'Dra. Maria Helena Mabote',
      fiscalObraNome: 'Eng. Sérgio Macuácua',
      vistoTribunalAdministrativo: 'PENDENTE',
      trocoEstradaId: c.trocoEstradaId,
      checklistHabilitacao: {
        certidaoQuitacaoFiscal: true,
        certidaoQuitacaoINSS: true,
        garantiaDefinitivaBancaria: false,
        alvaraConstrucaoValido: true,
        certidaoRegistoComercial: true
      },
      estado: 'VIGENTE'
    };
    this.store.saveContrato(novoContrato);

    await this.audit.log(
      this.auth.currentUser(),
      'ADJUDICACAO_E_CONTRATO',
      'CONTRATO',
      `Adjudicação do concurso ${c.numeroProcesso} a ${vencedor.concorrenteNome} e emissão do contrato ${novoContrato.numeroContrato} no valor de MZN ${valorAdjudicado}`,
      novoContrato.id
    );

    this.openModalAdjudicacao.set(false);
    this.notification.success(`Adjudicado a ${vencedor.concorrenteNome}! Contrato formal gerado.`, 'Adjudicação Concluída');
  }

  async enviarPerguntaEsclarecimento(c: Concurso): Promise<void> {
    if (!this.novoEsclarecimentoTexto().trim()) return;
    const user = this.auth.currentUser();

    const novo = {
      id: 'escl-' + Math.random().toString(36).substring(2, 9),
      concursoId: c.id,
      autorId: user?.id || 'concorrente',
      autorNome: user?.companyName || user?.name || 'Concorrente',
      autorNuit: user?.nuit,
      dataPergunta: new Date().toISOString(),
      pergunta: this.novoEsclarecimentoTexto().trim(),
      publicado: false
    };

    this.store.saveEsclarecimento(novo);
    this.novoEsclarecimentoTexto.set('');

    await this.audit.log(
      user,
      'PEDIDO_ESCLARECIMENTO',
      'CONCURSO',
      `Pedido de esclarecimento formulado no concurso ${c.numeroProcesso}`,
      c.id
    );

    this.notification.success('Pergunta submetida à UGEA com sucesso.', 'Esclarecimento Enviado');
  }

  async responderPergunta(id: string, resposta: string): Promise<void> {
    if (!resposta.trim()) return;
    const user = this.auth.currentUser();
    this.store.responderEsclarecimento(id, resposta.trim(), user?.name || 'Eng. Sérgio Macuácua (UGEA)');

    await this.audit.log(
      user,
      'RESPOSTA_ESCLARECIMENTO',
      'CONCURSO',
      `Resposta oficial de esclarecimento publicada no concurso`,
      id
    );

    this.notification.success('Resposta oficial publicada para todos os concorrentes.', 'Publicado');
  }

  async submeterReclamacao(c: Concurso): Promise<void> {
    const user = this.auth.currentUser();
    this.store.saveReclamacao({
      id: 'rec-' + Math.random().toString(36).substring(2, 9),
      concursoId: c.id,
      concorrenteId: user?.id || 'concorrente',
      concorrenteNome: user?.companyName || user?.name || 'Concorrente',
      concorrenteNuit: user?.nuit || '400000000',
      dataSubmissao: new Date().toISOString(),
      tipo: 'RECLAMACAO',
      fundamentacao: this.reclamacaoTexto().trim()
    });

    await this.audit.log(
      user,
      'SUBMISSAO_RECLAMACAO',
      'CONCURSO',
      `Reclamação administrativa interposta contra deliberação no concurso ${c.numeroProcesso}`,
      c.id
    );

    this.openModalReclamacao.set(false);
    this.reclamacaoTexto.set('');
    this.notification.success('Reclamação formal submetida à apreciação da Autoridade Competente.', 'Reclamação Registada');
  }

  downloadSimulado(nome: string): void {
    this.notification.info(`Transferência do ficheiro "${nome}" iniciada com sucesso.`, 'Download Concluído');
  }
}
