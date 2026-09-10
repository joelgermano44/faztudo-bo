import { Component, HostListener, effect, input, output, signal } from '@angular/core';

export type DrawerSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<DrawerSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

/**
 * Drawer fixo à direita, padrão da aplicação: fundo com blur e painel branco
 * que desliza a partir da borda. O conteúdo é projetado via `ng-content`.
 */
@Component({
  imports: [],
  selector: 'app-drawer',
  styleUrl: './drawer.css',
  templateUrl: './drawer.html',
})
export class Drawer {
  readonly open = input(false);
  readonly title = input('');
  readonly size = input<DrawerSize>('lg');

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
        this.hideTimeout = setTimeout(() => this.rendered.set(false), 300);
      }
    });
  }

  protected sizeClass(): string {
    return SIZE_CLASSES[this.size()];
  }

  protected requestClose(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }
}
