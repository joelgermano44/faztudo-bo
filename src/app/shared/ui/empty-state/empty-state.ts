import { Component, input, output } from '@angular/core';

export type EmptyStateVariant = 'empty' | 'error' | 'search';

/**
 * Estado vazio unificado: usado tanto para "sem dados" como para "falhou o
 * carregamento" (com retry), para que nenhuma lista fique apenas em branco
 * sem explicação ao utilizador.
 */
@Component({
  selector: 'app-empty-state',
  imports: [],
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
      <div
        class="flex h-14 w-14 items-center justify-center rounded-full"
        [class.bg-red-50]="variant() === 'error'"
        [class.bg-tertiary]="variant() !== 'error'"
      >
        @switch (variant()) {
          @case ('error') {
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                stroke="#DC2626"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
          @case ('search') {
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35"
                stroke="#41493D"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
          @default {
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2M4 7l1.5 12.15A2 2 0 0 0 7.49 21h9.02a2 2 0 0 0 1.99-1.85L20 7M4 7h16M9 11h6"
                stroke="#41493D"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
        }
      </div>

      <div class="flex flex-col gap-1">
        <p class="text-sm font-semibold text-[#191C1D]">{{ title() }}</p>
        @if (description()) {
          <p class="max-w-80 text-sm text-[#727970]">{{ description() }}</p>
        }
      </div>

      @if (actionLabel()) {
        <button
          type="button"
          (click)="action.emit()"
          class="mt-1 cursor-pointer rounded-full border border-[#C0C8C6]/60 px-5 py-2 text-sm font-semibold text-[#41493D] transition-all duration-300 hover:bg-gray-100"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyState {
  readonly variant = input<EmptyStateVariant>('empty');
  readonly title = input.required<string>();
  readonly description = input('');
  readonly actionLabel = input<string | null>(null);

  readonly action = output<void>();
}
