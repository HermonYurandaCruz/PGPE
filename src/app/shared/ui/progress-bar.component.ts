import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="inline-flex items-center gap-2 w-full max-w-[160px]">
      @if (showPercentage()) {
        <span class="text-[12px] font-medium text-[#1A1A1A] w-9 text-right tnum shrink-0">
          {{ value() }}%
        </span>
      }
      <div class="flex-1 h-1.5 bg-[#EDEDEA] rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          [class]="barColorClass()"
          [style.width.%]="clampedValue()"
        ></div>
      </div>
    </div>
  `
})
export class AppProgressBar {
  value = input.required<number>(); // 0 to 100
  showPercentage = input<boolean>(true);
  customColor = input<string | null>(null);

  clampedValue = computed(() => Math.min(100, Math.max(0, this.value())));

  barColorClass = computed(() => {
    if (this.customColor()) return this.customColor()!;
    const val = this.clampedValue();
    if (val >= 40) return 'bg-[#34B26A]';
    if (val >= 21) return 'bg-[#F5A623]';
    return 'bg-[#E5484D]';
  });
}
