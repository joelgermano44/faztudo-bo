import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { AuthService } from '../../../../core/features/auth/services/auth.service';
import { AdminService } from '../../../../core/features/admins/services/admin.service';
import { API_BASE_URL } from '../../../../core/shared/http/api-config';
import { buildAvatarUrl } from '../../../../core/shared/util/media-url';

/** `Admin.birthdate` vem em ISO; `<input type="date">` só aceita `YYYY-MM-DD`. */
function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

@Component({
  imports: [TitleHeader, ReactiveFormsModule],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly currentUser = this.authService.currentUser;
  readonly saving = signal(false);
  readonly showPassword = signal(false);

  readonly memberSince = computed(() => {
    const user = this.currentUser();
    return user ? formatDate(user.created_at) : '';
  });

  readonly lastUpdatedAt = computed(() => {
    const user = this.currentUser();
    return user ? formatDateTime(user.updated_at) : '';
  });

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    bi: ['', Validators.required],
    birthdate: ['', Validators.required],
    image: [''],
    password: ['', [Validators.minLength(6)]],
  });

  readonly previewAvatar = computed(() => {
    const image = this.form.controls.image.value;
    return image ? buildAvatarUrl(this.baseUrl, 'admins', image) : null;
  });

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    const user = this.currentUser();
    this.form.reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      bi: user?.bi ?? '',
      birthdate: user ? toDateInputValue(user.birthdate) : '',
      image: user?.image ?? '',
      password: '',
    });
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  submit(): void {
    const user = this.currentUser();
    if (!user || this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const body = {
      name: raw.name ?? undefined,
      email: raw.email ?? undefined,
      phone: raw.phone ?? undefined,
      bi: raw.bi ?? undefined,
      birthdate: raw.birthdate ?? undefined,
      image: raw.image || null,
      ...(raw.password ? { password: raw.password } : {}),
    };

    this.adminService.update(user.id, body).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.authService.updateCurrentUser(updated);
        this.form.patchValue({ password: '' });
        toast.success('Perfil atualizado com sucesso');
      },
      error: (err) => {
        this.saving.set(false);
        toast.error('Não foi possível guardar as alterações', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
