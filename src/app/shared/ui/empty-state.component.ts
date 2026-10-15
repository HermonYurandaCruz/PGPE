import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="flex flex-col items-center justify-center p-12 text-center">
      <div class="w-14 h-14 rounded-full bg-[#F1F1EF] border border-[#E6E5E1] flex items-center justify-center text-[#6B6A66] mb-3.5">
        <span class="mat-icon text-[28px]">{{ icon() }}</span>
      </div>
      <h4 class="text-[14px] font-medium text-[#1A1A1A] mb-1">
        {{ title() }}
      </h4>
      <p class="text-[13px] text-[#6B6A66] max-w-[320px] leading-relaxed mb-4">
        {{ description() }}
      </p>
      @if (actionLabel()) {
        <button
          type="button"
          (click)="actionClicked.emit()"
          class="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2B2A28] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5"
        >
          @if (actionIcon()) {
            <span class="mat-icon text-[16px]">{{ actionIcon() }}</span>
          }
          {{ actionLabel() }}
        </button>
      }
    </div>
  `
})
export class AppEmptyState {
  icon = input<string>('inbox');
  title = input<string>('Sem dados para apresentar');
  description = input<string>('Não foram encontrados registos correspondentes aos critérios seleccionados.');
  actionLabel = input<string | null>(null);
  actionIcon = input<string | null>(null);
  actionClicked = output<void>();
}
