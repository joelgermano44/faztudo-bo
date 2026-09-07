import { Address, Media, Role } from '../../../shared/models/common.model';

/** Estado de disponibilidade do profissional. */
export enum ProfessionalAvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
}

/** Estado da candidatura a profissional (T18). Mantido em português, tal como a API. */
export enum ProfessionalApplicationStatus {
  SUBMETIDA = 'SUBMETIDA',
  EM_ANALISE = 'EM_ANALISE',
  APROVADA = 'APROVADA',
  REJEITADA = 'REJEITADA',
}

/** Dia da semana, em inglês e maiúsculas (alinhado com `Intl.DateTimeFormat`). */
export enum DayOfWeek {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

/** Profissão declarada por um profissional (o seu percurso). */
export interface Profession {
  id: number;
  name: string;
  start_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Corpo de `POST/PATCH /professionals/:id/professions[/:professionId]`. */
export interface CreateProfessionRequest {
  name: string;
  start_date: string;
}

/** Formação académica do currículo (T19). */
export interface ProfessionalEducation {
  id: number;
  professional_id: number;
  institution: string;
  course: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateEducationRequest {
  institution: string;
  course: string;
  start_date: string;
  end_date?: string;
}

export type UpdateEducationRequest = Partial<CreateEducationRequest>;

/** Certificado do currículo (T19), com imagem opcional. */
export interface ProfessionalCertificate {
  id: number;
  professional_id: number;
  name: string;
  issuing_institution: string;
  issue_date: string;
  expiry_date: string | null;
  image: Media | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateCertificateRequest {
  name: string;
  issuing_institution: string;
  issue_date: string;
  expiry_date?: string;
  /** Imagem do certificado. Enviada em `multipart/form-data`. */
  image?: File;
}

export type UpdateCertificateRequest = Partial<CreateCertificateRequest>;

/** Experiência profissional do currículo (T19). */
export interface ProfessionalExperience {
  id: number;
  professional_id: number;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateExperienceRequest {
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export type UpdateExperienceRequest = Partial<CreateExperienceRequest>;

/** Um intervalo de expediente semanal. */
export interface ProfessionalWorkingHours {
  id: number;
  professional_id: number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
}

export interface WorkingHoursEntry {
  day_of_week: DayOfWeek;
  /** Formato `HH:mm`. */
  start_time: string;
  /** Formato `HH:mm`. */
  end_time: string;
}

/** Corpo de `PUT /professionals/:id/working-hours` — substitui toda a agenda. */
export interface SetWorkingHoursRequest {
  entries: WorkingHoursEntry[];
}

/** Um período de ausência (férias, doença, etc.). */
export interface ProfessionalAbsence {
  id: number;
  professional_id: number;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

export interface CreateAbsenceRequest {
  start_date: string;
  end_date: string;
  reason?: string;
}

/** Oferta de um profissional para um serviço do catálogo (preço próprio). */
export interface ProfessionalServiceOffering {
  professional_id: number;
  service_id: number;
  price: number;
  travel_price: number;
  image_filename: string | null;
  created_at: string;
  updated_at: string | null;
}

/** Um serviço a subscrever, com o preço do profissional. */
export interface SubscribedService {
  service_id: number;
  price: number;
  travel_price?: number;
}

/** Corpo de `POST /professionals/:id/subscribeServices`. */
export interface SubscribeServicesRequest {
  services: SubscribedService[];
}

/** Corpo de `POST /professionals/:id/subscribeServices/new` (multipart, imagem opcional). */
export interface SubscribeSingleServiceRequest {
  service_id: number;
  price: number;
  travel_price?: number;
  image?: File;
}

/** Profissional da plataforma. */
export interface Professional {
  id: number;
  username: string;
  image: string | null;
  name: string;
  email: string;
  bi: string;
  phone: string;
  birthdate: string;
  role: Role;
  nif: string | null;
  about_me: string | null;
  availability_status: ProfessionalAvailabilityStatus;
  application_status: ProfessionalApplicationStatus;
  average_rating: number | null;
  ratings_count: number;
  address: Address | null;
  professions: Profession[];
  educations: ProfessionalEducation[];
  certificates: ProfessionalCertificate[];
  experiences: ProfessionalExperience[];
  serviceOfferings: ProfessionalServiceOffering[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Corpo de `POST /professionals/register` (multipart quando inclui `image`). */
export interface CreateProfessionalRequest {
  name: string;
  bi: string;
  nif?: string;
  email: string;
  phone: string;
  birthdate: string;
  password: string;
  about_me: string;
  address_id: number;
  image?: File;
}

/** Corpo de `PATCH /professionals/:id`. Todos os campos são opcionais. */
export type UpdateProfessionalRequest = Partial<Omit<CreateProfessionalRequest, 'password'>>;

/** Corpo de `PATCH /professionals/:id/availability`. */
export interface UpdateAvailabilityRequest {
  status: ProfessionalAvailabilityStatus;
}

/** Corpo de `PUT /professionals/:id/password`. */
export interface UpdateProfessionalPasswordRequest {
  current_password: string;
  new_password: string;
}
