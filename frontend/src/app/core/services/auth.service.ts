import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface LoginResponse {
  access_token: string;
}

export interface UserInfo {
  id: number;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {
    this.loadUser();
  }

  private loadUser(): void {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserSubject.next({
          id: payload.user_id,
          role: payload.role
        });
      } catch {
        this.logout();
      }
    }
  }

  register(email: string, password: string, role: string): Observable<any> {
    return this.api.post('/users/register', { email, password, role });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/users/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem('smartdoc_token', res.access_token);
        this.loadUser();
      })
    );
  }

  logout(): void {
    localStorage.removeItem('smartdoc_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('smartdoc_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  getUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user ? user.id : null;
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }
}
