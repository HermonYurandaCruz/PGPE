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
import { AppStatusBadge } from '../../shared/ui/status-badge.component';
import { AppProgressBar } from '../../shared/ui/progress-bar.component';
import { AppTabsPill, TabPillItem } from '../../shared/ui/tabs-pill.component';
import { AppEmptyState } from '../../shared/ui/empty-state.component';
import { MzDatePipe, MznCurrencyPipe } from '../../shared/pipes/format.pipes';

@Component({
  selector: 'app-contratos-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AppStatusBadge,
    AppProgressBar,
    AppTabsPill,
    AppEmptyState,
    MznCurrencyPipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="text-[12px] text-[#8E8D88] font-normal mb-1">
            Gestão Contratual • Fiscalização de Obras Públicas
          </div>
          <h1 class="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
            Contratos de Empreitadas e Fiscalização
          </h1>
          <p class="text-[13px] text-[#6B6A66] mt-0.5">
            Acompanhamento de autos de medição, pagamentos, vistos do Tribunal Administrativo e adendas
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            (click)="exportarCSV()"
            class="h-9 px-3.5 rounded-lg border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span class="mat-icon text-[16px]">file_download</span>
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <!-- Main Container with Filters & Table -->
      <div class="bg-white border border-[#E6E5E1] rounded-[12px] p-5 shadow-xs space-y-4">
        <!-- Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <app-tabs-pill
            [tabs]="statusTabs()"
            [activeTab]="activeStatusFilter()"
            (tabSelected)="activeStatusFilter.set($event)"
          />

          <div class="relative w-full sm:w-64">
            <input
              type="text"
              [value]="searchText()"
              (input)="onSearchInput($event)"
              placeholder="Pesquisar contrato ou empreiteiro..."
              class="w-full h-8 pl-8 pr-3 rounded-full bg-[#F7F7F6] border border-[#E6E5E1] text-[12px] text-[#1A1A1A] placeholder-[#8E8D88] focus:bg-white focus:border-[#1A1A1A] focus:outline-none transition-all"
            />
            <span class="mat-icon text-[16px] text-[#8E8D88] absolute left-2.5 top-2 pointer-events-none">search</span>
          </div>
        </div>

        <!-- Table View -->
        @if (filteredContratos().length > 0) {
          <div class="overflow-x-auto rounded-[10px] border border-[#EDEDEA]">
            <table class="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr class="bg-[#F5F5F3] border-b border-[#EDEDEA] text-[#6B6A66] text-[12px]">
                  <th class="py-2.5 px-4 font-normal">Nº Contrato</th>
                  <th class="py-2.5 px-4 font-normal">Objecto da Empreitada</th>
                  <th class="py-2.5 px-4 font-normal">Adjudicatário / Empreiteiro</th>
                  <th class="py-2.5 px-4 font-normal text-right">Valor Atualizado</th>
                  <th class="py-2.5 px-4 font-normal">Visto TA</th>
                  <th class="py-2.5 px-4 font-normal">Estado</th>
                  <th class="py-2.5 px-4 font-normal">Execução Física</th>
                  <th class="py-2.5 px-4 font-normal text-right">Acção</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F1F1EF]">
                @for (ct of filteredContratos(); track ct.id) {
                  <tr class="hover:bg-[#F8F8F6] transition-colors cursor-pointer group" [routerLink]="['/contratos', ct.id]">
                    <td class="py-3 px-4 font-mono text-[12px] text-[#1A1A1A] whitespace-nowrap">
                      {{ ct.numeroContrato }}
                    </td>
                    <td class="py-3 px-4 max-w-[280px]">
                      <div class="font-medium text-[#1A1A1A] truncate group-hover:underline">
                        {{ ct.objecto }}
                      </div>
                      <div class="text-[11px] text-[#8E8D88]">
                        Gestor: {{ ct.gestorContratoNome }} • Fiscal: {{ ct.fiscalObraNome }}
                      </div>
                    </td>
                    <td class="py-3 px-4 text-[#6B6A66] whitespace-nowrap">
                      {{ ct.adjudicatarioNome }}
                    </td>
                    <td class="py-3 px-4 text-right font-medium text-[#1A1A1A] tnum whitespace-nowrap">
                      {{ ct.valorAtualizadoMZN | mznCurrency }}
                    </td>
                    <td class="py-3 px-4 whitespace-nowrap">
                      <app-status-badge [estado]="ct.vistoTribunalAdministrativo" mode="badge" />
                    </td>
                    <td class="py-3 px-4 whitespace-nowrap">
                      <app-status-badge [estado]="ct.estado" mode="badge" />
                    </td>
                    <td class="py-3 px-4 whitespace-nowrap">
                      <app-progress-bar [value]="getProgressoFisico(ct.id)" />
                    </td>
                    <td class="py-3 px-4 text-right whitespace-nowrap">
                      <a
                        [routerLink]="['/contratos', ct.id]"
                        class="h-7 px-3 rounded-md bg-[#F1F1EF] hover:bg-[#E6E5E1] text-[#1A1A1A] text-[11px] font-medium transition-colors inline-flex items-center gap-1 shadow-xs"
                      >
                        <span>Gerir</span>
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <app-empty-state
            icon="description"
            title="Nenhum contrato encontrado"
            description="Não existem contratos activos que correspondam aos filtros de pesquisa."
            actionLabel="Limpar Pesquisa"
            (actionClicked)="limpar()"
          />
        }
      </div>
    </div>
  `
})
export class ContratosListComponent {
  private store = inject(LocalDataStoreService);
  auth = inject(AuthService);

  activeStatusFilter = signal<string>('TODOS');
  searchText = signal<string>('');

  statusTabs = computed<TabPillItem[]>(() => {
    const list = this.store.contratos();
    return [
      { id: 'TODOS', label: 'Todos', count: list.length },
      { id: 'VIGENTE', label: 'Vigentes', count: list.filter(c => c.estado === 'VIGENTE').length },
      { id: 'CONCLUIDO', label: 'Concluídos', count: list.filter(c => c.estado === 'CONCLUIDO').length },
      { id: 'SUSPENSO', label: 'Suspensos', count: list.filter(c => c.estado === 'SUSPENSO').length }
    ];
  });

  filteredContratos = computed(() => {
    let list = this.store.contratos();
    const st = this.activeStatusFilter();
    if (st !== 'TODOS') {
      list = list.filter(c => c.estado === st);
    }
    const q = this.searchText().toLowerCase().trim();
    if (q) {
      list = list.filter(c =>
        c.numeroContrato.toLowerCase().includes(q) ||
        c.objecto.toLowerCase().includes(q) ||
        c.adjudicatarioNome.toLowerCase().includes(q)
      );
    }
    return list;
  });

  getProgressoFisico(contratoId: string): number {
    const medicoes = this.store.getMedicoes(contratoId);
    if (medicoes.length === 0) return 0;
    return medicoes[medicoes.length - 1].percentualFisicoAcumulado;
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchText.set(val);
  }

  limpar(): void {
    this.activeStatusFilter.set('TODOS');
    this.searchText.set('');
  }

  exportarCSV(): void {
    const data = this.filteredContratos();
    const headers = ['Nº Contrato', 'Objecto', 'Adjudicatário', 'Valor Atualizado (MZN)', 'Visto TA', 'Estado'];
    const rows = data.map(c => [
      `"${c.numeroContrato}"`,
      `"${c.objecto.replace(/"/g, '""')}"`,
      `"${c.adjudicatarioNome}"`,
      c.valorAtualizadoMZN,
      `"${c.vistoTribunalAdministrativo}"`,
      `"${c.estado}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `contratos_mtl_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
