import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-title-header',
  styleUrl: './title-header.css',
  templateUrl: './title-header.html',
})
export class TitleHeader {
  title = input.required<string>()
  description = input.required<string>()
}
