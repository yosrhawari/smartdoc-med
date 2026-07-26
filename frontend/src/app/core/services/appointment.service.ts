import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
  private API = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API}/rendezvous/`);
  }

  getAvailableSlots(medecinId: number, date: string): Observable<any> {
    return this.http.get(`${this.API}/rendezvous/medecin/${medecinId}/availability`, {
      params: { date_selected: date }
    });
  }

  createAppointment(data: { medecin_id: number; date: string; heure: string }) {
  return this.http.post(`${this.API}/rendezvous/create`, data);
}

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.API}/rendezvous/${id}/status?status=${status}`, null);
  }
}
