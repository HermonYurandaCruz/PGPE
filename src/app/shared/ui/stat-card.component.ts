import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatTint = 'info' | 'success' | 'warning' | 'danger' | 'violet' | 'orange';

@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="bg-white border border-[#EDEDEA] rounded-[10px] p-4 shadow-[0_1px_2px_rgba(26,26,26,0.04)] hover:border-[#D9D8D3] transition-colors flex flex-col justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0" [class]="tintClass()">
          <span class="mat-icon text-[14px] leading-none">{{ icon() }}</span>
        </div>
        <span class="text-[13px] text-[#6B6A66] font-normal leading-tight line-clamp-1">{{ label() }}</span>
      </div>

      <div class="mt-3">
        <div class="text-[26px] font-medium text-[#1A1A1A] tracking-[-0.01em] leading-8 tnum">
          {{ value() }}
        </div>
        @if (delta()) {
          <div class="text-[11px] mt-1.5 flex items-center gap-1 leading-4">
            <span [class]="deltaPositive() ? 'text-[#2E9E5B] font-medium' : 'text-[#D64545] font-medium'">
              {{ delta() }}
            </span>
            <span class="text-[#8E8D88]">{{ deltaSuffix() || 'vs período anterior' }}</span>
          </div>
        }
      </div>
    </div>
  `
})
export class AppStatCard {
  label = input.required<string>();
  value = input.required<string | number>();
  icon = input<string>('analytics');
  tint = input<StatTint>('info');
  delta = input<string | null>(null);
  deltaPositive = input<boolean>(true);
  deltaSuffix = input<string>('vs período anterior');

  tintClass(): string {
    switch (this.tint()) {
      case 'success':
        return 'bg-[#E6F6EC] text-[#2E9E5B]';
      case 'danger':
        return 'bg-[#FDE8E8] text-[#D64545]';
      case 'warning':
        return 'bg-[#FEF3E0] text-[#E8920C]';
      case 'violet':
        return 'bg-[#EFEAFB] text-[#7B5CD6]';
      case 'orange':
        return 'bg-[#FDEBE1] text-[#D9622B]';
      case 'info':
      default:
        return 'bg-[#E8EEFD] text-[#3B6FE0]';
    }
  }
}
