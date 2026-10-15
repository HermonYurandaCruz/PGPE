import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(26,26,26,0.45)] backdrop-blur-[2px] transition-opacity"
        role="dialog"
        aria-modal="true"
        (click)="onBackdropClick($event)"
      >
        <div
          class="bg-white rounded-[16px] shadow-[0_12px_32px_rgba(26,26,26,0.10),0_4px_8px_rgba(26,26,26,0.04)] border border-[#E6E5E1] w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          [class]="maxWidthClass()"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="px-6 py-5 flex items-center justify-between border-b border-[#EFEFEC]">
            <div>
              <h3 class="text-[18px] font-medium text-[#1A1A1A] tracking-[-0.01em] leading-6">
                {{ title() }}
              </h3>
              @if (subtitle()) {
                <p class="text-[12px] text-[#6B6A66] mt-0.5">{{ subtitle() }}</p>
              }
            </div>
            <button
              type="button"
              (click)="closed.emit()"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B6A66] hover:bg-[#F1F1EF] hover:text-[#1A1A1A] transition-colors"
              aria-label="Fechar"
            >
              <span class="mat-icon text-[18px]">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-1 text-[13px] leading-relaxed text-[#1A1A1A]">
            <ng-content select="[modal-body]"></ng-content>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-[#FCFCFB] border-t border-[#EFEFEC] flex items-center justify-end gap-2.5">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `
})
export class AppModal {
  isOpen = input.required<boolean>();
  title = input.required<string>();
  subtitle = input<string | null>(null);
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  closed = output<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  maxWidthClass(): string {
    switch (this.size()) {
      case 'sm': return 'max-w-[420px]';
      case 'lg': return 'max-w-[760px]';
      case 'xl': return 'max-w-[960px]';
      case 'md':
      default: return 'max-w-[580px]';
    }
  }
}
