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

  // Stocke les informations de l’utilisateur connecté et les partage dans l’application
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);

  // Observable pour permettre aux composants de suivre l’utilisateur connecté
  currentUser$ = this.currentUserSubject.asObservable();// Expose les informations de l’utilisateur connecté
  // Injecte les services nécessaires : ApiService pour les requêtes HTTP et Router pour la navigation
  constructor(private http: HttpClient, private router: Router) {
    // Charge l’utilisateur au démarrage
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

  // Envoie les données d’inscription au backend
  register(email: string, password: string, role: string): Observable<any> {
   return this.http.post('http://localhost:8000/users/register', {
     email,
     password,
      role
});
  }

  // Envoie les identifiants au backend et récupère le token
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('http://localhost:8000/users/login', { email, password }).pipe(
      // Exécute une action après la réponse
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
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  // Retourne l’identifiant de l’utilisateur
  getUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user ? user.id : null;
  }

  // Retourne les informations complètes de l’utilisateur
  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }
}