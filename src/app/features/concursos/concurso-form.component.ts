import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuditService } from '../../core/services/audit.service';
import { AppUploadDropzone, UploadedFileSimulated } from '../../shared/ui/upload-dropzone.component';
import {
  ModalidadeId,
  MODALIDADES_DECRETO_79_2022
} from '../../shared/models/modalidades.models';
import { Concurso, ProvinciaMZ } from '../../shared/models/concurso.models';

@Component({
  selector: 'app-concurso-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AppUploadDropzone
  ],
  template: `
    <div class="max-w-[840px] mx-auto space-y-6">
      <!-- Breadcrumb + Title -->
      <div>
        <nav class="text-[12px] text-[#8E8D88] mb-1 flex items-center gap-1.5">
          <a routerLink="/concursos" class="hover:underline">Concursos</a>
          <span>/</span>
          <span class="text-[#1A1A1A]">Novo Procedimento</span>
        </nav>
        <h1 class="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
          Instrução de Concurso Público (UGEA)
        </h1>
        <p class="text-[13px] text-[#6B6A66] mt-0.5">
          Regulamentado pelo Decreto n.º 79/2022 e Diploma Ministerial n.º 46/2024
        </p>
      </div>

      <!-- Form Container -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white border border-[#EDEDEA] rounded-[16px] p-6 shadow-xs space-y-6">
        <!-- Section 1: Modalidade de Contratação Legal -->
        <div class="space-y-4">
          <div class="border-b border-[#EFEFEC] pb-2">
            <h3 class="text-[15px] font-medium text-[#1A1A1A]">1. Enquadramento e Modalidade Legal</h3>
            <p class="text-[12px] text-[#8E8D88]">Seleccione a modalidade legal aplicável de acordo com o valor e complexidade da obra</p>
          </div>

          <div>
            <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
              Modalidade de Contratação (Decreto 79/2022) *
            </label>
            <select
              formControlName="modalidadeId"
              (change)="onModalidadeChange()"
              class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] cursor-pointer"
            >
              @for (mod of modalidadesList; track mod.id) {
                <option [value]="mod.id">
                  {{ mod.codigo }} - {{ mod.nome }} (Prazo mín. {{ mod.prazoMinimoDias }} dias)
                </option>
              }
            </select>
          </div>

          <!-- Modality Legal Info Card -->
          @if (selectedModalityInfo(); as info) {
            <div class="bg-[#F7F7F6] border border-[#E6E5E1] rounded-[10px] p-3.5 space-y-2 text-[12px]">
              <div class="flex items-center justify-between">
                <span class="font-medium text-[#1A1A1A]">{{ info.nome }} ({{ info.codigo }})</span>
                <span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#E8EEFD] text-[#3B6FE0]">
                  Prazo mínimo legal: {{ info.prazoMinimoDias }} dias
                </span>
              </div>
              <p class="text-[#6B6A66] leading-relaxed">{{ info.descricao }}</p>
              <div class="text-[11px] text-[#8E8D88]">
                <strong class="font-medium text-[#4A4946]">Aplicação típica:</strong> {{ info.aplicacaoTipica }}
              </div>
              <div class="text-[11px] text-[#8E8D88]">
                <strong class="font-medium text-[#4A4946]">Base Legal:</strong> {{ info.baseLegal }}
              </div>
            </div>
          }
        </div>

        <!-- Section 2: Dados Gerais do Processo -->
        <div class="space-y-4">
          <div class="border-b border-[#EFEFEC] pb-2">
            <h3 class="text-[15px] font-medium text-[#1A1A1A]">2. Identificação e Objecto</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
                Nº de Processo / Referência *
              </label>
              <input
                type="text"
                formControlName="numeroProcesso"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] font-mono focus:border-[#1A1A1A] focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
                Província *
              </label>
              <select
                formControlName="provincia"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              >
                @for (p of provinciasList; track p) {
                  <option [value]="p">{{ p }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
                Valor Estimado (MZN) *
              </label>
              <input
                type="number"
                formControlName="valorEstimadoMZN"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] font-mono text-right focus:border-[#1A1A1A] focus:outline-none tnum"
              />
            </div>
          </div>

          <div>
            <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
              Título do Concurso *
            </label>
            <input
              type="text"
              formControlName="titulo"
              placeholder="Ex: Reabilitação da Estrada Nacional EN1 (Troço Xai-Xai a Chókwè)"
              class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] focus:border-[#1A1A1A] focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
              Objecto Detalhado da Empreitada / Fornecimento *
            </label>
            <textarea
              formControlName="objecto"
              rows="3"
              placeholder="Descreva detalhadamente o escopo, especificações e extensões da obra..."
              class="w-full p-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] focus:border-[#1A1A1A] focus:outline-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
                Troço de Estrada Associado (SIG)
              </label>
              <select
                formControlName="trocoEstradaId"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              >
                <option value="">Nenhum troço específico / Geral</option>
                @for (troco of trocosList(); track troco.id) {
                  <option [value]="troco.id">{{ troco.codigo }}: {{ troco.designacao }} ({{ troco.extensaoKm }} km)</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
                Critério de Avaliação *
              </label>
              <select
                formControlName="criterioAvaliacao"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              >
                <option value="COMBINADO">Combinado (Técnico 60% + Financeiro 40%)</option>
                <option value="MENOR_PRECO">Menor Preço Avaliado (Conforme)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section 3: Prazos e Validação de Tempo Legal -->
        <div class="space-y-4">
          <div class="border-b border-[#EFEFEC] pb-2">
            <h3 class="text-[15px] font-medium text-[#1A1A1A]">3. Prazos e Sessão de Abertura</h3>
            <p class="text-[12px] text-[#8E8D88]">O sistema valida automaticamente o prazo regulamentar do Decreto 79/2022</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
                Data e Hora Limite para Propostas *
              </label>
              <input
                type="datetime-local"
                formControlName="prazoSubmissao"
                (change)="validateMinimumDays()"
                class="w-full h-10 px-3 rounded-lg border bg-white text-[13px] focus:outline-none"
                [class]="prazoValido() ? 'border-[#E6E5E1] focus:border-[#1A1A1A]' : 'border-[#E5484D] text-[#D64545]'"
              />
              @if (!prazoValido()) {
                <p class="text-[11px] text-[#D64545] mt-1 flex items-center gap-1">
                  <span class="mat-icon text-[14px]">error</span>
                  O prazo indicado é inferior aos {{ selectedModalityInfo()?.prazoMinimoDias }} dias mínimos exigidos por lei para {{ selectedModalityInfo()?.nome }}.
                </p>
              }
            </div>

            <div>
              <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1.5">
                Data e Hora do Ato Público de Abertura *
              </label>
              <input
                type="datetime-local"
                formControlName="dataAbertura"
                class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] bg-white text-[13px] focus:border-[#1A1A1A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Section 4: Documentos de Concurso (Caderno de Encargos) -->
        <div class="space-y-4">
          <div class="border-b border-[#EFEFEC] pb-2">
            <h3 class="text-[15px] font-medium text-[#1A1A1A]">4. Peças do Concurso</h3>
            <p class="text-[12px] text-[#8E8D88]">Carregue o Caderno de Encargos, Programa de Concurso e Termos de Referência</p>
          </div>

          <app-upload-dropzone
            [files]="documentosUpload()"
            (filesChanged)="documentosUpload.set($event)"
          />
        </div>

        <!-- Submit & Actions Footer -->
        <div class="pt-4 border-t border-[#EFEFEC] flex items-center justify-end gap-3">
          <a
            routerLink="/concursos"
            class="h-10 px-4 rounded-lg border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#6B6A66] text-[13px] font-medium transition-colors inline-flex items-center"
          >
            Cancelar
          </a>

          <button
            type="submit"
            [disabled]="form.invalid || !prazoValido()"
            class="h-10 px-5 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] disabled:bg-[#EDEDEA] disabled:text-[#B8B7B1] text-[13px] font-medium transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            <span class="mat-icon text-[16px]">save</span>
            <span>Gravar e Submeter Rascunho</span>
          </button>
        </div>
      </form>
    </div>
  `
})
export class ConcursoFormComponent {
  private fb = inject(FormBuilder);
  private store = inject(LocalDataStoreService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private audit = inject(AuditService);
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

  trocosList = computed(() => this.store.trocosEstrada());

  documentosUpload = signal<UploadedFileSimulated[]>([
    {
      id: 'doc-auto-1',
      nome: 'Caderno_de_Encargos_Tecnico.pdf',
      tamanhoBytes: 3840000,
      tipoMime: 'application/pdf',
      dataUpload: new Date().toISOString()
    }
  ]);

  prazoValido = signal(true);

  // Default dates: 25 days in future (satisfies Concurso Publico 21 days)
  private defaultPrazo = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);
  private defaultAbertura = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);

  form = this.fb.nonNullable.group({
    modalidadeId: this.fb.nonNullable.control<ModalidadeId>('CONCURSO_PUBLICO', [Validators.required]),
    numeroProcesso: this.fb.nonNullable.control(`MTL/UGEA/CP-0${Math.floor(Math.random() * 80 + 10)}/2026`, [Validators.required]),
    titulo: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(10)]),
    objecto: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(20)]),
    provincia: this.fb.nonNullable.control<ProvinciaMZ>('Gaza', [Validators.required]),
    valorEstimadoMZN: this.fb.nonNullable.control(150000000, [Validators.required, Validators.min(100000)]),
    trocoEstradaId: this.fb.nonNullable.control(''),
    criterioAvaliacao: this.fb.nonNullable.control<'COMBINADO' | 'MENOR_PRECO'>('COMBINADO', [Validators.required]),
    prazoSubmissao: this.fb.nonNullable.control(this.formatDateForInput(this.defaultPrazo), [Validators.required]),
    dataAbertura: this.fb.nonNullable.control(this.formatDateForInput(this.defaultAbertura), [Validators.required])
  });

  selectedModalityInfo = computed(() => {
    const id = this.form.get('modalidadeId')?.value;
    return id ? MODALIDADES_DECRETO_79_2022[id] : null;
  });

  onModalidadeChange(): void {
    this.validateMinimumDays();
  }

  validateMinimumDays(): void {
    const modId = this.form.get('modalidadeId')?.value as ModalidadeId;
    const info = MODALIDADES_DECRETO_79_2022[modId];
    if (!info) return;

    const prazoVal = this.form.get('prazoSubmissao')?.value;
    if (!prazoVal) {
      this.prazoValido.set(false);
      return;
    }

    const prazoDate = new Date(prazoVal).getTime();
    const now = Date.now();
    const diffDays = (prazoDate - now) / (1000 * 60 * 60 * 24);

    // If diffDays < required minimum days, set invalid
    this.prazoValido.set(diffDays >= info.prazoMinimoDias);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.prazoValido()) {
      this.notification.error('Verifique os campos obrigatórios e o prazo legal.', 'Formulário Inválido');
      return;
    }

    const raw = this.form.getRawValue();
    const user = this.auth.currentUser();

    const novoConcurso: Concurso = {
      id: 'cnc-' + Math.random().toString(36).substring(2, 9),
      numeroProcesso: raw.numeroProcesso,
      titulo: raw.titulo,
      objecto: raw.objecto,
      modalidadeId: raw.modalidadeId,
      valorEstimadoMZN: Number(raw.valorEstimadoMZN),
      provincia: raw.provincia,
      prazoSubmissao: new Date(raw.prazoSubmissao).toISOString(),
      dataAbertura: new Date(raw.dataAbertura).toISOString(),
      dataCriacao: new Date().toISOString(),
      estado: 'RASCUNHO',
      criadoPorId: user?.id || 'tecnico',
      criadoPorNome: user?.name || 'Técnico UGEA',
      juriDesignadoIds: [user?.id || 'tecnico'],
      criterioAvaliacao: raw.criterioAvaliacao,
      pesoTecnico: raw.criterioAvaliacao === 'COMBINADO' ? 60 : 50,
      pesoFinanceiro: raw.criterioAvaliacao === 'COMBINADO' ? 40 : 50,
      trocoEstradaId: raw.trocoEstradaId || undefined,
      documentos: this.documentosUpload().map(d => ({
        id: d.id,
        nome: d.nome,
        tamanhoBytes: d.tamanhoBytes,
        tipoMime: d.tipoMime,
        dataUpload: d.dataUpload
      }))
    };

    this.store.saveConcurso(novoConcurso);

    await this.audit.log(
      user,
      'CRIACAO_CONCURSO',
      'CONCURSO',
      `Criação do procedimento ${novoConcurso.numeroProcesso} (${novoConcurso.titulo}) no valor de MZN ${novoConcurso.valorEstimadoMZN}`,
      novoConcurso.id
    );

    this.notification.success('Rascunho de concurso criado com sucesso pela UGEA.', 'Concurso Registado');
    this.router.navigate(['/concursos', novoConcurso.id]);
  }

  private formatDateForInput(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
