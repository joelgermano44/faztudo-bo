import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { Modal } from '../../../../../shared/ui/modal/modal';
import { AdminService } from '../../../../../../core/features/admins/services/admin.service';
import {
  Admin,
  CreateAdminRequest,
  UpdateAdminRequest,
} from '../../../../../../core/features/admins/models/admin.model';

/** `Admin.birthdate` vem em ISO; `<input type="date">` só aceita `YYYY-MM-DD`. */
function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

@Component({
  imports: [Modal, ReactiveFormsModule],
  selector: 'app-admin-form-modal',
  styleUrl: './admin-form-modal.css',
  templateUrl: './admin-form-modal.html',
})
export class AdminFormModal {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);

  readonly open = input(false);
  readonly admin = input<Admin | null>(null);

  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly editing = computed(() => this.admin() !== null);

  readonly saving = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    bi: ['', Validators.required],
    birthdate: ['', Validators.required],
    password: [''],
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.initializeForm(this.admin());
      }
    });
  }

  private initializeForm(admin: Admin | null): void {
    this.form.reset({
      name: admin?.name ?? '',
      email: admin?.email ?? '',
      phone: admin?.phone ?? '',
      bi: admin?.bi ?? '',
      birthdate: admin ? toDateInputValue(admin.birthdate) : '',
      password: '',
    });
    this.showPassword.set(false);
    this.saving.set(false);

    const passwordControl = this.form.controls.password;
    if (admin) {
      passwordControl.clearValidators();
    } else {
      passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
    }
    passwordControl.updateValueAndValidity();
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  requestClose(): void {
    if (this.saving()) {
      return;
    }
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const currentAdmin = this.admin();

    if (currentAdmin) {
      const body: UpdateAdminRequest = {
        name: raw.name ?? undefined,
        email: raw.email ?? undefined,
        phone: raw.phone ?? undefined,
        bi: raw.bi ?? undefined,
        birthdate: raw.birthdate ?? undefined,
      };
      if (raw.password) {
        body.password = raw.password;
      }

      this.adminService.update(currentAdmin.id, body).subscribe({
        next: () => {
          this.saving.set(false);
          toast.success('Administrador atualizado com sucesso');
          this.saved.emit();
        },
        error: (err) => {
          this.saving.set(false);
          toast.error('Não foi possível guardar o administrador', {
            description: err?.error?.message ?? 'Tente novamente mais tarde.',
          });
        },
      });
      return;
    }

    const body: CreateAdminRequest = {
      name: raw.name ?? '',
      email: raw.email ?? '',
      phone: raw.phone ?? '',
      bi: raw.bi ?? '',
      birthdate: raw.birthdate ?? '',
      password: raw.password ?? '',
    };

    this.adminService.register(body).subscribe({
      next: () => {
        this.saving.set(false);
        toast.success('Administrador criado com sucesso');
        this.saved.emit();
      },
      error: (err) => {
        this.saving.set(false);
        toast.error('Não foi possível criar o administrador', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
