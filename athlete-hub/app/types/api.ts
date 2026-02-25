// Rappresenta l'oggetto Error del tuo backend .NET
export interface ApiError {
  code: string;
  message: string;
  description?: string;
}

// Rappresenta esattamente il tuo Result<T> C#
export interface Result<T> {
  isSuccess: boolean;
  value: T | null;
  error: ApiError | null;
}

export interface UserSignInResponse {
  accessToken: string;
  refreshToken: string;
}
// DTO per la richiesta di registrazione
export interface UserSignUpRequest {
  email: string
  password?: string
  codeId?: string | null
}

// DTO per la risposta di registrazione (mappa il tuo UserSignUpResponse C#)
export interface UserSignUpResponse {
  id: number;
  userName: string;
  email: string;
  role: number; // O una stringa se usi l'enum come stringa
  accessToken: string;
  refreshToken: string;
  apiKey: string;
}

// DTO per il profilo utente (quello che restituisce GetProfile)
export interface UserProfileResponse {
  id: number;
  userName: string;
  email: string;
  role: number; // Gli Enum in C# vengono serializzati come numeri (0, 1, 2...)
  createdAt: string; // Arriva come stringa ISO dal JSON
}

export interface AthleteResponse {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  age: number
  gender?: string
  weight: number
  height: number
  sportCategory?: string
  createdAt: string // Arriva come stringa ISO dal JSON,
  dateOfBirth: string // Arriva come stringa ISO dal JSON
}

export interface AthleteCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string; // Formato ISO 8601
  gender?: string;
  weight: number;
  height: number;
  sportCategory?: string;
}

// Per l'update possiamo riutilizzare il create o renderlo parziale
export type AthleteUpdateRequest = Partial<AthleteCreateRequest>;

// -------------------- REQUEST --------------------

// Per creare una nuova misurazione
export interface AthleteMeasurementsCreateRequest {
  athleteId: number;
  weight: number;
  height: number;
  chest: number;
  waist: number;
  hip: number;
  thigh: number;
  arm: number;
  calf?: number | null;
  forearm?: number | null;
  neck?: number | null;
  notes?: string | null;
}

// Per aggiornare una misurazione esistente
export interface AthleteMeasurementsUpdateRequest {
  weight: number;
  height: number;
  chest: number;
  waist: number;
  hip: number;
  thigh: number;
  arm: number;
  calf?: number | null;
  forearm?: number | null;
  neck?: number | null;
  notes?: string | null;
}

// -------------------- RESPONSE --------------------
export interface AthleteMeasurementsResponse {
  id: number;
  athleteId: number;
  athleteName: string; // es. "Marco Rossi"
  weight: number;
  height: number;
  chest: number;
  waist: number;
  hip: number;
  thigh: number;
  arm: number;
  calf?: number | null;
  forearm?: number | null;
  neck?: number | null;
  notes?: string | null;
  createdAt: string; // ISO string dal backend
  updatedAt?: string | null; // ISO string dal backend
}

// -------------------- CALENDAR DTOs --------------------

/**
 * Risposta per gli eventi del calendario (mappa CalendarEventResponseDto.cs)
 */
export interface CalendarEventResponse {
  id: number;
  athleteId: number | null;
  athleteFullName: string; // "Nome Cognome" o "Gruppo"
  title: string;
  date: string; // Formato ISO 8601 (es. 2023-12-22T10:30:00)
  type: string; // Forza, Cardio, Test, ecc.
  focus?: string | null;
  targetRPE?: number | null;
  duration: string | null;
  isCompleted: boolean;
}

/**
 * Richiesta per la creazione di un evento (mappa CalendarEventCreateDto.cs)
 */
export interface CalendarEventCreateRequest {
  title: string;
  athleteIds: number[]; // Cambiato da athleteId: number
  date: string;
  type: string;
  focus?: string;
  targetRPE?: number | null;
  testDefinitionId?: number | null; // Aggiunto per i test
  duration: string | null;
  isCompleted: boolean;
}

/**
 * Richiesta per l'aggiornamento di un evento (mappa CalendarEventUpdateDto.cs)
 */
export interface CalendarEventUpdateRequest {
  title?: string;
  athleteId?: number | null;
  date?: string;
  type?: string;
  color?: string | null;
  focus?: string | null;
  targetRPE?: number | null;
  duration: string | null;
  isCompleted: boolean;
}

/**
 * Risposta sintetica per il widget Dashboard (mappa CalendarSessionResponse.cs)
 */
export interface CalendarSessionResponse {
  date: string;
  type: string;
  focus?: string | null;
  targetRPE?: number | null;
  athleteName?: string | null;
}

// --- INTERFACCE DTO (Allineate al Backend) ---
export interface MetricDto {
  id: number
  name: string
  unit: string,
  dataType: number, // (0: Numeric, 1: Time, 2: LevelStep)
}

export interface AthleteEntryDto {
  id: number
  fullName: string
  // Corrisponde al Dictionary<long, string> di C#
  tempResults?: Record<number, string>
}

export interface TestEntryGridDto {
  eventId: number
  testName: string
  metrics: MetricDto[]
  athletes: AthleteEntryDto[]
}

export interface TestResultSaveDto {
  athleteId: number;
  testMetricId: number;
  value: number;
  note?: string;
}

export interface TestDefinitionDto {
  id: number;
  name: string;
  description: string | null;
  metrics: MetricDto[];
}

export enum MetricDataType {
    Number = 0,
    Text = 1,
    Boolean = 2,
    Duration = 3 // Esempio: mm:ss
}

export interface TestManagementCreateRequest {
  name: string;
  description: string;
  metrics: MetricDto[]; // Deve usare l'interfaccia sopra
}

export interface TestManagementUpdateRequest extends TestManagementCreateRequest {
    // In TypeScript solitamente l'ID viene passato nel path,
    // ma lo aggiungiamo qui se il tuo backend lo richiede nel body
    id?: number;
}

export interface MetricDto {
  id: number;
  name: string;
  unit: string;
  dataType: number;
  standardValue?: number | null;     // Il punto interrogativo è fondamentale
  normativeDataRef?: string | null;  // Aggiungi questi per completezza
  formula?: string | null;
}

export interface RpeLinkQueueTokenRequestDto{
  rpeTokenId: string
}

// DTO per ricevere le info della sessione (GET)
export interface RpeLinkQueueResponseDto {
    id: number;
    athleteFullName: string;
    eventName: string;
}

// DTO per inviare il voto RPE (POST)
export interface RpeLinkQueueSubmitRpeDto {
    tokenId: string;
    rpeValue: number;
    notes?: string;
}

export interface RpeLastSessionOverviewDto {
    athleteId: number;
    athleteName: string;
    sessionDate: string;
    sessionType: string;
    rpe: number;
    notes?: string;
}

export interface RpeHistoricalEntryDto {
  sessionDate: string   // ISO 8601, es. "2026-01-08T14:00:00"
  sessionType: string   // es. "Allenamento", "Partita"
  rpe: number           // 0–10
  notes?: string        // opzionale
  rpeStatus? : string
  targetRpe? : number,
  nomeSessione: string;
}

export interface Pagination<T> {
  items: T[]
  totalCount: number
  pageSize: number
  currentPage: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

// Shared/types/api.ts (o dove gestisci i tuoi DTO in TS)

export interface AthleteAnalyticsDto {
  athlete: InfoAthleteAnalytics;
  acwr: AcwrDetails[];
  performance: PerformanceAthlete;
  injuries: InjuriesAnalytics[];
}

// --- Sezione Atleta ---
export interface InfoAthleteAnalytics {
  id: number;
  name: string;
  position: string;
  readinessScore: number;
  riskLevel: string;
  antropometrics: InfoAthleteAntropometricsAnalytics;
}

export interface InfoAthleteAntropometricsAnalytics {
  weight: number;
  height: number;
  bmi: string;
}

// --- Sezione ACWR ---
export interface AcwrDetails {
  week: string;
  acute: number;
  chronic: number;
  acwr: number;
  zone: string;
}

// --- Sezione Performance (Dinamica) ---
export interface PerformanceAthlete {
  lastTestDate: string;
  lastTests: MetricValueDto[];
  history: PerformanceHistoryDto[];
}

export interface MetricValueDto {
  metricName: string;
  value: number;
  unit: string;
}

export interface PerformanceHistoryDto {
  date: string;
  metrics: MetricValueDto[];
}

// --- Sezione Infortuni ---
export interface InjuriesAnalytics {
  date: string; // Arriva come stringa ISO dal JSON
  injury: string;
  daysOut: number;
  status: string;
}

export interface InjuryResponseDTO {
    id: number;
    athleteId: number;
    date: string;
    injury: string;
    bodyLocation?: string;
    category: number;       // Enum mapped to Int
    severity: number;       // Enum mapped to Int
    status: number;         // Enum mapped to Int
    categoryName: string;   // Nome stringa per UI
    severityName: string;   // Nome stringa per UI
    statusName: string;     // Nome stringa per UI
    daysOut: number;
    expectedReturnDate?: string;
}

export interface InjuryCreateDTO {
    athleteId: number;
    date: string;
    injury: string;
    bodyLocation?: string;
    category: number;
    severity: number;
    status: number;
    expectedReturnDate?: string;
}

export interface InjuryUpdateDTO extends Omit<InjuryCreateDTO, 'athleteId'> {}


export interface CoachDashboardSummaryDto {
  /** KPI sintetici */
  totalMonitoredAthletes: number;
  averageReadinessScore: number;
  criticalAcwrCount: number;
  missingReportsToday: number;
  athletesHealth: Record<number, AthleteHealthStatusDto>;
  workloadComparison: WorkloadDataPointDto[];
  athleteStatusMatrix: AthleteReadinessVsLoadDto[];
  riskAlerts: AthleteRiskAlertDto[];
  upcomingAgenda: CoachAgendaItemDto[];
  healthDistribution: HealthStatusCountDto[];
  disciplineDistribution: DisciplineCountDto[];
}

export interface AthleteHealthStatusDto {
  athleteId: number;
  acwr: number;
  readiness: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  riskMessage: string | null;
}

export interface CoachAgendaItemDto {
  scheduledAt: string; // ISO Date string
  athleteId: number;   // Fondamentale per il lookup nel dizionario health
  athleteFullName: string;
  sessionType: string;
  priority: string;
}

// Gli altri restano invariati ma assicurati che siano esportati
export interface AthleteReadinessVsLoadDto {
  name: string;
  readiness: number;
  acwr: number;
}

export interface AthleteRiskAlertDto {
  athleteName: string;
  discipline: string;
  acwrValue: number;
  riskTrend: string;
}

export interface WorkloadDataPointDto {
  label: string;
  value: number;
}

export interface HealthStatusCountDto {
  status: string;
  count: number;
  color: string;
}

export interface DisciplineCountDto {
  discipline: string;
  count: number;
}

export interface RpeEmailStatus {
  nomeAtleta: string
  emailAtleta: string
  statoEmail: number // 0: Coda, 1: Inviata, 2: Errore
  dataInvio: string | null
  noteInserite: string | null
  dataInserimento: string | null
}