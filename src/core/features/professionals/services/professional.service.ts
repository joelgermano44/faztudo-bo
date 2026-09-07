import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddressRequest, ApiDeleteResult } from '../../../shared/models/common.model';
import { API_BASE_URL } from '../../../shared/http/api-config';
import {
  CreateAbsenceRequest,
  CreateCertificateRequest,
  CreateEducationRequest,
  CreateExperienceRequest,
  CreateProfessionalRequest,
  CreateProfessionRequest,
  Profession,
  Professional,
  ProfessionalAbsence,
  ProfessionalCertificate,
  ProfessionalEducation,
  ProfessionalExperience,
  ProfessionalWorkingHours,
  SetWorkingHoursRequest,
  SubscribeServicesRequest,
  SubscribeSingleServiceRequest,
  UpdateAvailabilityRequest,
  UpdateCertificateRequest,
  UpdateEducationRequest,
  UpdateExperienceRequest,
  UpdateProfessionalPasswordRequest,
  UpdateProfessionalRequest,
} from '../models/professional.model';

/** Constrói `multipart/form-data` a partir de um objeto simples, incluindo ficheiros. */
function toFormData<T extends object>(body: T): FormData {
  const formData = new FormData();
  Object.entries(body as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    formData.append(key, value as string | Blob);
  });
  return formData;
}

/**
 * Gestão de profissionais pelo backoffice: perfil, profissões, currículo,
 * agenda de expediente, ausências e ofertas de serviço.
 *
 * `POST /professionals/login` não está mapeado aqui, tal como o login de
 * clientes: é uma ação de sessão do próprio profissional, não uma operação de
 * gestão de dados.
 */
@Injectable({
  providedIn: 'root',
})
export class ProfessionalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/professionals`;

  // ---------------------------------------------------------------------
  // Perfil
  // ---------------------------------------------------------------------

  /** `POST /professionals/register` — regista um novo profissional. */
  create(body: CreateProfessionalRequest): Observable<Professional> {
    return this.http.post<Professional>(`${this.resource}/register`, toFormData(body));
  }

  /** `GET /professionals` — lista os profissionais. Um admin autenticado vê todos os estados. */
  findAll(): Observable<Professional[]> {
    return this.http.get<Professional[]>(this.resource);
  }

  /** `GET /professionals/nearby` — profissionais próximos de um utilizador. */
  findNearby(userUuid: string): Observable<Professional[]> {
    return this.http.get<Professional[]>(`${this.resource}/nearby`, {
      params: { user_uuid: userUuid },
    });
  }

  /** `GET /professionals/:id` — obtém um profissional pelo ID. */
  findOne(id: number): Observable<Professional> {
    return this.http.get<Professional>(`${this.resource}/${id}`);
  }

  /** `PATCH /professionals/:id` — atualiza o perfil (multipart quando inclui `image`). */
  update(id: number, body: UpdateProfessionalRequest): Observable<Professional> {
    return this.http.patch<Professional>(`${this.resource}/${id}`, toFormData(body));
  }

  /** `PATCH /professionals/:id/availability` — marca disponibilidade. */
  updateAvailability(id: number, body: UpdateAvailabilityRequest): Observable<Professional> {
    return this.http.patch<Professional>(`${this.resource}/${id}/availability`, body);
  }

  /** `DELETE /professionals/:id` — elimina o profissional. */
  remove(id: number): Observable<ApiDeleteResult> {
    return this.http.delete<ApiDeleteResult>(`${this.resource}/${id}`);
  }

  /** `PATCH /professionals/:id/updateAddress` — define ou atualiza a morada base. */
  updateAddress(id: number, body: AddressRequest): Observable<Professional> {
    return this.http.patch<Professional>(`${this.resource}/${id}/updateAddress`, body);
  }

  /** `PUT /professionals/:id/password` — altera a palavra-passe. */
  updatePassword(id: number, body: UpdateProfessionalPasswordRequest): Observable<Professional> {
    return this.http.put<Professional>(`${this.resource}/${id}/password`, body);
  }

  // ---------------------------------------------------------------------
  // Profissões (percurso profissional)
  // ---------------------------------------------------------------------

  /** `GET /professionals/:id/professions` — lista as profissões do profissional. */
  getProfessions(id: number): Observable<Profession[]> {
    return this.http.get<Profession[]>(`${this.resource}/${id}/professions`);
  }

  /** `GET /professionals/:id/professions/:professionId` — obtém uma profissão. */
  getProfession(id: number, professionId: number): Observable<Profession> {
    return this.http.get<Profession>(`${this.resource}/${id}/professions/${professionId}`);
  }

  /** `POST /professionals/:id/professions` — adiciona uma profissão. */
  addProfession(id: number, body: CreateProfessionRequest): Observable<Profession> {
    return this.http.post<Profession>(`${this.resource}/${id}/professions`, body);
  }

  /** `PATCH /professionals/:id/professions/:professionId` — atualiza uma profissão. */
  updateProfession(
    id: number,
    professionId: number,
    body: CreateProfessionRequest,
  ): Observable<Profession> {
    return this.http.patch<Profession>(`${this.resource}/${id}/professions/${professionId}`, body);
  }

  /** `DELETE /professionals/:id/professions/:professionId` — remove uma profissão. */
  removeProfession(id: number, professionId: number): Observable<Profession> {
    return this.http.delete<Profession>(`${this.resource}/${id}/professions/${professionId}`);
  }

  // ---------------------------------------------------------------------
  // Currículo (T19): formação, certificados, experiência
  // ---------------------------------------------------------------------

  /** `GET /professionals/:id/educations` */
  getEducations(id: number): Observable<ProfessionalEducation[]> {
    return this.http.get<ProfessionalEducation[]>(`${this.resource}/${id}/educations`);
  }

  /** `POST /professionals/:id/educations` */
  createEducation(id: number, body: CreateEducationRequest): Observable<ProfessionalEducation> {
    return this.http.post<ProfessionalEducation>(`${this.resource}/${id}/educations`, body);
  }

  /** `PATCH /professionals/:id/educations/:educationId` */
  updateEducation(
    id: number,
    educationId: number,
    body: UpdateEducationRequest,
  ): Observable<ProfessionalEducation> {
    return this.http.patch<ProfessionalEducation>(
      `${this.resource}/${id}/educations/${educationId}`,
      body,
    );
  }

  /** `DELETE /professionals/:id/educations/:educationId` */
  removeEducation(id: number, educationId: number): Observable<ProfessionalEducation> {
    return this.http.delete<ProfessionalEducation>(
      `${this.resource}/${id}/educations/${educationId}`,
    );
  }

  /** `GET /professionals/:id/certificates` */
  getCertificates(id: number): Observable<ProfessionalCertificate[]> {
    return this.http.get<ProfessionalCertificate[]>(`${this.resource}/${id}/certificates`);
  }

  /** `POST /professionals/:id/certificates` — multipart, imagem opcional. */
  createCertificate(
    id: number,
    body: CreateCertificateRequest,
  ): Observable<ProfessionalCertificate> {
    return this.http.post<ProfessionalCertificate>(
      `${this.resource}/${id}/certificates`,
      toFormData(body),
    );
  }

  /** `PATCH /professionals/:id/certificates/:certificateId` — multipart, imagem opcional. */
  updateCertificate(
    id: number,
    certificateId: number,
    body: UpdateCertificateRequest,
  ): Observable<ProfessionalCertificate> {
    return this.http.patch<ProfessionalCertificate>(
      `${this.resource}/${id}/certificates/${certificateId}`,
      toFormData(body),
    );
  }

  /** `DELETE /professionals/:id/certificates/:certificateId` */
  removeCertificate(id: number, certificateId: number): Observable<ProfessionalCertificate> {
    return this.http.delete<ProfessionalCertificate>(
      `${this.resource}/${id}/certificates/${certificateId}`,
    );
  }

  /** `GET /professionals/:id/experiences` */
  getExperiences(id: number): Observable<ProfessionalExperience[]> {
    return this.http.get<ProfessionalExperience[]>(`${this.resource}/${id}/experiences`);
  }

  /** `POST /professionals/:id/experiences` */
  createExperience(id: number, body: CreateExperienceRequest): Observable<ProfessionalExperience> {
    return this.http.post<ProfessionalExperience>(`${this.resource}/${id}/experiences`, body);
  }

  /** `PATCH /professionals/:id/experiences/:experienceId` */
  updateExperience(
    id: number,
    experienceId: number,
    body: UpdateExperienceRequest,
  ): Observable<ProfessionalExperience> {
    return this.http.patch<ProfessionalExperience>(
      `${this.resource}/${id}/experiences/${experienceId}`,
      body,
    );
  }

  /** `DELETE /professionals/:id/experiences/:experienceId` */
  removeExperience(id: number, experienceId: number): Observable<ProfessionalExperience> {
    return this.http.delete<ProfessionalExperience>(
      `${this.resource}/${id}/experiences/${experienceId}`,
    );
  }

  // ---------------------------------------------------------------------
  // Ofertas de serviço
  // ---------------------------------------------------------------------

  /** `POST /professionals/:id/subscribeServices` — subscreve vários serviços de uma vez. */
  subscribeServices(id: number, body: SubscribeServicesRequest): Observable<Professional> {
    return this.http.post<Professional>(`${this.resource}/${id}/subscribeServices`, body);
  }

  /** `POST /professionals/:id/subscribeServices/new` — subscreve um serviço, com imagem opcional. */
  subscribeServiceWithImage(
    id: number,
    body: SubscribeSingleServiceRequest,
  ): Observable<Professional> {
    return this.http.post<Professional>(
      `${this.resource}/${id}/subscribeServices/new`,
      toFormData(body),
    );
  }

  // ---------------------------------------------------------------------
  // Agenda de expediente e ausências
  // ---------------------------------------------------------------------

  /** `GET /professionals/:id/working-hours` */
  getWorkingHours(id: number): Observable<ProfessionalWorkingHours[]> {
    return this.http.get<ProfessionalWorkingHours[]>(`${this.resource}/${id}/working-hours`);
  }

  /** `PUT /professionals/:id/working-hours` — substitui toda a agenda semanal. */
  setWorkingHours(id: number, body: SetWorkingHoursRequest): Observable<ProfessionalWorkingHours[]> {
    return this.http.put<ProfessionalWorkingHours[]>(`${this.resource}/${id}/working-hours`, body);
  }

  /** `GET /professionals/:id/absences` */
  getAbsences(id: number): Observable<ProfessionalAbsence[]> {
    return this.http.get<ProfessionalAbsence[]>(`${this.resource}/${id}/absences`);
  }

  /** `POST /professionals/:id/absences` */
  createAbsence(id: number, body: CreateAbsenceRequest): Observable<ProfessionalAbsence> {
    return this.http.post<ProfessionalAbsence>(`${this.resource}/${id}/absences`, body);
  }

  /** `DELETE /professionals/:id/absences/:absenceId` */
  removeAbsence(id: number, absenceId: number): Observable<ProfessionalAbsence> {
    return this.http.delete<ProfessionalAbsence>(`${this.resource}/${id}/absences/${absenceId}`);
  }
}
