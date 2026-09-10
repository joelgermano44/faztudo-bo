import { Component, HostListener, effect, input, output, signal } from '@angular/core';

/**
 * Visualizador de imagens em ecrã inteiro (lightbox), padrão da aplicação.
 * Recebe a lista de imagens e o índice inicial; navega com setas do teclado
 * ou pelos botões, quando há mais do que uma imagem.
 */
@Component({
  imports: [],
  selector: 'app-image-viewer',
  styleUrl: './image-viewer.css',
  templateUrl: './image-viewer.html',
})
export class ImageViewer {
  readonly open = input(false);
  readonly images = input<string[]>([]);
  readonly startIndex = input(0);
  readonly alt = input('');

  readonly closed = output<void>();

  protected readonly rendered = signal(false);
  protected readonly visible = signal(false);
  protected readonly index = signal(0);

  private hideTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.index.set(this.startIndex());
        clearTimeout(this.hideTimeout);
        this.rendered.set(true);
        requestAnimationFrame(() => this.visible.set(true));
      } else {
        this.visible.set(false);
        this.hideTimeout = setTimeout(() => this.rendered.set(false), 200);
      }
    });
  }

  protected requestClose(): void {
    this.closed.emit();
  }

  protected next(): void {
    const total = this.images().length;
    this.index.update((current) => (current + 1) % total);
  }

  protected previous(): void {
    const total = this.images().length;
    this.index.update((current) => (current - 1 + total) % total);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }

  @HostListener('document:keydown.arrowright')
  protected onArrowRight(): void {
    if (this.open() && this.images().length > 1) {
      this.next();
    }
  }

  @HostListener('document:keydown.arrowleft')
  protected onArrowLeft(): void {
    if (this.open() && this.images().length > 1) {
      this.previous();
    }
  }
}
