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
  duree: number;
  formateur: string;
  date_prevue: string;
  lieu?: string;
  lien?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFormationData {
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

export interface UpdateFormationData {
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
