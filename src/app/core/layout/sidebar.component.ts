import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LocalDataStoreService } from '../storage/local-data-store.service';
import { User, UserRole } from '../../shared/models/auth.models';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: UserRole[];
  badge?: () => number;
}

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-60 h-full bg-[#F7F7F6] border-r border-[#EFEFEC] flex flex-col justify-between p-3 select-none shrink-0 overflow-y-auto">
      <div class="space-y-4">
        <!-- Workspace Switcher Header -->
        <div class="h-12 p-2 rounded-[10px] bg-white border border-[#E6E5E1] flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-[8px] bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-[12px] tracking-wider shrink-0">
              MTL
            </div>
            <div class="min-w-0">
              <h4 class="text-[13px] font-medium text-[#1A1A1A] leading-tight truncate">
                MTL Moçambique
              </h4>
              <p class="text-[10px] text-[#8E8D88] leading-tight truncate">
                e-Procurement Dec. 79/2022
              </p>
            </div>
          </div>
          <span class="mat-icon text-[#8E8D88] text-[18px]">verified</span>
        </div>

        <!-- Quick Demo Role Switcher Badge -->
        <div class="p-2.5 bg-white border border-[#EDEDEA] rounded-[10px] shadow-xs">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-medium uppercase tracking-wider text-[#8E8D88]">Perfil Activo</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full font-medium" [class]="roleBadgeClass()">
              {{ auth.userRole() }}
            </span>
          </div>

          <div class="text-[12px] font-medium text-[#1A1A1A] truncate mb-2">
            {{ auth.currentUser()?.name || 'Portal Público' }}
          </div>

          <!-- Fast Role Switch buttons for demo seamless testing -->
          <div class="grid grid-cols-2 gap-1 text-[11px]">
            <button
              type="button"
              (click)="switchRole('GESTAO')"
              class="h-6 px-1.5 rounded-[6px] border text-left truncate transition-colors"
              [class]="auth.userRole() === 'GESTAO' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#F7F7F6] text-[#6B6A66] border-[#E6E5E1] hover:bg-[#EDEDEA]'"
            >
              Gestão
            </button>
            <button
              type="button"
              (click)="switchRole('TECNICO')"
              class="h-6 px-1.5 rounded-[6px] border text-left truncate transition-colors"
              [class]="auth.userRole() === 'TECNICO' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#F7F7F6] text-[#6B6A66] border-[#E6E5E1] hover:bg-[#EDEDEA]'"
            >
              Técnico
            </button>
            <button
              type="button"
              (click)="switchRole('CONCORRENTE')"
              class="h-6 px-1.5 rounded-[6px] border text-left truncate transition-colors"
              [class]="auth.userRole() === 'CONCORRENTE' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#F7F7F6] text-[#6B6A66] border-[#E6E5E1] hover:bg-[#EDEDEA]'"
            >
              Concorrente
            </button>
            <button
              type="button"
              (click)="switchRole('ADMIN')"
              class="h-6 px-1.5 rounded-[6px] border text-left truncate transition-colors"
              [class]="auth.userRole() === 'ADMIN' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#F7F7F6] text-[#6B6A66] border-[#E6E5E1] hover:bg-[#EDEDEA]'"
            >
              Admin
            </button>
          </div>
        </div>

        <!-- Navigation Section -->
        <div>
          <div class="px-3 py-1.5 text-[11px] font-medium text-[#8E8D88] uppercase tracking-wider">
            Navegação Principal
          </div>
          <nav class="space-y-1">
            @for (item of filteredNavItems(); track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-white text-[#1A1A1A] font-medium border border-[#E6E5E1] shadow-[0_2px_8px_rgba(26,26,26,0.06),0_0_0_1px_#E6E5E1]"
                [routerLinkActiveOptions]="{ exact: item.route === '/' || item.route === '/dashboard' }"
                class="h-9 px-3 rounded-full flex items-center justify-between text-[13px] text-[#6B6A66] hover:text-[#1A1A1A] hover:bg-[#F1F1EF] transition-all cursor-pointer group"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="mat-icon text-[18px] text-[#8E8D88] group-hover:text-[#1A1A1A] transition-colors leading-none">
                    {{ item.icon }}
                  </span>
                  <span class="truncate">{{ item.label }}</span>
                </div>
                @if (item.badge && item.badge() > 0) {
                  <span class="text-[11px] px-1.5 py-0.2 rounded-full bg-[#EDEDEA] text-[#6B6A66] font-medium group-hover:bg-[#E6E5E1]">
                    {{ item.badge() }}
                  </span>
                }
              </a>
            }
          </nav>
        </div>

        <!-- Section: Pinned/Special modules -->
        <div>
          <div class="px-3 py-1.5 text-[11px] font-medium text-[#8E8D88] uppercase tracking-wider flex items-center justify-between">
            <span>SIG e Indicadores</span>
          </div>
          <nav class="space-y-1">
            <a
              routerLink="/mapa"
              routerLinkActive="bg-white text-[#1A1A1A] font-medium border border-[#E6E5E1] shadow-xs"
              class="h-9 px-3 rounded-full flex items-center gap-2.5 text-[13px] text-[#6B6A66] hover:text-[#1A1A1A] hover:bg-[#F1F1EF] transition-all cursor-pointer"
            >
              <div class="w-4 h-4 rounded-[4px] bg-[#34B26A] flex items-center justify-center text-white text-[10px]">
                <span class="mat-icon text-[11px]">map</span>
              </div>
              <span class="truncate">Mapa de Estradas SIG</span>
            </a>

            <a
              routerLink="/dashboard"
              routerLinkActive="bg-white text-[#1A1A1A] font-medium border border-[#E6E5E1] shadow-xs"
              class="h-9 px-3 rounded-full flex items-center gap-2.5 text-[13px] text-[#6B6A66] hover:text-[#1A1A1A] hover:bg-[#F1F1EF] transition-all cursor-pointer"
            >
              <div class="w-4 h-4 rounded-[4px] bg-[#4C7DF0] flex items-center justify-center text-white text-[10px]">
                <span class="mat-icon text-[11px]">monitoring</span>
              </div>
              <span class="truncate">Dashboard Executivo</span>
            </a>

            <a
              routerLink="/publico"
              routerLinkActive="bg-white text-[#1A1A1A] font-medium border border-[#E6E5E1] shadow-xs"
              class="h-9 px-3 rounded-full flex items-center gap-2.5 text-[13px] text-[#6B6A66] hover:text-[#1A1A1A] hover:bg-[#F1F1EF] transition-all cursor-pointer"
            >
              <div class="w-4 h-4 rounded-[4px] bg-[#8B6DE3] flex items-center justify-center text-white text-[10px]">
                <span class="mat-icon text-[11px]">public</span>
              </div>
              <span class="truncate">Portal da Transparência</span>
            </a>
          </nav>
        </div>
      </div>

      <!-- Footer User Profile -->
      <div class="pt-3 border-t border-[#EFEFEC]">
        <div class="flex items-center justify-between p-1.5 rounded-[10px] hover:bg-[#F1F1EF] transition-colors">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-7 h-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
              {{ auth.currentUser()?.avatar || 'U' }}
            </div>
            <div class="min-w-0">
              <div class="text-[12px] font-medium text-[#1A1A1A] truncate">
                {{ auth.currentUser()?.name || 'Modo Público' }}
              </div>
              <div class="text-[10px] text-[#8E8D88] truncate">
                {{ auth.currentUser()?.email || 'Acesso Livre' }}
              </div>
            </div>
          </div>
          <button
            type="button"
            (click)="auth.logout()"
            class="text-[#8E8D88] hover:text-[#D64545] p-1 rounded-md transition-colors"
            title="Terminar sessão"
          >
            <span class="mat-icon text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  `
})
export class AppSidebar {
  auth = inject(AuthService);
  private store = inject(LocalDataStoreService);
  private router = inject(Router);

  navItems: NavItem[] = [
    {
      label: 'Visão Geral',
      route: '/',
      icon: 'dashboard'
    },
    {
      label: 'Concursos',
      route: '/concursos',
      icon: 'gavel',
      badge: () => this.store.concursos().filter(c => c.estado === 'PUBLICADO').length
    },
    {
      label: 'Meus Concursos',
      route: '/concorrente/meus-concursos',
      icon: 'assignment',
      roles: ['CONCORRENTE', 'ADMIN', 'GESTAO']
    },
    {
      label: 'Contratos e Obras',
      route: '/contratos',
      icon: 'description',
      badge: () => this.store.contratos().filter(c => c.estado === 'VIGENTE').length
    },
    {
      label: 'Utilizadores',
      route: '/admin/utilizadores',
      icon: 'people',
      roles: ['ADMIN']
    },
    {
      label: 'Auditoria Oficial',
      route: '/admin/auditoria',
      icon: 'history_edu',
      roles: ['ADMIN', 'GESTAO']
    },
    {
      label: 'Modo Demonstração',
      route: '/admin/modo-demo',
      icon: 'tune',
      roles: ['ADMIN', 'GESTAO', 'TECNICO']
    }
  ];

  filteredNavItems = computed(() => {
    const role = this.auth.userRole();
    return this.navItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(role);
    });
  });

  roleBadgeClass = computed(() => {
    switch (this.auth.userRole()) {
      case 'ADMIN': return 'bg-[#FDE8E8] text-[#D64545]';
      case 'GESTAO': return 'bg-[#E8EEFD] text-[#3B6FE0]';
      case 'TECNICO': return 'bg-[#FEF3E0] text-[#E8920C]';
      case 'CONCORRENTE': return 'bg-[#E6F6EC] text-[#2E9E5B]';
      default: return 'bg-[#F1F1EF] text-[#6B6A66]';
    }
  });

  async switchRole(role: UserRole): Promise<void> {
    const users = this.store.users();
    const target = users.find(u => u.role === role);
    if (target) {
      await this.auth.loginAs(target);
    }
  }
}
