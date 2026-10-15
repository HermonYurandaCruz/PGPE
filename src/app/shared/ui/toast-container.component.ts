import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 max-w-[380px] w-full pointer-events-none no-print">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto bg-white border border-[#E6E5E1] rounded-[10px] p-3.5 shadow-[0_4px_12px_rgba(26,26,26,0.08),0_2px_4px_rgba(26,26,26,0.04)] flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200"
          role="alert"
        >
          <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" [class]="iconBgClass(toast.type)">
            <span class="mat-icon text-[14px] leading-none">{{ iconName(toast.type) }}</span>
          </div>

          <div class="flex-1 min-w-0">
            @if (toast.title) {
              <h5 class="text-[13px] font-medium text-[#1A1A1A] leading-tight mb-0.5">
                {{ toast.title }}
              </h5>
            }
            <p class="text-[12px] text-[#6B6A66] leading-snug">
              {{ toast.message }}
            </p>
          </div>

          <button
            type="button"
            (click)="notificationService.remove(toast.id)"
            class="text-[#8E8D88] hover:text-[#1A1A1A] p-0.5 rounded transition-colors shrink-0"
            aria-label="Fechar notificação"
          >
            <span class="mat-icon text-[16px]">close</span>
          </button>
        </div>
      }
    </div>
  `
})
export class AppToastContainer {
  notificationService = inject(NotificationService);

  iconName(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info':
      default: return 'info';
    }
  }

  iconBgClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-[#E6F6EC] text-[#2E9E5B]';
      case 'error': return 'bg-[#FDE8E8] text-[#D64545]';
      case 'warning': return 'bg-[#FEF3E0] text-[#E8920C]';
      case 'info':
      default: return 'bg-[#E8EEFD] text-[#3B6FE0]';
    }
  }
}
