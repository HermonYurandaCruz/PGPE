import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuditService } from '../../core/services/audit.service';
import { AppStatCard } from '../../shared/ui/stat-card.component';
import { AppStatusBadge } from '../../shared/ui/status-badge.component';
import { AppCountdown } from '../../shared/ui/countdown.component';
import { MznCurrencyPipe, MzDatePipe } from '../../shared/pipes/format.pipes';
import { DenunciaCidada } from '../../shared/models/denuncia.models';

@Component({
  selector: 'app-portal-publico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    AppStatCard,
    AppStatusBadge,
    AppCountdown,
    MznCurrencyPipe,
    MzDatePipe
  ],
  template: `
    <div class="space-y-8">
      <!-- Public Hero Banner -->
      <div class="p-8 sm:p-10 rounded-[16px] bg-[#1A1A1A] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div class="space-y-2 max-w-[680px]">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-medium tracking-wide">
            <span class="w-1.5 h-1.5 rounded-full bg-[#34B26A]"></span>
            Portal Oficial de Transparência Pública • Decreto 79/2022
          </div>
          <h1 class="text-[26px] sm:text-[30px] font-medium tracking-[-0.02em] leading-tight">
            Transparência na Contratação Pública e Obras Rodoviárias
          </h1>
          <p class="text-[13px] text-[#D9D8D3] leading-relaxed">
            Consulte concursos abertos do Ministério dos Transportes e Logística, resultados homologados de adjudicação e fiscalização em tempo real das vias nacionais de Moçambique.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <a
            routerLink="/concursos"
            class="h-10 px-5 rounded-lg bg-white text-[#1A1A1A] hover:bg-[#F1F1EF] text-[13px] font-medium transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span class="mat-icon text-[18px]">search</span>
            <span>Ver Concursos Abertos</span>
          </a>
          <a
            routerLink="/auth/registo"
            class="h-10 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <span>Registar Empresa</span>
          </a>
        </div>
      </div>

      <!-- Key Public Indicators -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-stat-card
          label="Concursos em Aberto ao Público"
          [value]="concursosPublicos().length"
          icon="gavel"
          tint="info"
        />
        <app-stat-card
          label="Total de Valor Adjudicado (Transparência)"
          [value]="valorTotalAdjudicadoFormatted()"
          icon="verified"
          tint="success"
        />
        <app-stat-card
          label="Troços sob Fiscalização Pública"
          [value]="totalTrocosMapeados() + ' troços'"
          icon="add_road"
          tint="violet"
        />
      </div>

      <!-- Section: Concursos Abertos com Prazo a Decorrer -->
      <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-[18px] font-medium text-[#1A1A1A] tracking-[-0.01em]">
              Procedimentos de Contratação em Aberto
            </h2>
            <p class="text-[12px] text-[#6B6A66]">
              Acesso livre ao Caderno de Encargos e especificações para apresentação tempestiva de propostas
            </p>
          </div>
          <a routerLink="/concursos" class="text-[12px] font-medium text-[#1A1A1A] hover:underline">
            Ver Todos
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (c of concursosPublicos(); track c.id) {
            <div class="border border-[#EDEDEA] rounded-[10px] p-4 bg-[#FCFCFB] flex flex-col justify-between hover:border-[#D9D8D3] transition-colors shadow-xs">
              <div>
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span class="text-[10px] font-mono text-[#8E8D88] bg-[#F1F1EF] px-1.5 py-0.5 rounded">
                    {{ c.numeroProcesso }}
                  </span>
                  <app-status-badge [estado]="c.estado" mode="badge" />
                </div>
                <h3 class="text-[14px] font-medium text-[#1A1A1A] mb-1 leading-snug">
                  {{ c.titulo }}
                </h3>
                <p class="text-[12px] text-[#6B6A66] line-clamp-2 mb-3">
                  {{ c.objecto }}
                </p>
              </div>

              <div class="pt-3 border-t border-[#EFEFEC] flex items-center justify-between gap-2">
                <app-countdown [targetDate]="c.prazoSubmissao" />
                <a
                  [routerLink]="['/concursos', c.id]"
                  class="h-7 px-3 rounded-md bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <span>Consultar</span>
                </a>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Section: Últimas Adjudicações Homologadas -->
      <div class="bg-white border border-[#EDEDEA] rounded-[12px] p-5 shadow-xs space-y-4">
        <div>
          <h2 class="text-[18px] font-medium text-[#1A1A1A] tracking-[-0.01em]">
            Últimas Adjudicações Homologadas
          </h2>
          <p class="text-[12px] text-[#6B6A66]">
            Publicação obrigatória de resultados definitivos nos termos da lei
          </p>
        </div>

        <div class="overflow-x-auto rounded-[8px] border border-[#EDEDEA]">
          <table class="w-full text-left border-collapse text-[13px]">
            <thead class="bg-[#F5F5F3] text-[#6B6A66] text-[12px]">
              <tr>
                <th class="p-3">Processo</th>
                <th class="p-3">Objecto</th>
                <th class="p-3">Concorrente Vencedor</th>
                <th class="p-3 text-right">Valor Adjudicado</th>
                <th class="p-3">Data Despacho</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F1EF]">
              @for (adj of ultimasAdjudicacoes(); track adj.id) {
                <tr class="hover:bg-[#F8F8F6] transition-colors">
                  <td class="p-3 font-mono text-[12px]">{{ adj.numeroProcesso }}</td>
                  <td class="p-3 font-medium max-w-[300px] truncate">{{ adj.titulo }}</td>
                  <td class="p-3 text-[#2E9E5B] font-medium">{{ adj.vencedorAdjudicadoNome }}</td>
                  <td class="p-3 text-right font-medium tnum">{{ adj.valorAdjudicadoMZN | mznCurrency }}</td>
                  <td class="p-3 text-[12px] text-[#6B6A66] tnum">{{ adj.dataAdjudicacao | mzDate }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section: Participação Cívica / Denúncia Cidadã -->
      <div class="bg-white border border-[#EDEDEA] rounded-[16px] p-6 shadow-xs space-y-4">
        <div class="border-b border-[#EFEFEC] pb-3">
          <div class="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#3B6FE0] mb-1">
            <span class="mat-icon text-[14px]">shield</span>
            Controlo Social e Cidadania Activa
          </div>
          <h2 class="text-[18px] font-medium text-[#1A1A1A]">
            Canal de Participação Cívica e Denúncias de Irregularidades
          </h2>
          <p class="text-[12px] text-[#6B6A66]">
            Tem conhecimento de irregularidades numa obra rodoviária ou concurso? Envie a sua denúncia ou sugestão directamente à Inspecção-Geral e Administração do MTL. O anonimato é assegurado.
          </p>
        </div>

        <form [formGroup]="denunciaForm" (ngSubmit)="enviarDenuncia()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Nome (Opcional - pode ser anónimo)</label>
              <input
                type="text"
                formControlName="nomeCidadao"
                placeholder="Seu nome ou deixar em branco"
                class="w-full h-9 px-3 rounded-lg border border-[#E6E5E1] text-[12px] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Contacto / Email (Opcional)</label>
              <input
                type="email"
                formControlName="emailContato"
                placeholder="email@exemplo.mz"
                class="w-full h-9 px-3 rounded-lg border border-[#E6E5E1] text-[12px] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Tipo de Comunicação *</label>
              <select
                formControlName="tipo"
                class="w-full h-9 px-2.5 rounded-lg border border-[#E6E5E1] bg-white text-[12px] text-[#1A1A1A] focus:outline-none"
              >
                <option value="IRREGULARIDADE">Denúncia de Irregularidade</option>
                <option value="SUGESTAO">Sugestão de Melhoria Viária</option>
                <option value="DENUNCIA_CORRUPCAO">Denúncia de Fraude / Corrupção</option>
                <option value="ELOGIO">Elogio de Execução</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">Descrição dos Factos *</label>
            <textarea
              formControlName="descricao"
              rows="3"
              placeholder="Descreva o local da obra, troço de estrada ou concurso e os factos observados..."
              class="w-full p-3 rounded-lg border border-[#E6E5E1] text-[12px] focus:outline-none focus:border-[#1A1A1A]"
            ></textarea>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              [disabled]="denunciaForm.invalid || enviandoDenuncia()"
              class="h-9 px-5 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] disabled:bg-[#EDEDEA] disabled:text-[#B8B7B1] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span class="mat-icon text-[16px]">send</span>
              <span>Submeter Participação Cívica</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PortalPublicoComponent {
  private store = inject(LocalDataStoreService);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private audit = inject(AuditService);

  enviandoDenuncia = signal(false);

  denunciaForm = this.fb.nonNullable.group({
    nomeCidadao: this.fb.nonNullable.control(''),
    emailContato: this.fb.nonNullable.control(''),
    tipo: this.fb.nonNullable.control<DenunciaCidada['tipo']>('SUGESTAO', [Validators.required]),
    descricao: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(10)])
  });

  concursosPublicos = computed(() => {
    return this.store.concursos().filter(c => c.estado === 'PUBLICADO');
  });

  ultimasAdjudicacoes = computed(() => {
    return this.store.concursos()
      .filter(c => c.estado === 'ADJUDICADO' || c.estado === 'EM_EXECUCAO' || c.estado === 'CONCLUIDO')
      .slice(0, 5);
  });

  totalTrocosMapeados = computed(() => this.store.trocosEstrada().length);

  valorTotalAdjudicadoFormatted = computed(() => {
    const total = this.ultimasAdjudicacoes().reduce((acc, c) => acc + (c.valorAdjudicadoMZN || 0), 0);
    return `MZN ${(total / 1000000).toFixed(1)}M`;
  });

  async enviarDenuncia(): Promise<void> {
    if (this.denunciaForm.invalid) return;

    this.enviandoDenuncia.set(true);
    const raw = this.denunciaForm.getRawValue();

    const nova: DenunciaCidada = {
      id: 'den-' + Math.random().toString(36).substring(2, 9),
      data: new Date().toISOString(),
      nomeCidadao: raw.nomeCidadao || undefined,
      emailContato: raw.emailContato || undefined,
      tipo: raw.tipo,
      descricao: raw.descricao,
      estado: 'RECEBIDA'
    };

    this.store.saveDenuncia(nova);

    await this.audit.log(
      null,
      'DENUNCIA_CIDADA_SUBMETIDA',
      'SISTEMA',
      `Participação cívica (${raw.tipo}) submetida no portal de transparência.`,
      nova.id
    );

    this.enviandoDenuncia.set(false);
    this.denunciaForm.reset({ tipo: 'SUGESTAO', nomeCidadao: '', emailContato: '', descricao: '' });
    this.notification.success('A sua comunicação foi registada e encaminhada à Inspecção do MTL.', 'Participação Enviada');
  }
}
