import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-service-details',
  styleUrl: './service-details.css',
  templateUrl: './service-details.html',
})
export class ServiceDetails {
  readonly modalityLabel = input.required<string>();
  readonly scheduledDate = input.required<string>();
  readonly description = input.required<string>();
}
