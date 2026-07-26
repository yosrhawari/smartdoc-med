import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private API = 'http://localhost:8000'; 

  constructor(private http: HttpClient) { }

  analyzeResults(answers: any): Observable<any> {
    return this.http.post(`${this.API}/ai/predict`, answers);
  }
}