export enum FormationType {
  PRESENTIELLE = 'PRESENTIELLE',
  EN_LIGNE = 'EN_LIGNE',
  HYBRIDE = 'HYBRIDE'
}

export interface Formation {
  id: string;
  titre: string;
  description: string;
  objectifs_pedagogiques: string;
  type: FormationType;
  duree: number; // Duration in hours
  formateur: string;
  date_prevue: string; // ISO date string
  lieu?: string; // For PRESENTIELLE and HYBRIDE
  lien?: string; // For EN_LIGNE and HYBRIDE
  created_by: string; // User ID (RH)
  created_at: string;
  updated_at: string;
}

export interface CreateFormationRequest {
  titre: string;
  description: string;
  objectifs_pedagogiques: string;
  type: FormationType;
  duree: number;
  formateur: string;
  date_prevue: string;
  lieu?: string;
  lien?: string;
}

export interface UpdateFormationRequest {
  titre?: string;
  description?: string;
  objectifs_pedagogiques?: string;
  type?: FormationType;
  duree?: number;
  formateur?: string;
  date_prevue?: string;
  lieu?: string;
  lien?: string;
}

export interface FormationResponse {
  success: boolean;
  message?: string;
  formation?: Formation;
  formations?: Formation[];
}
