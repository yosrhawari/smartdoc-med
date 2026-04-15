import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

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
  constructor(private api: ApiService) {}

  getStats(): Observable<PlatformStats> {
    return this.api.get<PlatformStats>('/admin/stats');
  }

  validateDoctor(id: number): Observable<any> {
    return this.api.put(`/admin/medecins/${id}/validate`);
  }

  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('/users/');
  }
}
