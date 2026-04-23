import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

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

  constructor(private router: Router) {}

  // 🔥 Mock Register (just for demo)
  register(email: string, password: string, role: string): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ message: 'User registered successfully' });
        observer.complete();
      }, 800);
    });
  }

  // 🔥 Mock Login
  login(email: string, password: string): Observable<LoginResponse> {

    const users = [
      { id: 1, email: 'patient@test.com', password: '1234', role: 'PATIENT' },
      { id: 2, email: 'doctor@test.com', password: '1234', role: 'MEDECIN' },
      { id: 3, email: 'admin@test.com', password: '1234', role: 'ADMIN' }
    ];

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      this.currentUserSubject.next({
        id: user.id,
        role: user.role
      });

      localStorage.setItem('smartdoc_token', 'fake-token');

      return new Observable(observer => {
        setTimeout(() => {
          observer.next({ access_token: 'fake-token' });
          observer.complete();
        }, 800);
      });
    }

    return new Observable(observer => {
      setTimeout(() => {
        observer.error({ error: { detail: 'Invalid email or password' } });
      }, 800);
    });
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