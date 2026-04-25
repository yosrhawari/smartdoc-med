import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

  private API = 'http://localhost:8000';

  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
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

  // ✅ REGISTER (patient + doctor)
  register(data: any): Observable<any> {
    return this.http.post(`${this.API}/users/register`, data);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/users/login`, { email, password }).pipe(
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
    return this.currentUserSubject.value?.role || null;
  }

  getUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }
}