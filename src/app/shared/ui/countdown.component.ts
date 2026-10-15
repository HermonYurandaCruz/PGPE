import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  input,
  signal
} from '@angular/core';

@Component({
  selector: 'app-countdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    @if (isExpired()) {
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDE8E8] text-[#D64545] border border-[#F6C5C5] text-[12px] font-medium">
        <span class="mat-icon text-[15px]">timer_off</span>
        <span>Prazo Encerrado</span>
      </div>
    } @else {
      <div class="inline-flex items-center gap-2 p-1.5 px-3 rounded-full border text-[12px]" [class]="containerClasses()">
        <span class="mat-icon text-[15px] shrink-0" [class]="iconColorClass()">alarm</span>
        <div class="flex items-center gap-1.5 font-medium tnum tracking-tight">
          @if (days() > 0) {
            <span>{{ days() }}d</span>
            <span class="text-[#B8B7B1]">:</span>
          }
          <span>{{ pad(hours()) }}h</span>
          <span class="text-[#B8B7B1]">:</span>
          <span>{{ pad(minutes()) }}m</span>
          <span class="text-[#B8B7B1]">:</span>
          <span>{{ pad(seconds()) }}s</span>
        </div>
        <span class="text-[10px] uppercase font-semibold tracking-wider text-[#8E8D88] ml-0.5">restantes</span>
      </div>
    }
  `
})
export class AppCountdown implements OnDestroy {
  targetDate = input.required<string>(); // ISO string
  private now = signal(Date.now());
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.timerId = setInterval(() => {
        this.now.set(Date.now());
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private diffMs = computed(() => {
    const target = new Date(this.targetDate()).getTime();
    return target - this.now();
  });

  isExpired = computed(() => this.diffMs() <= 0);

  days = computed(() => Math.max(0, Math.floor(this.diffMs() / (1000 * 60 * 60 * 24))));
  hours = computed(() => Math.max(0, Math.floor((this.diffMs() / (1000 * 60 * 60)) % 24)));
  minutes = computed(() => Math.max(0, Math.floor((this.diffMs() / 1000 / 60) % 60)));
  seconds = computed(() => Math.max(0, Math.floor((this.diffMs() / 1000) % 60)));

  isUrgent = computed(() => !this.isExpired() && this.days() === 0);

  containerClasses = computed(() => {
    if (this.isUrgent()) {
      return 'bg-[#FEF3E0] border-[#F8D9A6] text-[#E8920C]';
    }
    return 'bg-[#F7F7F6] border-[#E6E5E1] text-[#1A1A1A]';
  });

  iconColorClass = computed(() => {
    if (this.isUrgent()) return 'text-[#E8920C]';
    return 'text-[#6B6A66]';
  });

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
