import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

// ================== INTERFACES ==================

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

// NEW interface
export interface Specialite {
  id: number;
  nom: string;
}

// ================== SERVICE ==================

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(private api: ApiService) {}

  // Doctors
  getDoctors(): Observable<Doctor[]> {
    return this.api.get<Doctor[]>('/medecins/');
  }

  //  Smart search
  searchDoctors(symptom: string): Observable<SmartSearchResult[]> {
    return this.api.get<SmartSearchResult[]>(
      '/medecins/smart-search',
      { symptome: symptom }
    );
  }

  //  Rating
  getDoctorsWithRating(): Observable<DoctorWithRating[]> {
    return this.api.get<DoctorWithRating[]>('/medecins/with-rating');
  }

  // creation profile
  createDoctorProfile(data: any): Observable<Doctor> {
    return this.api.post<Doctor>('/medecins/', data);
  }

  // GET SPECIALITES
  getSpecialites(): Observable<Specialite[]> {
    return this.api.get<Specialite[]>('/specialites/');
  }
}
