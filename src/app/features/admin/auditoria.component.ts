import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { MzDatePipe } from '../../shared/pipes/format.pipes';

@Component({
  selector: 'app-admin-auditoria',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MzDatePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="text-[12px] text-[#8E8D88] font-normal mb-1">
            Conformidade e Transparência • Registo Imutável
          </div>
          <h1 class="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
            Pista Oficial de Auditoria do Sistema
          </h1>
          <p class="text-[13px] text-[#6B6A66] mt-0.5">
            Registo exaustivo e rastreável de todas as acções, submissões seladas, despachos e alterações contratuais
          </p>
        </div>

        <button
          type="button"
          (click)="exportarAuditoriaCSV()"
          class="h-9 px-3.5 rounded-lg border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#1A1A1A] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span class="mat-icon text-[16px]">file_download</span>
          <span>Exportar Registo CSV</span>
        </button>
      </div>

      <!-- Filter bar -->
      <div class="bg-white border border-[#E6E5E1] rounded-[12px] p-5 shadow-xs space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[240px]">
            <input
              type="text"
              [value]="filtroTexto()"
              (input)="onSearchInput($event)"
              placeholder="Pesquisar nos registos de auditoria (utilizador, acção, processo)..."
              class="w-full h-9 pl-9 pr-3 rounded-lg bg-[#F7F7F6] border border-[#E6E5E1] text-[12px] text-[#1A1A1A] placeholder-[#8E8D88] focus:bg-white focus:border-[#1A1A1A] focus:outline-none"
            />
            <span class="mat-icon text-[16px] text-[#8E8D88] absolute left-3 top-2.5 pointer-events-none">search</span>
          </div>

          <select
            [value]="filtroEntidade()"
            (change)="onEntidadeChange($event)"
            class="h-9 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[12px] text-[#1A1A1A] focus:outline-none"
          >
            <option value="TODAS">Todas as Entidades</option>
            <option value="CONCURSO">Concursos</option>
            <option value="PROPOSTA">Propostas</option>
            <option value="JURI">Júri</option>
            <option value="CONTRATO">Contratos</option>
            <option value="MEDICAO">Medições</option>
            <option value="PAGAMENTO">Pagamentos</option>
            <option value="UTILIZADOR">Utilizadores</option>
            <option value="DEMO">Modo Demo</option>
          </select>
        </div>

        <!-- Logs Table -->
        <div class="overflow-x-auto rounded-[10px] border border-[#EDEDEA]">
          <table class="w-full text-left border-collapse text-[13px]">
            <thead class="bg-[#F5F5F3] border-b border-[#EDEDEA] text-[#6B6A66] text-[12px]">
              <tr>
                <th class="py-2.5 px-4 font-normal">Data e Hora</th>
                <th class="py-2.5 px-4 font-normal">Utilizador / Perfil</th>
                <th class="py-2.5 px-4 font-normal">Acção Executada</th>
                <th class="py-2.5 px-4 font-normal">Entidade</th>
                <th class="py-2.5 px-4 font-normal">Detalhes do Evento</th>
                <th class="py-2.5 px-4 font-normal">IP Origem</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F1EF]">
              @for (log of filteredLogs(); track log.id) {
                <tr class="hover:bg-[#F8F8F6] transition-colors">
                  <td class="py-3 px-4 text-[12px] font-mono text-[#6B6A66] whitespace-nowrap tnum">
                    {{ log.timestamp | mzDate:true }}
                  </td>
                  <td class="py-3 px-4 whitespace-nowrap">
                    <div class="font-medium text-[#1A1A1A]">{{ log.usuarioNome }}</div>
                    <div class="text-[11px] text-[#8E8D88]">{{ log.perfil }}</div>
                  </td>
                  <td class="py-3 px-4 font-mono text-[11px] text-[#1A1A1A] whitespace-nowrap">
                    {{ log.acao }}
                  </td>
                  <td class="py-3 px-4 whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F1F1EF] text-[#4A4946]">
                      {{ log.entidade }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-[12px] text-[#4A4946] max-w-[420px]">
                    {{ log.detalhes }}
                  </td>
                  <td class="py-3 px-4 text-[11px] font-mono text-[#8E8D88] whitespace-nowrap">
                    {{ log.ipOrigem || '102.217.112.45' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="text-[12px] text-[#8E8D88] pt-1">
          A mostrar {{ filteredLogs().length }} eventos de auditoria registados
        </div>
      </div>
    </div>
  `
})
export class AdminAuditoriaComponent {
  private store = inject(LocalDataStoreService);

  filtroTexto = signal('');
  filtroEntidade = signal('TODAS');

  filteredLogs = computed(() => {
    let logs = this.store.auditoria();
    const ent = this.filtroEntidade();
    if (ent !== 'TODAS') {
      logs = logs.filter(l => l.entidade === ent);
    }
    const q = this.filtroTexto().toLowerCase().trim();
    if (q) {
      logs = logs.filter(l =>
        l.detalhes.toLowerCase().includes(q) ||
        l.usuarioNome.toLowerCase().includes(q) ||
        l.acao.toLowerCase().includes(q)
      );
    }
    return logs;
  });

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.filtroTexto.set(val);
  }

  onEntidadeChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.filtroEntidade.set(val);
  }

  exportarAuditoriaCSV(): void {
    const data = this.filteredLogs();
    const headers = ['Timestamp', 'Utilizador', 'Perfil', 'Acção', 'Entidade', 'Detalhes', 'IP'];
    const rows = data.map(l => [
      `"${l.timestamp}"`,
      `"${l.usuarioNome}"`,
      `"${l.perfil}"`,
      `"${l.acao}"`,
      `"${l.entidade}"`,
      `"${l.detalhes.replace(/"/g, '""')}"`,
      `"${l.ipOrigem || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_mtl_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
