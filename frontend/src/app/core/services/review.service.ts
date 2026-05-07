import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Review {
  id?: number;
  rendezvous_id: number;
  note: number;
  commentaire: string;
  reponse_medecin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private API = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API}/reviews/`);
  }

  createReview(data: { rendezvous_id: number; note: number; commentaire: string }): Observable<Review> {
    return this.http.post<Review>(`${this.API}/reviews/`, data);
  }

  getMyReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/reviews/me`);
  }

  replyToReview(reviewId: number, reponse: string): Observable<any> {
    return this.http.put(`${this.API}/reviews/${reviewId}/reply`, { reponse });
  }
}
