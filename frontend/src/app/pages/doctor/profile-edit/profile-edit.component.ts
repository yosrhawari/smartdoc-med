import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css'
})
export class DoctorProfileEditComponent {
  profile = {
    specialite_id: 1,
    adresse: '',
    tarif: 0,
    biographie: ''
  };

  success = '';
  error = '';
  loading = false;

  sidebarItems = [
    { label: 'Dashboard', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', route: '/doctor/dashboard' },
    { label: 'Patients', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>', route: '/doctor/patients' },
    { label: 'My Profile', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', route: '/doctor/profile' }
  ];

  constructor(
    private auth: AuthService,
    private doctorService: DoctorService
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    const data = {
      user_id: this.auth.getUserId(),
      specialite_id: this.profile.specialite_id,
      adresse: this.profile.adresse,
      tarif: this.profile.tarif
    };

    this.doctorService.createDoctorProfile(data).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Profile saved successfully! It will be reviewed by admin.';
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Failed to save profile';
      }
    });
  }
}
