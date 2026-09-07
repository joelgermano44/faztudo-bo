import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../../core/features/auth/services/auth.service';

@Component({
  imports: [RouterLink],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  readonly isMenuOpen = signal(false);
  readonly currentUser = this.authService.currentUser;

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  /** Rótulo do `role` do JWT (`'admin'` -> `'Admin'`). */
  roleLabel(): string {
    const role = this.currentUser()?.role;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
  }

  logout(): void {
    this.isMenuOpen.set(false);
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isMenuOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }
}
