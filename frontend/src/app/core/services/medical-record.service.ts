import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MedicalRecord {
  id?: number;
  notes: string;
  prescription: string;
  rendezvous_id: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private API = 'http://localhost:8000/medical-records';

  constructor(private http: HttpClient) {}

  saveRecord(record: MedicalRecord): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>(`${this.API}/`, record);
  }

  getRecordByRendezvous(id: number): Observable<MedicalRecord> {
    return this.http.get<MedicalRecord>(`${this.API}/by-rendezvous/${id}`);
  }

  getMyRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/me`);
  }
}
