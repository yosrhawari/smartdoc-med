import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Doctor {
  id: number;
  user_id: number;
  specialite_id: number;
  adresse: string;
  tarif: number;
  biographie?: string;
  diplome_path?: string;
  statut_validation: string;
}

export interface DoctorWithRating {
  medecin_id: number;
  adresse: string;
  note_moyenne: number;
}

export interface SmartSearchResult {
  medecin_id: number;
  adresse: string;
  score_matching: number;
  note_moyenne: number;
  score_final: number;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  constructor(private api: ApiService) {}

  getDoctors(): Observable<Doctor[]> {
    return this.api.get<Doctor[]>('/medecins/');
  }

  searchDoctors(symptom: string): Observable<SmartSearchResult[]> {
    return this.api.get<SmartSearchResult[]>('/medecins/smart-search', { symptome: symptom });
  }

  getDoctorsWithRating(): Observable<DoctorWithRating[]> {
    return this.api.get<DoctorWithRating[]>('/medecins/with-rating');
  }

  createDoctorProfile(data: any): Observable<Doctor> {
    return this.api.post<Doctor>('/medecins/', data);
  }
}
