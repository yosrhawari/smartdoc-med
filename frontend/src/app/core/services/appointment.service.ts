import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Appointment {
  id?: number;
  patient_id: number;
  medecin_id: number;
  date_rdv: string;
  heure?: string;
  patient_name?: string;
  doctor_name?: string;
  specialite?: string;
  statut: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private API = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API}/rendezvous/`);
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API}/rendezvous/my-appointments`);
  }

  getDoctorAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API}/medecins/rdv`);
  }

  createAppointment(data: { medecin_id: number; date_rdv: string; heure?: string }): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.API}/rendezvous/`, data);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.API}/rendezvous/${id}/status?status=${status}`, null);
  }
}
