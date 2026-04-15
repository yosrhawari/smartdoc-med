import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

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
  constructor(private api: ApiService) {}

  getReviews(): Observable<Review[]> {
    return this.api.get<Review[]>('/reviews/');
  }

  createReview(data: { rendezvous_id: number; note: number; commentaire: string }): Observable<Review> {
    return this.api.post<Review>('/reviews/', data);
  }
}
