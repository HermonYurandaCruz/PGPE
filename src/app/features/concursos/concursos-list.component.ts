import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { AuthService } from '../../core/services/auth.service';
import { AppStatusBadge } from '../../shared/ui/status-badge.component';
import { AppTabsPill, TabPillItem } from '../../shared/ui/tabs-pill.component';
import { AppCountdown } from '../../shared/ui/countdown.component';
import { AppEmptyState } from '../../shared/ui/empty-state.component';
import { MznCurrencyPipe, MzDatePipe } from '../../shared/pipes/format.pipes';
import { EstadoConcurso, ProvinciaMZ } from '../../shared/models/concurso.models';
import { ModalidadeId, MODALIDADES_DECRETO_79_2022 } from '../../shared/models/modalidades.models';

@Component({
  selector: 'app-concursos-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AppStatusBadge,
    AppTabsPill,
    AppCountdown,
    AppEmptyState,
    MznCurrencyPipe,
    MzDatePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="text-[12px] text-[#8E8D88] font-normal mb-1">
            Contratação Pública • Decreto 79/2022
          </div>
          <h1 class="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
            Procedimentos e Concursos Electrónicos
          </h1>
          <p class="text-[13px] text-[#6B6A66] mt-0.5">
            Gestão transparente de concursos, propostas seladas e adjudicações do MTL
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            (click)="exportarCSV()"
            class="h-9 px-3.5 rounded-lg border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <span class="mat-icon text-[16px]">file_download</span>
            <span>Exportar CSV</span>
          </button>

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

      <!-- Main Container with Filters and Table -->
      <div class="bg-white border border-[#E6E5E1] rounded-[12px] p-5 shadow-xs space-y-4">
        <!-- Toolbar: Tabs Pill + Filters -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <app-tabs-pill
            [tabs]="statusTabs()"
            [activeTab]="activeStatusFilter()"
            (tabSelected)="activeStatusFilter.set($event)"
          />

          <!-- Search & Select Filters -->
          <div class="flex flex-wrap items-center gap-2.5">
            <div class="relative w-full sm:w-60">
              <input
                type="text"
                [value]="searchText()"
                (input)="onSearchInput($event)"
                placeholder="Pesquisar concurso..."
                class="w-full h-8 pl-8 pr-3 rounded-full bg-[#F7F7F6] border border-[#E6E5E1] text-[12px] text-[#1A1A1A] placeholder-[#8E8D88] focus:bg-white focus:border-[#1A1A1A] focus:outline-none transition-all"
              />
              <span class="mat-icon text-[16px] text-[#8E8D88] absolute left-2.5 top-2 pointer-events-none">search</span>
            </div>

            <!-- Modality Filter -->
            <select
              [value]="selectedModality()"
              (change)="onModalityChange($event)"
              class="h-8 px-2.5 rounded-lg border border-[#E6E5E1] bg-white text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] cursor-pointer"
            >
              <option value="TODAS">Todas as Modalidades</option>
              @for (mod of modalidadesList; track mod.id) {
                <option [value]="mod.id">{{ mod.codigo }} - {{ mod.nome }}</option>
              }
            </select>

            <!-- Province Filter -->
            <select
              [value]="selectedProvince()"
              (change)="onProvinceChange($event)"
              class="h-8 px-2.5 rounded-lg border border-[#E6E5E1] bg-white text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] cursor-pointer"
            >
              <option value="TODAS">Todas as Províncias</option>
              @for (p of provinciasList; track p) {
                <option [value]="p">{{ p }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Table View -->
        @if (filteredConcursos().length > 0) {
          <div class="overflow-x-auto rounded-[10px] border border-[#EDEDEA]">
            <table class="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr class="bg-[#F5F5F3] border-b border-[#EDEDEA] text-[#6B6A66] text-[12px]">
                  <th class="py-2.5 px-4 font-normal">Nº Processo</th>
                  <th class="py-2.5 px-4 font-normal">Objecto / Título</th>
                  <th class="py-2.5 px-4 font-normal">Modalidade</th>
                  <th class="py-2.5 px-4 font-normal">Província</th>
                  <th class="py-2.5 px-4 font-normal text-right">Valor Estimado</th>
                  <th class="py-2.5 px-4 font-normal">Estado</th>
                  <th class="py-2.5 px-4 font-normal">Prazo Propostas</th>
                  <th class="py-2.5 px-4 font-normal text-right">Acções</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F1F1EF]">
                @for (c of filteredConcursos(); track c.id) {
                  <tr class="hover:bg-[#F8F8F6] transition-colors cursor-pointer group" [routerLink]="['/concursos', c.id]">
                    <td class="py-3 px-4 font-mono text-[12px] text-[#1A1A1A] whitespace-nowrap">
                      {{ c.numeroProcesso }}
                    </td>
                    <td class="py-3 px-4 max-w-[300px]">
                      <div class="font-medium text-[#1A1A1A] truncate group-hover:underline">
                        {{ c.titulo }}
                      </div>
                      <div class="text-[11px] text-[#8E8D88] truncate mt-0.5">
                        {{ c.objecto }}
                      </div>
                    </td>
                    <td class="py-3 px-4 text-[#6B6A66] text-[12px] whitespace-nowrap">
                      <span class="px-2 py-0.5 rounded bg-[#F1F1EF] text-[#4A4946] font-mono text-[11px]">
                        {{ getModalidadeCodigo(c.modalidadeId) }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-[#6B6A66] whitespace-nowrap">{{ c.provincia }}</td>
                    <td class="py-3 px-4 text-right font-medium text-[#1A1A1A] tnum whitespace-nowrap">
                      {{ c.valorEstimadoMZN | mznCurrency }}
                    </td>
                    <td class="py-3 px-4 whitespace-nowrap">
                      <app-status-badge [estado]="c.estado" mode="badge" />
                    </td>
                    <td class="py-3 px-4 whitespace-nowrap">
                      @if (c.estado === 'PUBLICADO') {
                        <app-countdown [targetDate]="c.prazoSubmissao" />
                      } @else {
                        <span class="text-[12px] text-[#8E8D88] tnum">{{ c.prazoSubmissao | mzDate }}</span>
                      }
                    </td>
                    <td class="py-3 px-4 text-right whitespace-nowrap" (click)="$event.stopPropagation()">
                      <div class="flex items-center justify-end gap-1.5">
                        <a
                          [routerLink]="['/concursos', c.id]"
                          class="h-7 px-2.5 rounded-md bg-[#F1F1EF] hover:bg-[#E6E5E1] text-[#1A1A1A] text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <span>Abrir</span>
                        </a>

                        @if (auth.hasRole('CONCORRENTE') && c.estado === 'PUBLICADO') {
                          <a
                            [routerLink]="['/concorrente/submeter', c.id]"
                            class="h-7 px-2.5 rounded-md bg-[#1A1A1A] hover:bg-[#2B2A28] text-white text-[11px] font-medium transition-colors inline-flex items-center gap-1 shadow-xs"
                          >
                            <span class="mat-icon text-[13px]">lock</span>
                            <span>Submeter</span>
                          </a>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="text-[12px] text-[#8E8D88] flex items-center justify-between pt-1">
            <span>A mostrar {{ filteredConcursos().length }} procedimentos</span>
            <span>Moeda: Metical Moçambicano (MZN)</span>
          </div>
        } @else {
          <app-empty-state
            icon="gavel"
            title="Nenhum concurso encontrado"
            description="Não existem procedimentos de contratação que correspondam aos filtros seleccionados."
            actionLabel="Limpar Filtros"
            (actionClicked)="limparFiltros()"
          />
        }
      </div>
    </div>
  `
})
export class ConcursosListComponent {
  private store = inject(LocalDataStoreService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  modalidadesList = Object.values(MODALIDADES_DECRETO_79_2022);
  provinciasList: ProvinciaMZ[] = [
    'Maputo Cidade',
    'Maputo Província',
    'Gaza',
    'Inhambane',
    'Sofala',
    'Manica',
    'Tete',
    'Zambézia',
    'Nampula',
    'Niassa',
    'Cabo Delgado'
  ];

  activeStatusFilter = signal<string>('TODOS');
  searchText = signal<string>('');
  selectedModality = signal<string>('TODAS');
  selectedProvince = signal<string>('TODAS');

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchText.set(params['q']);
      }
      if (params['estado']) {
        this.activeStatusFilter.set(params['estado']);
      }
    });
  }

  statusTabs = computed<TabPillItem[]>(() => {
    const list = this.store.concursos();
    return [
      { id: 'TODOS', label: 'Todos', count: list.length },
      { id: 'PUBLICADO', label: 'Publicados', count: list.filter(c => c.estado === 'PUBLICADO').length },
      { id: 'EM_AVALIACAO', label: 'Em Avaliação', count: list.filter(c => c.estado === 'EM_AVALIACAO').length },
      { id: 'ADJUDICADO', label: 'Adjudicados', count: list.filter(c => c.estado === 'ADJUDICADO').length },
      { id: 'EM_EXECUCAO', label: 'Em Execução', count: list.filter(c => c.estado === 'EM_EXECUCAO').length },
      { id: 'RASCUNHO', label: 'Rascunhos', count: list.filter(c => c.estado === 'RASCUNHO').length }
    ];
  });

  filteredConcursos = computed(() => {
    let list = this.store.concursos();
    const status = this.activeStatusFilter();
    if (status !== 'TODOS') {
      list = list.filter(c => c.estado === status);
    }
    const q = this.searchText().toLowerCase().trim();
    if (q) {
      list = list.filter(c =>
        c.titulo.toLowerCase().includes(q) ||
        c.numeroProcesso.toLowerCase().includes(q) ||
        c.objecto.toLowerCase().includes(q) ||
        c.provincia.toLowerCase().includes(q)
      );
    }
    const mod = this.selectedModality();
    if (mod !== 'TODAS') {
      list = list.filter(c => c.modalidadeId === mod);
    }
    const prov = this.selectedProvince();
    if (prov !== 'TODAS') {
      list = list.filter(c => c.provincia === prov);
    }
    return list;
  });

  getModalidadeCodigo(modId: ModalidadeId): string {
    return MODALIDADES_DECRETO_79_2022[modId]?.codigo || modId;
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchText.set(val);
  }

  onModalityChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedModality.set(val);
  }

  onProvinceChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedProvince.set(val);
  }

  limparFiltros(): void {
    this.activeStatusFilter.set('TODOS');
    this.searchText.set('');
    this.selectedModality.set('TODAS');
    this.selectedProvince.set('TODAS');
  }

  exportarCSV(): void {
    const data = this.filteredConcursos();
    const headers = ['Nº Processo', 'Título', 'Modalidade', 'Província', 'Valor Estimado (MZN)', 'Estado', 'Prazo Submissão'];
    const rows = data.map(c => [
      `"${c.numeroProcesso}"`,
      `"${c.titulo.replace(/"/g, '""')}"`,
      `"${c.modalidadeId}"`,
      `"${c.provincia}"`,
      c.valorEstimadoMZN,
      `"${c.estado}"`,
      `"${c.prazoSubmissao}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `concursos_mtl_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
