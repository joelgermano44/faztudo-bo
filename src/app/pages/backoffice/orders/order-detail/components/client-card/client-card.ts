import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-order-client-card',
  styleUrl: './client-card.css',
  templateUrl: './client-card.html',
})
export class ClientCard {
  readonly name = input.required<string>();
  readonly avatar = input<string | null>(null);
  readonly since = input.required<string>();
  readonly phone = input.required<string>();
  readonly email = input<string | null>(null);
  readonly location = input<string | null>(null);
}
