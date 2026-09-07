import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/features/auth/services/auth.service';
import { TitleHeader } from "../../layout/dashboard/components/title-header/title-header";

@Component({
  imports: [TitleHeader],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;

  /** Rótulo do `role` do JWT (`'admin'` -> `'Admin'`). */
  roleLabel(): string {
    const role = this.currentUser()?.role;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
  }
}
