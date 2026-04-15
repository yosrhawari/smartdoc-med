import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Appointment {
  id?: number;
  patient_id: number;
  medecin_id: number;
  date_rdv: string;
  statut: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  constructor(private api: ApiService) {}

  getAppointments(): Observable<Appointment[]> {
    return this.api.get<Appointment[]>('/rendezvous/');
  }

  createAppointment(data: { medecin_id: number; date_rdv: string }): Observable<Appointment> {
    return this.api.post<Appointment>('/rendezvous/', data);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.api.put(`/rendezvous/${id}/status`, null);
  }
}
