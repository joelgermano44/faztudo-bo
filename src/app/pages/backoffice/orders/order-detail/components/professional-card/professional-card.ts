import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-order-professional-card',
  styleUrl: './professional-card.css',
  templateUrl: './professional-card.html',
})
export class ProfessionalCard {
  readonly name = input.required<string>();
  readonly avatar = input<string | null>(null);
  readonly profession = input.required<string>();
  readonly rating = input<number | null>(null);
  readonly phone = input.required<string>();
}
