import { Component, input } from '@angular/core';

/** Barra "shimmer" reutilizável para estados de carregamento (skeletons). */
@Component({
  selector: 'app-skeleton',
  template: `
    <div
      class="animate-pulse rounded-md bg-[#E6E9E8]"
      [style.width]="width()"
      [style.height]="height()"
    ></div>
  `,
})
export class Skeleton {
  readonly width = input('100%');
  readonly height = input('1rem');
}
