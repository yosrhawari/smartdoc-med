import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService, Specialite } from '../../../core/services/doctor.service';

declare var lucide: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  // Fields for Step 1
  nom = '';
  prenom = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = 'PATIENT'; // Default
  agreeToTerms = false;

  // Fields for Step 2 (Doctor only)
  step = 1;
  address = '';
  fee: number | null = null;
  selectedSpecialty = '';
  specialites: Specialite[] = [];

  error = '';
  success = '';
  loading = false;

  constructor(
    public authService: AuthService,
    private doctorService: DoctorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.doctorService.getSpecialites().subscribe(data => {
      this.specialites = data;
      this.refreshIcons();
    });
  }

  selectRole(role: string): void {
    this.role = role;
    this.error = '';
  }

  onSubmit(): void {
    this.error = '';
    
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    // Step transition for Doctors
    if (this.role === 'MEDECIN' && this.step === 1) {
      this.step = 2;
      this.refreshIcons();
      return;
    }

    // Final Validation for Step 2
    if (this.role === 'MEDECIN' && this.step === 2) {
      if (!this.address || !this.fee || !this.selectedSpecialty) {
        this.error = 'Please fill in all medical practice details';
        return;
      }
    }

    this.loading = true;

    const payload = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      password: this.password,
      role: this.role,
      // Optional fields for Doctor
      adresse: this.address,
      tarif: this.fee,
      specialite_id: this.selectedSpecialty ? parseInt(this.selectedSpecialty) : null
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Account created successfully!';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Registration failed. Please try again.';
      }
    });
  }

  prevStep(): void {
    this.step = 1;
    this.refreshIcons();
  }

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }
}