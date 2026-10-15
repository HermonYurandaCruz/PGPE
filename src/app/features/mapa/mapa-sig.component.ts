import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { AuthService } from '../../core/services/auth.service';
import { TrocoEstrada, EstadoEstrada } from '../../shared/models/estrada.models';

@Component({
  selector: 'app-mapa-sig',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="text-[12px] text-[#8E8D88] font-normal mb-1">
            Módulo Geoespacial Viário • SIG Moçambique
          </div>
          <h1 class="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
            Rede Viária Nacional e Obras Estruturantes
          </h1>
          <p class="text-[13px] text-[#6B6A66] mt-0.5">
            Mapeamento geoespacial de troços rodoviários da EN1, EN6, EN8 e ligações logísticas
          </p>
        </div>

        <!-- Layer toggle (Técnica vs Pública) -->
        <div class="flex items-center gap-2">
          <div class="p-1 rounded-full bg-[#F1F1EF] border border-[#EDEDEA] flex items-center gap-1 text-[12px]">
            <button
              type="button"
              (click)="isTechnicalLayer.set(false); updateMapPolylines()"
              class="h-7 px-3 rounded-full font-medium transition-colors cursor-pointer"
              [class]="!isTechnicalLayer() ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-[#6B6A66] hover:text-[#1A1A1A]'"
            >
              Camada Pública
            </button>
            <button
              type="button"
              (click)="isTechnicalLayer.set(true); updateMapPolylines()"
              class="h-7 px-3 rounded-full font-medium transition-colors cursor-pointer"
              [class]="isTechnicalLayer() ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#6B6A66] hover:text-[#1A1A1A]'"
            >
              Camada Técnica UGEA
            </button>
          </div>
        </div>
      </div>

      <!-- Filters & Legend Toolbar -->
      <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-[12px]">
        <!-- Status Filter -->
        <div class="flex items-center gap-2">
          <span class="text-[#8E8D88] font-medium">Filtrar Estado:</span>
          <select
            [value]="filtroEstado()"
            (change)="onFiltroEstadoChange($event)"
            class="h-8 px-2.5 rounded-lg border border-[#E6E5E1] bg-white text-[12px] text-[#1A1A1A] focus:outline-none"
          >
            <option value="TODOS">Todos os Estados</option>
            <option value="PLANEADO">Planeado</option>
            <option value="EM_CONCURSO">Em Concurso</option>
            <option value="EM_CONSTRUCAO">Em Construção</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="EM_MANUTENCAO">Em Manutenção</option>
          </select>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-3">
          <span class="inline-flex items-center gap-1.5 text-[11px] text-[#6B6A66]">
            <span class="w-3 h-1 rounded-full bg-[#E5484D]"></span>
            <span>Em Construção</span>
          </span>
          <span class="inline-flex items-center gap-1.5 text-[11px] text-[#6B6A66]">
            <span class="w-3 h-1 rounded-full bg-[#3B6FE0]"></span>
            <span>Em Concurso</span>
          </span>
          <span class="inline-flex items-center gap-1.5 text-[11px] text-[#6B6A66]">
            <span class="w-3 h-1 rounded-full bg-[#34B26A]"></span>
            <span>Concluído</span>
          </span>
          <span class="inline-flex items-center gap-1.5 text-[11px] text-[#6B6A66]">
            <span class="w-3 h-1 rounded-full bg-[#8E8D88]"></span>
            <span>Planeado</span>
          </span>
        </div>
      </div>

      <!-- Map Container -->
      <div class="bg-white border border-[#E6E5E1] rounded-[16px] overflow-hidden shadow-xs relative">
        <div #mapContainer class="w-full h-[580px] bg-[#F1F1EF] z-0"></div>

        <!-- Floating Quick Stats on Map -->
        <div class="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm border border-[#E6E5E1] rounded-[10px] p-3 shadow-md max-w-[280px] text-[12px] space-y-1">
          <div class="font-medium text-[#1A1A1A] flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-[#2E9E5B]"></span>
            <span>SIG Operacional MTL</span>
          </div>
          <p class="text-[#6B6A66] text-[11px]">
            {{ trocos().length }} troços estratégicos mapeados num total de {{ totalKm() }} km de vias nacionais.
          </p>
        </div>
      </div>
    </div>
  `
})
export class MapaSigComponent implements OnInit, OnDestroy {
  private store = inject(LocalDataStoreService);
  auth = inject(AuthService);

  mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');

  private map: any = null;
  private polylinesLayer: any = null;

  isTechnicalLayer = signal<boolean>(true);
  filtroEstado = signal<string>('TODOS');

  trocos = computed(() => this.store.trocosEstrada());
  totalKm = computed(() => this.trocos().reduce((acc, t) => acc + t.extensaoKm, 0));

  onFiltroEstadoChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.filtroEstado.set(val);
    this.updateMapPolylines();
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.initLeafletMap();
      }, 50);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private async initLeafletMap(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const L = await import('leaflet');
      const container = this.mapContainer()?.nativeElement;
      if (!container) return;

      // Center in Mozambique (-18.66, 35.52) with zoom 6
      this.map = L.map(container).setView([-18.66, 35.52], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors • MTL Moçambique'
      }).addTo(this.map);

      this.polylinesLayer = L.layerGroup().addTo(this.map);
      this.updateMapPolylines();
    } catch {
      // Handle map load gracefully
    }
  }

  updateMapPolylines(): void {
    if (!this.map || !this.polylinesLayer) return;

    import('leaflet').then(L => {
      this.polylinesLayer.clearLayers();

      const items = this.trocos().filter(t => {
        if (this.filtroEstado() === 'TODOS') return true;
        return t.estado === this.filtroEstado();
      });

      const isTech = this.isTechnicalLayer();

      items.forEach(troco => {
        const color = this.getColorForStatus(troco.estado);

        const polyline = L.polyline(troco.coordenadas, {
          color,
          weight: 5,
          opacity: 0.85
        });

        const popupContent = isTech
          ? `
            <div style="font-family: 'Inter', sans-serif; font-size: 12px; min-width: 220px;">
              <strong style="font-size: 13px; color: #1A1A1A;">${troco.codigo}: ${troco.designacao}</strong>
              <div style="color: #6B6A66; margin: 4px 0;">Extensão: <b>${troco.extensaoKm} km</b> • ${troco.provincia}</div>
              <div style="margin: 4px 0;">Estado: <span style="font-weight: 600; color: ${color};">${troco.estado}</span></div>
              <div style="background: #F1F1EF; padding: 6px; border-radius: 6px; margin: 6px 0;">
                <div>Progresso Físico: <b>${troco.progressoFisico}%</b></div>
                <div>Progresso Financeiro: <b>${troco.progressoFinanceiro}%</b></div>
                ${troco.empreiteiroNome ? `<div>Empreiteiro: <b>${troco.empreiteiroNome}</b></div>` : ''}
              </div>
              ${troco.concursoId ? `<a href="/concursos/${troco.concursoId}" style="color: #3B6FE0; text-decoration: underline; font-weight: 500;">Ver Procedimento</a>` : ''}
            </div>
          `
          : `
            <div style="font-family: 'Inter', sans-serif; font-size: 12px; min-width: 200px;">
              <strong style="font-size: 13px; color: #1A1A1A;">${troco.codigo}: ${troco.designacao}</strong>
              <div style="color: #6B6A66; margin: 4px 0;">Extensão: <b>${troco.extensaoKm} km</b> • ${troco.provincia}</div>
              <div style="margin: 4px 0;">Estado da Via: <span style="font-weight: 600; color: ${color};">${troco.estado}</span></div>
              <div style="color: #8E8D88; font-size: 11px;">Portal de Transparência do MTL</div>
            </div>
          `;

        polyline.bindPopup(popupContent);
        this.polylinesLayer.addLayer(polyline);
      });
    });
  }

  private getColorForStatus(estado: EstadoEstrada): string {
    switch (estado) {
      case 'EM_CONSTRUCAO': return '#E5484D';
      case 'EM_CONCURSO': return '#3B6FE0';
      case 'CONCLUIDO': return '#34B26A';
      case 'EM_MANUTENCAO': return '#F5A623';
      case 'PLANEADO':
      default: return '#8E8D88';
    }
  }
}
