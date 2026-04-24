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
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private API = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${this.API}/admin/stats`);
  }

  validateDoctor(id: number): Observable<any> {
    return this.http.put(`${this.API}/admin/medecins/${id}/validate`, {});
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API}/users/`);
  }
}
