import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { MzDatePipe } from '../../shared/pipes/format.pipes';

@Component({
  selector: 'app-comprovativo-submissao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MzDatePipe],
  template: `
    @if (proposta(); as p) {
      <div class="max-w-[760px] mx-auto space-y-6">
        <!-- Action Bar (no-print) -->
        <div class="no-print flex items-center justify-between gap-4 border-b border-[#EFEFEC] pb-4">
          <a
            [routerLink]="['/concursos', p.concursoId]"
            class="text-[13px] text-[#6B6A66] hover:text-[#1A1A1A] inline-flex items-center gap-1 font-medium"
          >
            <span class="mat-icon text-[16px]">arrow_back</span>
            <span>Voltar ao Concurso</span>
          </a>

          <div class="flex items-center gap-2.5">
            <button
              type="button"
              (click)="imprimir()"
              class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span class="mat-icon text-[16px]">print</span>
              <span>Imprimir Comprovativo Oficial</span>
            </button>
          </div>
        </div>

        <!-- Official Certificate Card -->
        <div class="bg-white border border-[#E6E5E1] rounded-[16px] p-8 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
          <!-- Certificate Header -->
          <div class="text-center border-b border-[#E6E5E1] pb-6 space-y-2">
            <div class="w-12 h-12 mx-auto rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-[16px] tracking-wider mb-2">
              MTL
            </div>
            <h2 class="text-[13px] uppercase tracking-widest text-[#6B6A66] font-medium">
              República de Moçambique
            </h2>
            <h1 class="text-[18px] sm:text-[20px] font-medium text-[#1A1A1A] tracking-[-0.01em]">
              Ministério dos Transportes e Logística
            </h1>
            <p class="text-[12px] text-[#8E8D88]">
              Plataforma Oficial de Contratos e Concursos Electrónicos (e-Procurement)
            </p>
            <div class="inline-block mt-2 px-3 py-1 rounded-full bg-[#E6F6EC] text-[#2E9E5B] border border-[#BFE6CF] text-[12px] font-medium">
              Comprovativo Oficial de Recepção e Selagem Electrónica
            </div>
          </div>

          <!-- Key Identifiers Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-[12px] bg-[#FCFCFB] border border-[#EDEDEA] text-[12px]">
            <div>
              <span class="text-[#8E8D88] block text-[11px]">Código Único de Referência:</span>
              <span class="font-mono text-[14px] font-medium text-[#1A1A1A]">{{ p.codigoReferencia }}</span>
            </div>
            <div>
              <span class="text-[#8E8D88] block text-[11px]">Carimbo Temporal Oficial (África/Maputo):</span>
              <span class="font-medium text-[#1A1A1A] tnum">{{ p.carimboTemporal | mzDate:true }}</span>
            </div>
            <div>
              <span class="text-[#8E8D88] block text-[11px]">Versão da Proposta:</span>
              <span class="font-medium text-[#1A1A1A]">Versão {{ p.versao }} (Válida e Activa)</span>
            </div>
            <div>
              <span class="text-[#8E8D88] block text-[11px]">Estado do Selo:</span>
              <span class="font-medium text-[#2E9E5B] flex items-center gap-1">
                <span class="mat-icon text-[14px]">verified</span>
                <span>Inviolável / Criptografado</span>
              </span>
            </div>
          </div>

          <!-- Cryptographic Hash Box -->
          <div class="space-y-1.5 p-4 rounded-[12px] bg-[#F7F7F6] border border-[#E6E5E1]">
            <div class="flex items-center justify-between text-[11px] font-medium text-[#4A4946]">
              <span>Hash Criptográfico SHA-256 (Pegada Digital Matemática)</span>
              <span class="text-[#8E8D88]">Web Crypto API Standard</span>
            </div>
            <div class="font-mono text-[11px] text-[#1A1A1A] break-all bg-white p-3 rounded-[8px] border border-[#EDEDEA] select-all">
              {{ p.hashSHA256 }}
            </div>
            <p class="text-[10px] text-[#8E8D88]">
              Este resumo criptográfico garante matematicamente que o conteúdo da proposta não foi alterado desde a hora de submissão.
            </p>
          </div>

          <!-- Entity & Procedure Info -->
          <div class="space-y-3 text-[12px]">
            <h4 class="font-medium text-[#1A1A1A] uppercase tracking-wider text-[11px] text-[#8E8D88]">
              Dados do Procedimento e Concorrente
            </h4>

            <div class="border border-[#EDEDEA] rounded-[10px] divide-y divide-[#F1F1EF] overflow-hidden">
              <div class="p-3 flex justify-between">
                <span class="text-[#8E8D88]">Nº de Processo do Concurso:</span>
                <span class="font-mono font-medium text-[#1A1A1A]">{{ concurso()?.numeroProcesso }}</span>
              </div>
              <div class="p-3 flex justify-between">
                <span class="text-[#8E8D88]">Designação da Empreitada:</span>
                <span class="font-medium text-[#1A1A1A] text-right max-w-[420px]">{{ concurso()?.titulo }}</span>
              </div>
              <div class="p-3 flex justify-between">
                <span class="text-[#8E8D88]">Entidade Contratante:</span>
                <span class="font-medium text-[#1A1A1A]">Ministério dos Transportes e Logística (MTL)</span>
              </div>
              <div class="p-3 flex justify-between">
                <span class="text-[#8E8D88]">Empresa Concorrente:</span>
                <span class="font-medium text-[#1A1A1A]">{{ p.concorrenteNome }}</span>
              </div>
              <div class="p-3 flex justify-between">
                <span class="text-[#8E8D88]">NUIT da Empresa:</span>
                <span class="font-mono font-medium text-[#1A1A1A]">{{ p.concorrenteNuit }}</span>
              </div>
              <div class="p-3 flex justify-between">
                <span class="text-[#8E8D88]">Prazo de Execução Ofertado:</span>
                <span class="font-medium text-[#1A1A1A]">{{ p.prazoExecucaoMeses }} Meses</span>
              </div>
              <div class="p-3 flex justify-between">
                <span class="text-[#8E8D88]">Documentos Técnicos Anexados:</span>
                <span class="font-medium text-[#1A1A1A]">{{ p.documentos.length }} ficheiros certificados</span>
              </div>
            </div>
          </div>

          <!-- Legal Disclaimer -->
          <div class="pt-4 border-t border-[#EDEDEA] text-[11px] text-[#8E8D88] leading-relaxed space-y-2">
            <p>
              O presente documento constitui comprovativo autêntico e irrevogável da entrega tempestiva da proposta electrónica, nos termos do Decreto n.º 79/2022 de 30 de Dezembro (Regulamento de Contratação de Empreitada de Obras Públicas, Fornecimento de Bens e Prestação de Serviços ao Estado).
            </p>
            <div class="flex flex-wrap items-center justify-between pt-2 text-[10px] text-[#B8B7B1]">
              <span>Certificação Digital UGEA / DNEP</span>
              <span>Maputo, Moçambique</span>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ComprovativoSubmissaoComponent {
  private store = inject(LocalDataStoreService);
  private route = inject(ActivatedRoute);

  propostaId = signal<string>('');

  constructor() {
    this.route.paramMap.subscribe(params => {
      const pid = params.get('propostaId');
      if (pid) {
        this.propostaId.set(pid);
      }
    });
  }

  proposta = computed(() => {
    return this.store.getPropostaById(this.propostaId());
  });

  concurso = computed(() => {
    const p = this.proposta();
    if (!p) return null;
    return this.store.getConcursoById(p.concursoId);
  });

  imprimir(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
