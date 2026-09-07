import { Admin } from '../../admins/models/admin.model';
import { Professional, ProfessionalApplicationStatus } from '../../professionals/models/professional.model';

export { ProfessionalApplicationStatus };

/** Um registo de mudança de estado da candidatura a profissional. */
export interface ProfessionalApplicationStatusHistory {
  id: number;
  professional_id: number;
  previous_status: ProfessionalApplicationStatus | null;
  status: ProfessionalApplicationStatus;
  description: string | null;
  reviewed_by_admin_id: number | null;
  reviewed_by?: Admin | null;
  created_at: string;
}

/** Corpo de `PATCH /professional-applications/:professionalId/review` e `/approve` (opcional). */
export interface ReviewNoteRequest {
  description?: string;
}

/** Corpo de `PATCH /professional-applications/:professionalId/reject`. */
export interface RejectApplicationRequest {
  description: string;
}

/** A candidatura é o próprio registo do profissional. */
export type ProfessionalApplication = Professional;
