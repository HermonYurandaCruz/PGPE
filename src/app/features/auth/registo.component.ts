import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-[640px] mx-auto py-6 space-y-6">
      <div>
        <nav class="text-[12px] text-[#8E8D88] mb-1 flex items-center gap-1.5">
          <a routerLink="/auth/login" class="hover:underline">Entrar</a>
          <span>/</span>
          <span class="text-[#1A1A1A]">Registo de Concorrente</span>
        </nav>
        <h1 class="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
          Cadastro Oficial de Empresa Concorrente
        </h1>
        <p class="text-[13px] text-[#6B6A66] mt-0.5">
          Habilitação de operador económico para contratação pública electrónica (Decreto 79/2022)
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white border border-[#EDEDEA] rounded-[16px] p-6 shadow-xs space-y-4">
        <div>
          <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">
            Designação Social / Denominação Comercial *
          </label>
          <input
            type="text"
            formControlName="companyName"
            placeholder="Ex: Empreiteiros Unidos de Moçambique, S.A."
            class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] focus:outline-none focus:border-[#1A1A1A]"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">
              NUIT (Número Único de Identificação Tributária) *
            </label>
            <input
              type="text"
              formControlName="nuit"
              placeholder="Ex: 400987654 (9 dígitos)"
              class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] font-mono text-[13px] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <div>
            <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">
              Dimensão da Empresa *
            </label>
            <select
              formControlName="companyType"
              class="w-full h-10 px-2.5 rounded-lg border border-[#E6E5E1] bg-white text-[13px] text-[#1A1A1A] focus:outline-none"
            >
              <option value="MICRO">Microempresa</option>
              <option value="PEQUENA">Pequena Empresa</option>
              <option value="MEDIA">Média Empresa</option>
              <option value="GRANDE">Grande Empresa</option>
              <option value="SINGULAR">Empresário em Nome Singular</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">
              Email Institucional de Contacto *
            </label>
            <input
              type="email"
              formControlName="email"
              placeholder="concursos@empresa.co.mz"
              class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <div>
            <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">
              Telefone de Contacto *
            </label>
            <input
              type="text"
              formControlName="telefone"
              placeholder="+258 84 000 0000"
              class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
        </div>

        <div>
          <label class="block text-[12px] font-medium text-[#1A1A1A] mb-1">
            Área de Actividade Principal *
          </label>
          <input
            type="text"
            formControlName="areaActividade"
            placeholder="Ex: Empreitada de Obras Públicas, Pavimentação Asfáltica e Terraplanagens"
            class="w-full h-10 px-3 rounded-lg border border-[#E6E5E1] text-[13px] focus:outline-none focus:border-[#1A1A1A]"
          />
        </div>

        <div class="pt-4 border-t border-[#EFEFEC] flex items-center justify-between">
          <a routerLink="/auth/login" class="text-[12px] text-[#6B6A66] hover:underline">
            Já possui cadastro? Entrar
          </a>

          <button
            type="submit"
            [disabled]="form.invalid"
            class="h-10 px-5 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] disabled:bg-[#EDEDEA] disabled:text-[#B8B7B1] text-[13px] font-medium transition-colors cursor-pointer shadow-xs"
          >
            Concluir Registo Oficial
          </button>
        </div>
      </form>
    </div>
  `
})
export class AuthRegistoComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    companyName: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    nuit: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]),
    companyType: this.fb.nonNullable.control<'SINGULAR' | 'MICRO' | 'PEQUENA' | 'MEDIA' | 'GRANDE'>('MEDIA', [Validators.required]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    telefone: this.fb.nonNullable.control('+258 ', [Validators.required]),
    areaActividade: this.fb.nonNullable.control('Construção Civil e Obras Rodoviárias', [Validators.required])
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    await this.auth.registerCompetitor({
      name: raw.companyName,
      companyName: raw.companyName,
      email: raw.email,
      nuit: raw.nuit,
      companyType: raw.companyType,
      areaActividade: raw.areaActividade,
      telefone: raw.telefone
    });

    this.router.navigate(['/concorrente/meus-concursos']);
  }
}
