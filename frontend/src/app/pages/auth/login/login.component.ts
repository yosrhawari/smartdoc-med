import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  constructor(
    public authService: AuthService,
    private doctorService: DoctorService,
    private router: Router
  ) { }


  togglePassword(): void {
    this.showPassword = !this.showPassword;
  } // Méthode pour basculer la visibilité du mot de passe dans le champ de saisie (type="password" ou type="text") en fonction de l'état de showPassword

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        const role = this.authService.getRole();// Récupérer le rôle de l'utilisateur connecté à partir du service d'authentification
        switch (role) {
          case 'PATIENT': this.router.navigate(['/patient/dashboard']); break;
          case 'MEDECIN':
            this.doctorService.getMyProfile().subscribe({
              next: (profile) => {
                // If profile is incomplete (missing specialty or address), go to completion page
                if (!profile?.adresse || (!profile?.specialite_id && !profile?.spec_nom_temp)) {
                  this.router.navigate(['/doctor/complete-profile']);
                } else if (profile.statut_validation === 'EN_ATTENTE') {
                  this.router.navigate(['/doctor/pending-approval']);
                } else {
                  this.router.navigate(['/doctor/dashboard']);
                }
              },
              error: () => this.router.navigate(['/doctor/complete-profile'])
            })
            break;

          case 'ADMIN': this.router.navigate(['/admin/dashboard']); break;
          default: this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Invalid email or password';
      }
    });
  }
}
