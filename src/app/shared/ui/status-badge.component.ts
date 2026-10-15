import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EstadoConcurso } from '../models/concurso.models';

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    @if (mode() === 'badge') {
      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-tight whitespace-nowrap" [class]="badgeClasses()">
        @if (showDot()) {
          <span class="w-1.5 h-1.5 rounded-full" [class]="dotClass()"></span>
        }
        {{ labelText() }}
      </span>
    } @else {
      <!-- Inline Dot + Text Indicator (table row style) -->
      <span class="inline-flex items-center gap-1.5 text-[13px] whitespace-nowrap" [class]="textClass()">
        <span class="w-1.5 h-1.5 rounded-full shrink-0" [class]="dotClass()"></span>
        <span class="font-normal">{{ labelText() }}</span>
      </span>
    }
  `
})
export class AppStatusBadge {
  estado = input<EstadoConcurso | string | null>(null);
  priority = input<'High' | 'Medium' | 'Low' | null>(null);
  mode = input<'badge' | 'indicator'>('indicator');
  showDot = input<boolean>(true);
  customLabel = input<string | null>(null);

  labelText = computed(() => {
    if (this.customLabel()) return this.customLabel()!;
    if (this.priority()) {
      switch (this.priority()) {
        case 'High': return 'Prioridade Alta';
        case 'Medium': return 'Prioridade Média';
        case 'Low': return 'Prioridade Baixa';
      }
    }
    const e = this.estado();
    switch (e) {
      case 'RASCUNHO': return 'Rascunho';
      case 'PENDENTE_APROVACAO': return 'Pendente Aprovação';
      case 'PUBLICADO': return 'Publicado';
      case 'EM_AVALIACAO': return 'Em Avaliação';
      case 'ADJUDICADO': return 'Adjudicado';
      case 'CANCELADO': return 'Cancelado';
      case 'INVALIDADO': return 'Invalidado';
      case 'EM_EXECUCAO': return 'Em Execução';
      case 'CONCLUIDO': return 'Concluído';
      case 'VISADO': return 'Visado pelo TA';
      case 'PENDENTE': return 'Pendente';
      case 'RECUSADO': return 'Visto Recusado';
      case 'VIGENTE': return 'Vigente';
      case 'SUSPENSO': return 'Suspenso';
      default: return e ? String(e) : 'Desconhecido';
    }
  });

  dotClass = computed(() => {
    if (this.priority()) {
      switch (this.priority()) {
        case 'High': return 'bg-[#E5484D]';
        case 'Medium': return 'bg-[#E8C21A]';
        case 'Low': return 'bg-[#34B26A]';
      }
    }
    const e = this.estado();
    switch (e) {
      case 'PUBLICADO':
      case 'ADJUDICADO':
      case 'CONCLUIDO':
      case 'VISADO':
      case 'VIGENTE':
        return 'bg-[#34B26A]';
      case 'EM_EXECUCAO':
      case 'EM_AVALIACAO':
        return 'bg-[#4C7DF0]';
      case 'PENDENTE_APROVACAO':
      case 'PENDENTE':
        return 'bg-[#F5A623]';
      case 'CANCELADO':
      case 'RECUSADO':
      case 'INVALIDADO':
        return 'bg-[#E5484D]';
      case 'RASCUNHO':
      case 'SUSPENSO':
      default:
        return 'bg-[#8E8D88]';
    }
  });

  textClass = computed(() => {
    if (this.priority()) {
      switch (this.priority()) {
        case 'High': return 'text-[#D64545]';
        case 'Medium': return 'text-[#A67C00]';
        case 'Low': return 'text-[#2E9E5B]';
      }
    }
    const e = this.estado();
    switch (e) {
      case 'PUBLICADO':
      case 'ADJUDICADO':
      case 'CONCLUIDO':
      case 'VISADO':
      case 'VIGENTE':
        return 'text-[#2E9E5B]';
      case 'EM_EXECUCAO':
      case 'EM_AVALIACAO':
        return 'text-[#3B6FE0]';
      case 'PENDENTE_APROVACAO':
      case 'PENDENTE':
        return 'text-[#E8920C]';
      case 'CANCELADO':
      case 'RECUSADO':
      case 'INVALIDADO':
        return 'text-[#D64545]';
      case 'RASCUNHO':
      case 'SUSPENSO':
      default:
        return 'text-[#6B6A66]';
    }
  });

  badgeClasses = computed(() => {
    if (this.priority()) {
      switch (this.priority()) {
        case 'High': return 'bg-[#FDE8E8] text-[#D64545] border border-[#F6C5C5]';
        case 'Medium': return 'bg-[#FFF4CC] text-[#A67C00] border border-[#F1DE8F]';
        case 'Low': return 'bg-[#E6F6EC] text-[#2E9E5B] border border-[#BFE6CF]';
      }
    }
    const e = this.estado();
    switch (e) {
      case 'PUBLICADO':
      case 'ADJUDICADO':
      case 'CONCLUIDO':
      case 'VISADO':
      case 'VIGENTE':
        return 'bg-[#E6F6EC] text-[#2E9E5B] border border-[#BFE6CF]';
      case 'EM_EXECUCAO':
      case 'EM_AVALIACAO':
        return 'bg-[#E8EEFD] text-[#3B6FE0] border border-[#C5D4F8]';
      case 'PENDENTE_APROVACAO':
      case 'PENDENTE':
        return 'bg-[#FEF3E0] text-[#E8920C] border border-[#F8D9A6]';
      case 'CANCELADO':
      case 'RECUSADO':
      case 'INVALIDADO':
        return 'bg-[#FDE8E8] text-[#D64545] border border-[#F6C5C5]';
      case 'RASCUNHO':
      default:
        return 'bg-[#F1F1EF] text-[#6B6A66] border border-[#E6E5E1]';
    }
  });
}
