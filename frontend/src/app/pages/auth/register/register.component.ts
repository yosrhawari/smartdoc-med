import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  // AUTH
  email = '';
  password = '';
  confirmPassword = '';
  role = 'PATIENT';

  // DOCTOR PROFILE
  selectedSpecialite: number | 'autre' | '' = '';
  autreSpecialite = '';
  adresse = '';
  tarif = 0;
  biographie = '';

  // DATA
  specialites: any[] = [];

  // UI
  error = '';
  success = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.doctorService.getSpecialites().subscribe({
      next: (data) => this.specialites = data,
      error: () => console.error('Failed to load specialites')
    });
  }

  selectRole(role: string): void {
    this.role = role;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    // VALIDATION
    if (!this.email || !this.password || !this.confirmPassword) {
      this.error = 'Please fill all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;

    //  MEDECIN
    if (this.role === 'MEDECIN') {

      const payload = {
        email: this.email,
        password: this.password,
        specialite_id: this.selectedSpecialite !== 'autre'
          ? Number(this.selectedSpecialite)
          : null,
        autre_specialite: this.selectedSpecialite === 'autre'
          ? this.autreSpecialite
          : null,
        adresse: this.adresse,
        tarif: this.tarif,
        biographie: this.biographie
      };

      this.doctorService.registerDoctor(payload).subscribe({
        next: () => {
          this.loading = false;
          this.success = 'Doctor created successfully!';
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.log(err);
          this.loading = false;
          this.error = err.error?.detail || 'Doctor creation failed';
        }
      });

    } else {
      // PATIENT
      this.authService.register(this.email, this.password, this.role).subscribe({
        next: () => {
          this.loading = false;
          this.success = 'Account created!';
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.log(err);
          this.loading = false;
          this.error = err.error?.detail || 'Registration failed';
        }
      });

    }
  }
}