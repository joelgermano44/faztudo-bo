import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { Header } from './components/header/header';

@Component({
  imports: [RouterOutlet, Sidebar, Header],
  selector: 'app-backoffice',
  styleUrl: './backoffice.css',
  templateUrl: './backoffice.html',
})
export class BackOffice {
  /** Estado do menu lateral em ecrãs pequenos (max-lg). Não afeta o desktop. */
  readonly isMobileSidebarOpen = signal(false);

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update((open) => !open);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }
}
