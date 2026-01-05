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
  email: string;
  password?: string; // Opzionale se gestisci social login, ma qui richiesto
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
  description?: string;
  metrics: TestMetricDto[];
}

export interface TestMetricDto {
  id: number;
  name: string;
  unit: string;
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