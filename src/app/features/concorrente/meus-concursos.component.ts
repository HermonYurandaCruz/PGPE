import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalDataStoreService } from '../../core/storage/local-data-store.service';
import { AuthService } from '../../core/services/auth.service';
import { AppStatusBadge } from '../../shared/ui/status-badge.component';
import { AppEmptyState } from '../../shared/ui/empty-state.component';
import { MzDatePipe, MznCurrencyPipe } from '../../shared/pipes/format.pipes';

@Component({
  selector: 'app-meus-concursos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AppStatusBadge,
    AppEmptyState,
    MzDatePipe,
    MznCurrencyPipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="text-[12px] text-[#8E8D88] font-normal mb-1">
            Portal do Concorrente • {{ auth.currentUser()?.companyName || auth.currentUser()?.name }}
          </div>
          <h1 class="text-[24px] font-medium text-[#1A1A1A] tracking-[-0.015em] leading-tight">
            Os Meus Concursos e Propostas
          </h1>
          <p class="text-[13px] text-[#6B6A66] mt-0.5">
            Acompanhe o estado das suas propostas seladas, histórico de versões e comprovativos oficiais
          </p>
        </div>

        <a
          routerLink="/concursos"
          class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
        >
          <span class="mat-icon text-[16px]">search</span>
          <span>Pesquisar Novos Concursos</span>
        </a>
      </div>

      <!-- Proposals List -->
      <div class="bg-white border border-[#E6E5E1] rounded-[12px] p-5 shadow-xs space-y-4">
        @if (minhasPropostas().length > 0) {
          <div class="overflow-x-auto rounded-[10px] border border-[#EDEDEA]">
            <table class="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr class="bg-[#F5F5F3] border-b border-[#EDEDEA] text-[#6B6A66] text-[12px]">
                  <th class="py-2.5 px-4 font-normal">Nº Processo</th>
                  <th class="py-2.5 px-4 font-normal">Título do Concurso</th>
                  <th class="py-2.5 px-4 font-normal">Ref. Proposta</th>
                  <th class="py-2.5 px-4 font-normal text-center">Versão</th>
                  <th class="py-2.5 px-4 font-normal text-right">Valor Proposto</th>
                  <th class="py-2.5 px-4 font-normal">Estado do Concurso</th>
                  <th class="py-2.5 px-4 font-normal">Data Submissão</th>
                  <th class="py-2.5 px-4 font-normal text-right">Comprovativo</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F1F1EF]">
                @for (item of minhasPropostas(); track item.proposta.id) {
                  <tr class="hover:bg-[#F8F8F6] transition-colors">
                    <td class="py-3 px-4 font-mono text-[12px] text-[#1A1A1A] whitespace-nowrap">
                      {{ item.concurso?.numeroProcesso }}
                    </td>
                    <td class="py-3 px-4 max-w-[280px]">
                      <div class="font-medium text-[#1A1A1A] truncate">
                        {{ item.concurso?.titulo }}
                      </div>
                      <div class="text-[11px] text-[#8E8D88]">
                        {{ item.concurso?.provincia }}
                      </div>
                    </td>
                    <td class="py-3 px-4 font-mono text-[12px] text-[#1A1A1A] whitespace-nowrap">
                      {{ item.proposta.codigoReferencia }}
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F1F1EF] text-[#1A1A1A]">
                        v{{ item.proposta.versao }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right font-medium text-[#1A1A1A] tnum whitespace-nowrap">
                      {{ item.proposta.valorPropostoMZN | mznCurrency }}
                    </td>
                    <td class="py-3 px-4 whitespace-nowrap">
                      @if (item.concurso) {
                        <app-status-badge [estado]="item.concurso.estado" mode="badge" />
                      }
                    </td>
                    <td class="py-3 px-4 text-[12px] text-[#6B6A66] tnum whitespace-nowrap">
                      {{ item.proposta.dataSubmissao | mzDate:true }}
                    </td>
                    <td class="py-3 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-2">
                        <a
                          [routerLink]="['/concorrente/comprovativo', item.proposta.id]"
                          class="h-7 px-2.5 rounded-md bg-[#F1F1EF] hover:bg-[#E6E5E1] text-[#1A1A1A] text-[11px] font-medium transition-colors inline-flex items-center gap-1 shadow-xs"
                        >
                          <span class="mat-icon text-[13px]">receipt</span>
                          <span>Comprovativo</span>
                        </a>

                        @if (item.concurso?.estado === 'PUBLICADO' && isPrazoAberto(item.concurso?.prazoSubmissao)) {
                          <a
                            [routerLink]="['/concorrente/submeter', item.concurso!.id]"
                            class="h-7 px-2.5 rounded-md bg-[#1A1A1A] hover:bg-[#2B2A28] text-white text-[11px] font-medium transition-colors inline-flex items-center gap-1 shadow-xs"
                          >
                            <span class="mat-icon text-[13px]">edit</span>
                            <span>Substituir</span>
                          </a>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <app-empty-state
            icon="assignment"
            title="Ainda não submeteu propostas"
            description="Consulte a lista de concursos abertos do Ministério dos Transportes e Logística e submeta a sua primeira proposta com selo criptográfico."
            actionLabel="Ver Concursos Abertos"
            [routerLink]="['/concursos']"
          />
        }
      </div>
    </div>
  `
})
export class MeusConcursosComponent {
  private store = inject(LocalDataStoreService);
  auth = inject(AuthService);

  minhasPropostas = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return [];

    // If user is Admin or Gestao, show proposals for demo visibility
    const props = user.role === 'CONCORRENTE'
      ? this.store.getPropostasPorConcorrente(user.id)
      : this.store.propostas();

    return props.map(p => ({
      proposta: p,
      concurso: this.store.getConcursoById(p.concursoId)
    }));
  });

  isPrazoAberto(prazoStr?: string): boolean {
    if (!prazoStr) return false;
    return new Date(prazoStr).getTime() > Date.now();
  }
}
