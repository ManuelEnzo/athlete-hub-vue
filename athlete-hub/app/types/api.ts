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