import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface TabPillItem {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

@Component({
  selector: 'app-tabs-pill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="inline-flex items-center bg-[#F1F1EF] border border-[#EDEDEA] rounded-full p-1 gap-0.5 overflow-x-auto max-w-full">
      @for (tab of tabs(); track tab.id) {
        <button
          type="button"
          (click)="tabSelected.emit(tab.id)"
          class="h-7 px-3.5 rounded-full text-[12px] font-medium transition-all inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none"
          [class]="activeTab() === tab.id
            ? 'bg-[#1A1A1A] text-white shadow-xs'
            : 'text-[#6B6A66] hover:text-[#1A1A1A] hover:bg-white/40'"
        >
          @if (tab.icon) {
            <span class="mat-icon text-[14px] leading-none">{{ tab.icon }}</span>
          }
          <span>{{ tab.label }}</span>
          @if (tab.count !== undefined) {
            <span
              class="text-[11px] px-1.5 py-0.2 rounded-full font-normal"
              [class]="activeTab() === tab.id ? 'bg-white/20 text-white' : 'bg-[#E6E5E1] text-[#6B6A66]'"
            >
              {{ tab.count }}
            </span>
          }
        </button>
      }
    </div>
  `
})
export class AppTabsPill {
  tabs = input.required<TabPillItem[]>();
  activeTab = input.required<string>();
  tabSelected = output<string>();
}
