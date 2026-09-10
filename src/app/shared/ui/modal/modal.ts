import { Component, HostListener, effect, input, output, signal } from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-6xl',
};

/**
 * Modal centrado padrão da aplicação: fundo com blur, painel branco arredondado
 * e transições de entrada/saída. O conteúdo é projetado via `ng-content`.
 */
@Component({
  imports: [],
  selector: 'app-modal',
  styleUrl: './modal.css',
  templateUrl: './modal.html',
})
export class Modal {
  readonly open = input(false);
  readonly title = input('');
  readonly size = input<ModalSize>('md');
  readonly closeable = input(true);

  readonly closed = output<void>();

  protected readonly rendered = signal(false);
  protected readonly visible = signal(false);

  private hideTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      if (this.open()) {
        clearTimeout(this.hideTimeout);
        this.rendered.set(true);
        requestAnimationFrame(() => this.visible.set(true));
      } else {
        this.visible.set(false);
        this.hideTimeout = setTimeout(() => this.rendered.set(false), 200);
      }
    });
  }

  protected sizeClass(): string {
    return SIZE_CLASSES[this.size()];
  }

  protected requestClose(): void {
    if (this.closeable()) {
      this.closed.emit();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open() && this.closeable()) {
      this.closed.emit();
    }
  }
}
