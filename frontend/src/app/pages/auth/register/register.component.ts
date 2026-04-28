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
  styleUrls: ['./register.component.css'] // ✅ FIX
})
export class RegisterComponent implements OnInit {

  email = '';
  password = '';
  confirmPassword = '';
  role = 'PATIENT';

  selectedSpecialite: number | 'autre' | '' = '';
  autreSpecialite = '';
  adresse = '';
  tarif = 0;
  biographie = '';

  specialites: any[] = [];

  error = '';
  success = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private router: Router
  ) {}

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

    // DOCTOR
    if (this.role === 'MEDECIN') {

      const specialiteNom =
        this.selectedSpecialite === 'autre'
          ? this.autreSpecialite
          : this.specialites.find(s => s.id === this.selectedSpecialite)?.nom;

      const payload = {
        email: this.email,
        password: this.password,
        role: "MEDECIN",
        specialite_nom: specialiteNom,
        adresse: this.adresse,
        tarif: this.tarif,
        biographie: this.biographie
      };

      this.authService.register(payload).subscribe({
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
      // ✅ PATIENT
      const payload = {
        email: this.email,
        password: this.password,
        role: "PATIENT"
      };

      this.authService.register(payload).subscribe({
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