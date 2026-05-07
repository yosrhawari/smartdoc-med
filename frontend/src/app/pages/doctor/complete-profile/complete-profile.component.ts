import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService, Specialite } from '../../../core/services/doctor.service';

declare var lucide: any;

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complete-profile.component.html',
  styleUrl: './complete-profile.component.css'
})
export class CompleteProfileComponent implements OnInit {
  address = '';
  fee: number | null = null;
  selectedSpecialty = '';
  specialites: Specialite[] = [];
  
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private doctorService: DoctorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.doctorService.getSpecialites().subscribe(data => {
      this.specialites = data;
      this.refreshIcons();
    });
  }

  onSubmit(): void {
    if (!this.address || !this.fee || !this.selectedSpecialty) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    const profileData = {
      adresse: this.address,
      tarif: this.fee,
      specialite_id: parseInt(this.selectedSpecialty)
    };

    this.doctorService.updateProfile(profileData).subscribe({
      next: () => {
        this.router.navigate(['/doctor/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Failed to complete profile';
      }
    });
  }

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }
}
