import {
  ChangeDetectionStrategy,
  Component,
  signal
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSidebar } from './sidebar.component';
import { AppTopbar } from './topbar.component';
import { AppToastContainer } from '../../shared/ui/toast-container.component';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AppSidebar, AppTopbar, AppToastContainer],
  template: `
    <!-- Contratus Design System: Framed App Shell -->
    <div class="min-h-screen bg-[#E9E7E2] p-0 sm:p-3 md:p-4 lg:p-5 flex items-center justify-center font-sans antialiased text-[#1A1A1A]">
      <div class="w-full max-w-[1600px] h-screen sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-2.5rem)] bg-white sm:rounded-[16px] border sm:border-[#E6E5E1] shadow-[0_8px_40px_rgba(26,26,26,0.08)] flex overflow-hidden relative">
        <!-- Sidebar Desktop -->
        <div class="hidden lg:block h-full shrink-0">
          <app-sidebar class="h-full" />
        </div>

        <!-- Sidebar Mobile Drawer -->
        @if (mobileDrawerOpen()) {
          <div
            class="fixed inset-0 z-50 bg-[rgba(26,26,26,0.45)] lg:hidden"
            (click)="mobileDrawerOpen.set(false)"
          >
            <div
              class="w-64 h-full bg-[#F7F7F6] shadow-xl animate-in slide-in-from-left duration-200"
              (click)="$event.stopPropagation()"
            >
              <app-sidebar class="h-full" />
            </div>
          </div>
        }

        <!-- Main Content Area (Topbar + Viewport) -->
        <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
          <app-topbar (menuToggle)="mobileDrawerOpen.update(v => !v)" />

          <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white">
            <div class="max-w-[1400px] mx-auto w-full">
              <router-outlet />
            </div>
          </main>
        </div>
      </div>

      <!-- Global Toasts -->
      <app-toast-container />
    </div>
  `
})
export class AppLayout {
  mobileDrawerOpen = signal(false);
}
