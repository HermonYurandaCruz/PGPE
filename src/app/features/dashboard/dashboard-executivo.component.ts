import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject
} from '@angular/core';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { AppStatCard } from '../../shared/ui/stat-card.component';
import { ModalidadeId, MODALIDADES_DECRETO_79_2022 } from '../../shared/models/modalidades.models';

@Component({
  selector: 'app-dashboard-executivo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppStatCard],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="text-[12px] text-[#8E8D88] font-normal mb-1">
            Gabinete de Gestão Estratégica • MTL
          </div>
          <h1 class="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
            Dashboard Executivo de Desempenho e Indicadores
          </h1>
          <p class="text-[13px] text-[#6B6A66] mt-0.5">
            Métricas de eficiência de contratação pública, prazos médios, concorrência e execução física/financeira
          </p>
        </div>
      </div>

      <!-- KPI Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          label="Média de Concorrentes / Concurso"
          [value]="mediaConcorrentes()"
          icon="groups"
          tint="info"
          delta="+0.8"
          [deltaPositive]="true"
          deltaSuffix="vs meta anual"
        />
        <app-stat-card
          label="Prazo Médio de Tramitação"
          [value]="prazoMedioTramitacao() + ' dias'"
          icon="timelapse"
          tint="success"
          delta="-4 dias"
          [deltaPositive]="true"
          deltaSuffix="mais célere"
        />
        <app-stat-card
          label="Média Execução Física"
          [value]="mediaExecucaoFisica() + '%'"
          icon="construction"
          tint="violet"
          delta="+5.2%"
          [deltaPositive]="true"
        />
        <app-stat-card
          label="Reclamações Registadas"
          [value]="totalReclamacoes()"
          icon="gavel"
          tint="warning"
          delta="1 em análise"
          [deltaPositive]="false"
          deltaSuffix="taxa < 3%"
        />
      </div>

      <!-- Custom Pure SVG Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Chart 1: Concursos por Modalidade (Decreto 79/2022) -->
        <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs flex flex-col justify-between">
          <div class="mb-4">
            <h3 class="text-[15px] font-medium text-[#1A1A1A]">Distribuição de Procedimentos por Modalidade</h3>
            <p class="text-[12px] text-[#6B6A66]">Contratos e concursos instruídos nos termos do Decreto 79/2022</p>
          </div>

          <div class="space-y-3 pt-2">
            @for (bar of distribuicaoModalidades(); track bar.codigo) {
              <div class="space-y-1">
                <div class="flex items-center justify-between text-[12px]">
                  <span class="font-medium text-[#1A1A1A]">{{ bar.nome }} ({{ bar.codigo }})</span>
                  <span class="text-[#6B6A66] font-mono tnum">{{ bar.count }} ({{ bar.percent }}%)</span>
                </div>
                <div class="h-2.5 bg-[#F1F1EF] rounded-full overflow-hidden">
                  <div
                    class="h-full bg-[#1A1A1A] rounded-full transition-all duration-500"
                    [style.width.%]="bar.percent"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Chart 2: Comparativo Execução Física vs Financeira por Troço Rodoviário (SVG) -->
        <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs flex flex-col justify-between">
          <div class="mb-4">
            <div class="flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-[#1A1A1A]">Execução Física vs Financeira (Troços Viários)</h3>
              <div class="flex items-center gap-3 text-[11px]">
                <span class="flex items-center gap-1">
                  <span class="w-2.5 h-2.5 rounded-full bg-[#34B26A]"></span>
                  <span>Físico</span>
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-2.5 h-2.5 rounded-full bg-[#4C7DF0]"></span>
                  <span>Financeiro</span>
                </span>
              </div>
            </div>
            <p class="text-[12px] text-[#6B6A66]">Comparação de medições no terreno vs pagamentos efectuados</p>
          </div>

          <!-- SVG Bar Chart -->
          <div class="pt-4 overflow-x-auto">
            <svg class="w-full h-52 text-[10px]" viewBox="0 0 480 180">
              <!-- Grid lines -->
              <line x1="40" y1="20" x2="460" y2="20" stroke="#EDEDEA" stroke-dasharray="2,2" />
              <line x1="40" y1="60" x2="460" y2="60" stroke="#EDEDEA" stroke-dasharray="2,2" />
              <line x1="40" y1="100" x2="460" y2="100" stroke="#EDEDEA" stroke-dasharray="2,2" />
              <line x1="40" y1="140" x2="460" y2="140" stroke="#D9D8D3" />

              <!-- Y Labels -->
              <text x="30" y="24" fill="#8E8D88" text-anchor="end">100%</text>
              <text x="30" y="64" fill="#8E8D88" text-anchor="end">60%</text>
              <text x="30" y="104" fill="#8E8D88" text-anchor="end">30%</text>
              <text x="30" y="144" fill="#8E8D88" text-anchor="end">0%</text>

              <!-- Group 1: EN1 Marracuene -->
              <rect x="70" y="82" width="16" height="58" rx="2" fill="#34B26A" />
              <rect x="90" y="93" width="16" height="47" rx="2" fill="#4C7DF0" />
              <text x="88" y="158" fill="#1A1A1A" text-anchor="middle">EN1 Marrac.</text>

              <!-- Group 2: EN6 Beira -->
              <rect x="150" y="116" width="16" height="24" rx="2" fill="#34B26A" />
              <rect x="170" y="122" width="16" height="18" rx="2" fill="#4C7DF0" />
              <text x="168" y="158" fill="#1A1A1A" text-anchor="middle">EN6 Beira</text>

              <!-- Group 3: EN8 Nacala -->
              <rect x="230" y="128" width="16" height="12" rx="2" fill="#34B26A" />
              <rect x="250" y="134" width="16" height="6" rx="2" fill="#4C7DF0" />
              <text x="248" y="158" fill="#1A1A1A" text-anchor="middle">EN8 Nacala</text>

              <!-- Group 4: Circular Maputo -->
              <rect x="310" y="20" width="16" height="120" rx="2" fill="#34B26A" />
              <rect x="330" y="20" width="16" height="120" rx="2" fill="#4C7DF0" />
              <text x="328" y="158" fill="#1A1A1A" text-anchor="middle">Circular Mpt</text>

              <!-- Group 5: EN1 Xai-Xai -->
              <rect x="390" y="136" width="16" height="4" rx="2" fill="#34B26A" />
              <rect x="410" y="138" width="16" height="2" rx="2" fill="#4C7DF0" />
              <text x="408" y="158" fill="#1A1A1A" text-anchor="middle">EN1 Xai-Xai</text>
            </svg>
          </div>
        </div>
      </div>

      <!-- Key Performance Findings Summary -->
      <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs">
        <h3 class="text-[15px] font-medium text-[#1A1A1A] mb-2">Relatório Sintético de Auditoria e Desempenho</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px] text-[#4A4946]">
          <div class="p-3 rounded-lg bg-[#FCFCFB] border border-[#E6E5E1]">
            <strong class="text-[#1A1A1A] block mb-1">Celeridade Processual:</strong>
            Os prazos legais do Decreto 79/2022 estão a ser cumpridos em 100% dos procedimentos, com média de tramitação de 24 dias úteis entre publicação e adjudicação.
          </div>
          <div class="p-3 rounded-lg bg-[#FCFCFB] border border-[#E6E5E1]">
            <strong class="text-[#1A1A1A] block mb-1">Integridade e Selagem:</strong>
            Todas as propostas electrónicas submetidas registam hashes SHA-256 certificados, sem qualquer quebra de sigilo antes da abertura pelo júri.
          </div>
          <div class="p-3 rounded-lg bg-[#FCFCFB] border border-[#E6E5E1]">
            <strong class="text-[#1A1A1A] block mb-1">Fiscalização Viária:</strong>
            189 km de rede viária principal sob fiscalização contínua com relatórios de autos de medição e evidências fotográficas registadas.
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardExecutivoComponent {
  private store = inject(LocalDataStoreService);

  mediaConcorrentes = computed(() => '2.8');
  prazoMedioTramitacao = computed(() => '24');
  mediaExecucaoFisica = computed(() => '48.0');
  totalReclamacoes = computed(() => this.store.getReclamacoes('cnc-03').length);

  distribuicaoModalidades = computed(() => {
    const concursos = this.store.concursos();
    const total = concursos.length || 1;

    const counts: Record<string, number> = {};
    for (const c of concursos) {
      counts[c.modalidadeId] = (counts[c.modalidadeId] || 0) + 1;
    }

    return Object.keys(counts).map(modId => {
      const info = MODALIDADES_DECRETO_79_2022[modId as ModalidadeId];
      const count = counts[modId];
      return {
        codigo: info?.codigo || modId,
        nome: info?.nome || modId,
        count,
        percent: Math.round((count / total) * 100)
      };
    }).sort((a, b) => b.count - a.count);
  });
}
