import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Représente la réponse du login contenant le token
export interface LoginResponse {
  access_token: string;
}

// Représente les informations de l’utilisateur
export interface UserInfo {
  id: number;
  role: string;
}
@Injectable({
  providedIn: 'root'// Permet d’injecter ce service dans toute l’application
})
// Service qui gère l’authentification et les informations de l’utilisateur
export class AuthService {

  private API = 'http://localhost:8000';

  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  // Récupère le token, extrait les infos utilisateur et les sauvegarde
  private loadUser(): void {
    const token = this.getToken();
    if (token) {
      try {
        // Décodage du token JWT pour récupérer les informations
        const payload = JSON.parse(atob(token.split('.')[1]));// Met à jour les informations de l’utilisateur connecté
        this.currentUserSubject.next({// Stocke l’identifiant et le rôle de l’utilisateur
          id: payload.user_id,
          role: payload.role
        });
      } catch {
        // En cas d’erreur, déconnecte l’utilisateur
        this.logout();
      }
    }
  }

  // ✅ REGISTER (patient + doctor)
  register(data: any) {
    return this.http.post('http://localhost:8000/users/register', { ...data });
  }

  // Envoie les identifiants au backend et récupère le token
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/users/login`, { email, password }).pipe(
      tap(res => {
        // Sauvegarde le token dans le stockage local
        localStorage.setItem('smartdoc_token', res.access_token);
        // Recharge les informations utilisateur
        this.loadUser();
      })
    );
  }

  // Déconnecte l’utilisateur et redirige vers la page login
  logout(): void {
    localStorage.removeItem('smartdoc_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Récupère le token depuis le localStorage
  getToken(): string | null {
    return localStorage.getItem('smartdoc_token');
  }

  // Vérifie si un utilisateur est connecté
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Retourne le rôle de l’utilisateur
  getRole(): string | null {
    return this.currentUserSubject.value?.role || null;
  }

  // Retourne l’identifiant de l’utilisateur
  getUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }

  // Retourne les informations complètes de l’utilisateur
  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }
}