import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nao-encontrado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center max-w-[480px] mx-auto">
      <div class="w-16 h-16 rounded-full bg-[#F1F1EF] text-[#6B6A66] flex items-center justify-center mb-4">
        <span class="mat-icon text-[32px]">search_off</span>
      </div>
      <span class="text-[12px] font-mono text-[#8E8D88] font-medium uppercase tracking-wider mb-1">Erro 404 • Não Encontrado</span>
      <h1 class="text-[22px] font-medium text-[#1A1A1A] mb-2">
        Página ou Recurso Inexistente
      </h1>
      <p class="text-[13px] text-[#6B6A66] leading-relaxed mb-6">
        O procedimento, contrato ou página que procura não existe ou foi removido da plataforma oficial do MTL.
      </p>
      <a
        routerLink="/"
        class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center shadow-xs"
      >
        Voltar à Página Principal
      </a>
    </div>
  `
})
export class NaoEncontradoComponent {}
