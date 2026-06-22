export interface Citizen {
  NIN: string;
  FIRSTNAME: string;
  MIDDLENAME: string;
  SURNAME: string;
  OTHERNAMES: string;
  SEX: 'MALE' | 'FEMALE';
  DATEOFBIRTH: string;
  RESIDENTREGION: string;
  RESIDENTDISTRICT: string;
  RESIDENTWARD: string;
  RESIDENTVILLAGE: string;
  RESIDENTSTREET: string;
  RESIDENTPOSTCODE: string;
  PERMANENTREGION: string;
  PERMANENTDISTRICT: string;
  PERMANENTWARD: string;
  PERMANENTVILLAGE: string;
  PERMANENTSTREET: string;
  BIRTHCOUNTRY: string;
  BIRTHREGION: string;
  BIRTHDISTRICT: string;
  BIRTHWARD: string;
  NATIONALITY: string;
  PHONENUMBER: string;
  MARITALSTATUS: string;
  OCCUPATION: string;
  PRIMARYSCHOOLEDUCATION: string;
  PRIMARYSCHOOLDISTRICT: string;
  PRIMARYSCHOOLYEAR: string;
  PHOTO: string;
  SIGNATURE: string;
  NATIONALIDNUMBER: string;
  LASTNAME: string;
}

export interface NidaResponse {
  obj: {
    result?: Citizen;
    error?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    start: number;
    next: number | null;
  };
}

export interface QueryParams {
  limit?: string;
  start?: string;
  sort?: string;
  fields?: string;
  region?: string;
  sex?: string;
  maritalstatus?: string;
  district?: string;
}

export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}
