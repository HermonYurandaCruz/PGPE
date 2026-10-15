import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LocalDataStoreService } from '../storage/local-data-store.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="h-16 bg-white border-b border-[#EFEFEC] px-6 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      <!-- Left: Mobile Menu Toggle + Global Search Pill -->
      <div class="flex items-center gap-3 flex-1 max-w-[520px]">
        <button
          type="button"
          (click)="menuToggle.emit()"
          class="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#6B6A66] hover:bg-[#F1F1EF] hover:text-[#1A1A1A] transition-colors"
          aria-label="Abrir Menu"
        >
          <span class="mat-icon text-[20px]">menu</span>
        </button>

        <div class="relative w-full max-w-[420px]">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8D88]">
            <span class="mat-icon text-[18px]">search</span>
          </div>
          <input
            type="text"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            (keydown.enter)="executeSearch()"
            placeholder="Pesquisar concursos, troços, contratos..."
            class="w-full h-10 pl-9 pr-14 rounded-full bg-white border border-[#E6E5E1] text-[13px] text-[#1A1A1A] placeholder-[#8E8D88] hover:border-[#D9D8D3] focus:border-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 transition-all shadow-xs"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span class="text-[10px] font-mono text-[#8E8D88] bg-[#F1F1EF] px-1.5 py-0.5 rounded border border-[#E6E5E1]">
              ↵
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Action shortcuts + Notifications + Demo badge + User avatar -->
      <div class="flex items-center gap-2.5 shrink-0">
        <!-- New Concurso button (for Tecnico/Admin) -->
        @if (auth.hasRole('TECNICO', 'ADMIN')) {
          <a
            routerLink="/concursos/novo"
            class="h-9 px-3.5 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <span class="mat-icon text-[16px]">add</span>
            <span class="hidden sm:inline">Novo Concurso</span>
          </a>
        }

        <!-- Demo Mode Shortcut -->
        <a
          routerLink="/admin/modo-demo"
          class="h-9 px-3 rounded-lg border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#6B6A66] hover:text-[#1A1A1A] text-[12px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
          title="Simular fim de prazo e repor dados"
        >
          <span class="mat-icon text-[16px] text-[#E8920C]">tune</span>
          <span class="hidden md:inline">Modo Demo</span>
        </a>

        <!-- Portal da Transparência Button -->
        <a
          routerLink="/publico"
          class="h-9 px-3 rounded-lg border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] text-[#6B6A66] hover:text-[#1A1A1A] text-[12px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
          title="Abrir Portal Público de Transparência"
        >
          <span class="mat-icon text-[16px] text-[#3B6FE0]">public</span>
          <span class="hidden md:inline">Portal Público</span>
        </a>

        <!-- Notification Bell -->
        <button
          type="button"
          (click)="triggerNotification()"
          class="w-9 h-9 rounded-lg border border-[#E6E5E1] bg-white hover:bg-[#F7F7F6] flex items-center justify-center text-[#6B6A66] hover:text-[#1A1A1A] transition-colors relative shadow-xs"
          aria-label="Notificações"
          title="Centro de Notificações"
        >
          <span class="mat-icon text-[18px]">notifications</span>
          <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E5484D]"></span>
        </button>

        <!-- User Profile Pill -->
        <div class="flex items-center gap-2 pl-2 border-l border-[#EFEFEC]">
          <div class="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[12px] font-semibold">
            {{ auth.currentUser()?.avatar || 'U' }}
          </div>
          <div class="hidden xl:block text-left">
            <div class="text-[12px] font-medium text-[#1A1A1A] leading-tight max-w-[130px] truncate">
              {{ auth.currentUser()?.name || 'Público' }}
            </div>
            <div class="text-[10px] text-[#8E8D88] leading-tight">
              {{ auth.userRole() }}
            </div>
          </div>
        </div>
      </div>
    </header>
  `
})
export class AppTopbar {
  auth = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  searchQuery = signal('');
  menuToggle = output<void>();

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  executeSearch(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/concursos'], { queryParams: { q } });
    }
  }

  triggerNotification(): void {
    this.notification.info(
      'Plataforma sincronizada com o Decreto 79/2022 do Ministério dos Transportes e Logística de Moçambique.',
      'Sistema Operacional MTL'
    );
  }
}
