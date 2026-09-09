import { Component, input } from '@angular/core';

export interface TimelineEntry {
  label: string;
  description: string;
  date: string;
}

@Component({
  imports: [],
  selector: 'app-contract-timeline',
  styleUrl: './contract-timeline.css',
  templateUrl: './contract-timeline.html',
})
export class ContractTimeline {
  readonly items = input<TimelineEntry[]>([]);
}
