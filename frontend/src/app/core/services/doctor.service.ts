import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
   private API = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // Doctors
  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.API}/medecins/`);
  }

  //  Smart search
  searchDoctors(symptom: string): Observable<SmartSearchResult[]> {
    return this.http.get<SmartSearchResult[]>(
      `${this.API}/medecins/smart-search`,
      { params :{ symptome: symptom } }
    );
  }

  //  Rating
  getDoctorsWithRating(): Observable<DoctorWithRating[]> {
    return this.http.get<DoctorWithRating[]>(`${this.API}/medecins/with-rating`);
  }

  // creation profile
  createDoctorProfile(data: any): Observable<Doctor> {
    return this.http.post<Doctor>(`${this.API}/medecins/`, data);
  }

  // GET SPECIALITES
  getSpecialites(): Observable<Specialite[]> {
    return this.http.get<Specialite[]>(`${this.API}/specialites/`);
  }
  // REGISTER DOCTOR (AUTH + PROFILE)
  registerDoctor(data: any): Observable<any> {
    return this.http.post(`${this.API}/users/register`, data);
  }
}