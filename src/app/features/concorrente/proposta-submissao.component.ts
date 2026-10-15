import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { AuthService } from '../../core/services/auth.service';
import { CryptoService } from '../../core/services/crypto.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuditService } from '../../core/services/audit.service';
import { AppUploadDropzone, UploadedFileSimulated } from '../../shared/ui/upload-dropzone.component';
import { AppCountdown } from '../../shared/ui/countdown.component';
import { MzDatePipe, MznCurrencyPipe } from '../../shared/pipes/format.pipes';
import { Proposta, PropostaDocumento, PropostaVersao } from '../../shared/models/proposta.models';
import { Concurso } from '../../shared/models/concurso.models';

@Component({
  selector: 'app-proposta-submissao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AppUploadDropzone,
    AppCountdown,
    MzDatePipe,
    MznCurrencyPipe
  ],
  template: `
    @if (concurso(); as c) {
      <div class="max-w-[800px] mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav class="text-[12px] text-[#8E8D88] mb-1 flex items-center gap-1.5">
              <a routerLink="/concursos" class="hover:underline">Concursos</a>
              <span>/</span>
              <a [routerLink]="['/concursos', c.id]" class="hover:underline">{{ c.numeroProcesso }}</a>
              <span>/</span>
              <span class="text-[#1A1A1A]">Submeter Proposta</span>
            </nav>
            <h1 class="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
              Submissão Electrónica de Proposta Selada
            </h1>
            <p class="text-[13px] text-[#6B6A66] mt-0.5">
              Selo criptográfico SHA-256 e garantia de inviolabilidade (Artigo 68 do Dec. 79/2022)
            </p>
          </div>

          <app-countdown [targetDate]="c.prazoSubmissao" />
        </div>

        @if (!isDeadlineOpen()) {
          <div class="p-6 rounded-[12px] bg-[#FDE8E8] border border-[#F6C5C5] text-[#D64545] space-y-2 text-center">
            <span class="mat-icon text-[32px]">block</span>
            <h3 class="text-[16px] font-medium">Prazo de Submissão Encerrado</h3>
            <p class="text-[13px] text-[#6B6A66]">
              O período regulamentar para apresentação e substituição de propostas expirou. Novas submissões estão estritamente bloqueadas.
            </p>
            <a
              [routerLink]="['/concursos', c.id]"
              class="inline-block mt-2 text-[13px] font-medium underline"
            >
              Regressar ao Concurso
            </a>
          </div>
        } @else {
          <!-- Notice about Real SHA-256 Seal -->
          <div class="p-4 rounded-[12px] bg-[#FCFCFB] border border-[#E6E5E1] flex items-start gap-3 shadow-xs">
            <div class="w-7 h-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 mt-0.5">
              <span class="mat-icon text-[15px]">security</span>
            </div>
            <div class="text-[12px] leading-relaxed text-[#4A4946]">
              <strong class="text-[#1A1A1A] block mb-0.5">Como funciona a Selagem Digital:</strong>
              Ao submeter, o sistema calcula em tempo real o algoritmo criptográfico <strong>SHA-256</strong> sobre o valor, prazo e metadados dos seus documentos, emitindo um comprovativo com carimbo temporal. O conteúdo sensível permanece selado até ao ato solene de abertura pelo Júri. Se já submeteu antes, uma nova submissão gerará uma <strong>versão substitutiva</strong> guardando o histórico.
            </div>
          </div>

          <!-- Existing Submission Notice -->
          @if (propostaExistente(); as pe) {
            <div class="p-4 rounded-[12px] bg-[#FEF3E0] border border-[#F8D9A6] text-[#E8920C] flex items-center justify-between gap-3">
              <div class="text-[12px]">
                <strong class="font-medium text-[#1A1A1A]">Já possui uma proposta submetida (Versão {{ pe.versao }})</strong>
                <p class="text-[#6B6A66]">
                  Ref: {{ pe.codigoReferencia }} • Submetida em {{ pe.dataSubmissao | mzDate:true }}. Submeter agora substituirá a proposta anterior.
                </p>
              </div>
              <a
                [routerLink]="['/concorrente/comprovativo', pe.id]"
                class="h-7 px-3 rounded-md bg-white border border-[#F8D9A6] text-[#1A1A1A] hover:bg-[#FEF3E0] text-[11px] font-medium inline-flex items-center gap-1 shadow-xs whitespace-nowrap"
              >
                Ver Comprovativo
              </a>
            </div>
          }

          <!-- Proposal Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit(c)" class="bg-white border border-[#EDEDEA] rounded-[16px] p-6 shadow-xs space-y-6">
            <!-- Dados da Empresa Concorrente -->
            <div class="p-4 rounded-[10px] bg-[#F7F7F6] border border-[#E6E5E1] space-y-1.5 text-[12px]">
              <div class="text-[11px] font-medium uppercase tracking-wider text-[#8E8D88]">Identificação do Concorrente</div>
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="font-medium text-[#1A1A1A] text-[13px]">{{ auth.currentUser()?.companyName || auth.currentUser()?.name }}</span>
                <span class="font-mono text-[#6B6A66]">NUIT: {{ auth.currentUser()?.nuit || '400123456' }}</span>
              </div>
            </div>

            <!-- Valores e Prazo de Execução -->
            <div class="space-y-4">
              <div class="border-b border-[#EFEFEC] pb-2">
                <h3 class="text-[15px] font-medium text-[#1A1A1A]">1. Proposta Financeira e Prazo</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
                    Valor Total Proposto (MZN com IVA) *
                  </label>
                  <input
                    type="number"
                    formControlName="valorPropostoMZN"
                    placeholder="Ex: 245000000"
                    class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] font-mono text-right focus:border-[#1A1A1A] focus:outline-none tnum"
                  />
                  <p class="text-[11px] text-[#8E8D88] mt-1 text-right">
                    Valor Estimado do MTL: {{ c.valorEstimadoMZN | mznCurrency }}
                  </p>
                </div>

                <div>
                  <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
                    Prazo de Execução da Obra (em meses) *
                  </label>
                  <input
                    type="number"
                    formControlName="prazoExecucaoMeses"
                    placeholder="Ex: 12"
                    class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] font-mono focus:border-[#1A1A1A] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- Documentos de Proposta -->
            <div class="space-y-4">
              <div class="border-b border-[#EFEFEC] pb-2">
                <h3 class="text-[15px] font-medium text-[#1A1A1A]">2. Documentos da Proposta Técnica e Garantia</h3>
                <p class="text-[12px] text-[#8E8D88]">Carregue a Proposta Técnica, Memória Descritiva e Garantia Provisória de Proposta</p>
              </div>

              <app-upload-dropzone
                [files]="documentosUpload()"
                (filesChanged)="documentosUpload.set($event)"
              />
            </div>

            <!-- Motivo de substituição se for versao > 1 -->
            @if (propostaExistente()) {
              <div>
                <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
                  Motivo da Substituição da Proposta
                </label>
                <input
                  type="text"
                  formControlName="motivoSubstituicao"
                  placeholder="Ex: Rectificação de orçamento no lote 2..."
                  class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>
            }

            <!-- Submit Button -->
            <div class="pt-4 border-t border-[#EFEFEC] flex items-center justify-end gap-3">
              <a
                [routerLink]="['/concursos', c.id]"
                class="h-10 px-4 rounded-lg border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#6B6A66] text-[13px] font-medium transition-colors inline-flex items-center"
              >
                Cancelar
              </a>

              <button
                type="submit"
                [disabled]="form.invalid || isSubmitting()"
                class="h-10 px-6 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] disabled:bg-[#EDEDEA] disabled:text-[#B8B7B1] text-[13px] font-medium transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
              >
                @if (isSubmitting()) {
                  <span class="mat-icon text-[16px] animate-spin">refresh</span>
                  <span>A calcular selo SHA-256...</span>
                } @else {
                  <span class="mat-icon text-[16px]">lock</span>
                  <span>{{ propostaExistente() ? 'Substituir Proposta Selada' : 'Selar e Submeter Proposta' }}</span>
                }
              </button>
            </div>
          </form>
        }
      </div>
    }
  `
})
export class PropostaSubmissaoComponent {
  private fb = inject(FormBuilder);
  private store = inject(LocalDataStoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private crypto = inject(CryptoService);
  private notification = inject(NotificationService);
  private audit = inject(AuditService);
  auth = inject(AuthService);

  concursoId = signal<string>('');
  isSubmitting = signal(false);

  documentosUpload = signal<UploadedFileSimulated[]>([
    {
      id: 'doc-prop-1',
      nome: 'Proposta_Tecnica_e_Cronograma.pdf',
      tamanhoBytes: 5200000,
      tipoMime: 'application/pdf',
      dataUpload: new Date().toISOString()
    },
    {
      id: 'doc-prop-2',
      nome: 'Garantia_Bancaria_Proposta.pdf',
      tamanhoBytes: 890000,
      tipoMime: 'application/pdf',
      dataUpload: new Date().toISOString()
    }
  ]);

  form = this.fb.nonNullable.group({
    valorPropostoMZN: this.fb.nonNullable.control<number>(245000000, [Validators.required, Validators.min(1000)]),
    prazoExecucaoMeses: this.fb.nonNullable.control<number>(12, [Validators.required, Validators.min(1)]),
    motivoSubstituicao: this.fb.nonNullable.control('')
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      const cid = params.get('concursoId');
      if (cid) {
        this.concursoId.set(cid);
      }
    });
  }

  concurso = computed(() => {
    return this.store.getConcursoById(this.concursoId());
  });

  isDeadlineOpen = computed(() => {
    const c = this.concurso();
    if (!c) return false;
    return new Date(c.prazoSubmissao).getTime() > Date.now();
  });

  propostaExistente = computed(() => {
    const user = this.auth.currentUser();
    const cid = this.concursoId();
    if (!user || !cid) return null;
    return this.store.getPropostasPorConcorrente(user.id).find(p => p.concursoId === cid) || null;
  });

  async onSubmit(c: Concurso): Promise<void> {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);

    try {
      const user = this.auth.currentUser();
      const raw = this.form.getRawValue();
      const agora = new Date().toISOString();
      const concorrenteId = user?.id || 'concorrente-temp';
      const concorrenteNome = user?.companyName || user?.name || 'Empresa Concorrente';
      const concorrenteNuit = user?.nuit || '400123456';

      // Real SHA-256 calculation over proposal payload
      const payloadToHash = JSON.stringify({
        concursoId: c.id,
        concorrenteId,
        concorrenteNuit,
        valorPropostoMZN: raw.valorPropostoMZN,
        prazoExecucaoMeses: raw.prazoExecucaoMeses,
        documentosCount: this.documentosUpload().length,
        timestamp: agora
      });

      const hashSHA256 = await this.crypto.computeSHA256(payloadToHash);
      const codigoReferencia = this.crypto.generateReferenceCode('PROP-MZ');

      const existing = this.propostaExistente();
      const proximaVersao = existing ? existing.versao + 1 : 1;

      const novaVersaoHist: PropostaVersao = {
        versao: proximaVersao,
        dataSubmissao: agora,
        hashSHA256,
        valorPropostoMZN: raw.valorPropostoMZN,
        prazoExecucaoMeses: raw.prazoExecucaoMeses,
        motivoSubstituicao: raw.motivoSubstituicao || undefined
      };

      const documentos: PropostaDocumento[] = this.documentosUpload().map(d => ({
        id: d.id,
        nome: d.nome,
        tipo: 'PROPOSTA_TECNICA',
        tamanhoBytes: d.tamanhoBytes,
        tipoMime: d.tipoMime,
        dataUpload: d.dataUpload
      }));

      let propostaSalva: Proposta;

      if (existing) {
        // Update existing proposal keeping version history
        const historico = [...(existing.historicoVersoes || []), novaVersaoHist];
        propostaSalva = this.store.updateProposta(existing.id, {
          valorPropostoMZN: raw.valorPropostoMZN,
          prazoExecucaoMeses: raw.prazoExecucaoMeses,
          dataSubmissao: agora,
          versao: proximaVersao,
          hashSHA256,
          carimboTemporal: agora,
          documentos,
          historicoVersoes: historico,
          selada: true
        });

        await this.audit.log(
          user,
          'SUBSTITUICAO_PROPOSTA_SELADA',
          'PROPOSTA',
          `Substituição para a versão ${proximaVersao} da proposta ${existing.codigoReferencia} no concurso ${c.numeroProcesso}. Hash SHA-256: ${hashSHA256}`,
          existing.id
        );

        this.notification.success(`Proposta actualizada para a versão ${proximaVersao} com novo selo SHA-256!`, 'Proposta Substituída');
      } else {
        // Create new proposal
        const novaProposta: Proposta = {
          id: 'prop-' + Math.random().toString(36).substring(2, 9),
          concursoId: c.id,
          concorrenteId,
          concorrenteNome,
          concorrenteNuit,
          concorrenteEmail: user?.email || 'empresa@concorrente.mz',
          valorPropostoMZN: raw.valorPropostoMZN,
          prazoExecucaoMeses: raw.prazoExecucaoMeses,
          dataSubmissao: agora,
          versao: 1,
          hashSHA256,
          codigoReferencia,
          carimboTemporal: agora,
          selada: true,
          documentos,
          historicoVersoes: [novaVersaoHist]
        };

        propostaSalva = this.store.saveProposta(novaProposta);

        await this.audit.log(
          user,
          'SUBMISSAO_PROPOSTA_SELADA',
          'PROPOSTA',
          `Submissão da proposta selada ${codigoReferencia} no concurso ${c.numeroProcesso}. Hash SHA-256: ${hashSHA256}`,
          novaProposta.id
        );

        this.notification.success('Proposta selada criptograficamente e submetida com sucesso!', 'Selo Digital Emitido');
      }

      // Navigate to digital receipt
      this.router.navigate(['/concorrente/comprovativo', propostaSalva.id]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro no processamento da proposta';
      this.notification.error('Ocorreu um erro ao selar a proposta: ' + msg, 'Erro de Selagem');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
