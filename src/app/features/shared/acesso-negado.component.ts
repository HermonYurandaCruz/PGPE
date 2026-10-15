import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acesso-negado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center max-w-[480px] mx-auto">
      <div class="w-16 h-16 rounded-full bg-[#FDE8E8] text-[#D64545] flex items-center justify-center mb-4">
        <span class="mat-icon text-[32px]">shield</span>
      </div>
      <span class="text-[12px] font-mono text-[#D64545] font-medium uppercase tracking-wider mb-1">Erro 403 • Acesso Restrito</span>
      <h1 class="text-[22px] font-medium text-[#1A1A1A] mb-2">
        Acesso Não Autorizado ao Módulo
      </h1>
      <p class="text-[13px] text-[#6B6A66] leading-relaxed mb-6">
        O seu perfil actual não tem permissões para executar esta acção ou aceder a este recurso segundo as regras de controlo de acessos (RBAC) do Decreto 79/2022.
      </p>
      <div class="flex items-center gap-3">
        <a
          routerLink="/"
          class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center shadow-xs"
        >
          Voltar à Página Inicial
        </a>
        <a
          routerLink="/admin/modo-demo"
          class="h-9 px-4 rounded-lg border border-[#E6E5E1] text-[#1A1A1A] hover:bg-[#F7F7F6] text-[13px] font-medium transition-colors inline-flex items-center shadow-xs"
        >
          Trocar de Perfil
        </a>
      </div>
    </div>
  `
})
export class AcessoNegadoComponent {}
