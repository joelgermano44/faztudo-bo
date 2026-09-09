import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-order-client-card',
  styleUrl: './client-card.css',
  templateUrl: './client-card.html',
})
export class ClientCard {
  readonly name = input.required<string>();
  readonly avatar = input<string | null>(null);
  readonly since = input.required<string>();
  readonly phone = input.required<string>();
  readonly location = input<string | null>(null);
}
