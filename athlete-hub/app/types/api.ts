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
  createdAt: string // Arriva come stringa ISO dal JSON
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
