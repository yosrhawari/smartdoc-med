import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


export interface PlatformStats {
  users: number;
  medecins: {
    total: number;
    valides: number;
    en_attente: number;
  };
  rendezvous: number;
  reviews: number;
}

export interface User {
  id: number;
  email: string;
  role: string;
  nom?: string;
  prenom?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  
  private API = 'http://localhost:8000';

  constructor(private http: HttpClient) {}
   getAllDoctors(): Observable<any[]> {
     return this.http.get<any[]>(`${this.API}/admin/pending`);
   }

   getAllProviders(): Observable<any[]> {
     return this.http.get<any[]>(`${this.API}/admin/medecins`);
   }

  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${this.API}/admin/stats`);
  }

  validateDoctor(id: number): Observable<any> {
    return this.http.put(`${this.API}/admin/medecins/${id}/validate`, {});
  }

  getUsers(): Observable<User[]> {
    const token = localStorage.getItem('smartdoc_token');
    return this.http.get<User[]>(`${this.API}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  getPendingDoctors(): Observable<any> {
    return this.http.get<any>(`${this.API}/admin/get_pending_medecins`);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`${this.API}/admin/users/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API}/admin/users/${id}`);
  }
  
}
