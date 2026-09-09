import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-dashcard',
  styleUrl: './dashcard.css',
  templateUrl: './dashcard.html',
})
export class Dashcard {
  icon = input.required<string>();
  stat = input<string>();
  title = input.required<string>();
  indicator = input.required<string>();
  money = input<boolean>();
}
