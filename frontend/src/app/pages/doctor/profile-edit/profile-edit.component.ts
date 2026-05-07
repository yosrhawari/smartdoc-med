import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';

declare var lucide: any;

@Component({
  selector: 'app-doctor-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css'
})
export class DoctorProfileEditComponent implements OnInit, AfterViewInit {
  profile = {
    adresse: '',
    tarif: 0,
    biographie: '',
    specialite_id: null as any
  };

  specialites: any[] = [];
  selectedSpecialite: any = '';
  autreSpecialite: string = '';
  loading = false;
  success = '';
  error = '';

  sidebarItems = [
    { label: 'Appointments', icon: 'calendar', route: '/doctor/dashboard' },
    { label: 'My Patients', icon: 'users', route: '/doctor/patients' },
    { label: 'My Profile', icon: 'user-cog', route: '/doctor/profile' },
    { label: 'Reviews', icon: 'star', route: '/doctor/reviews' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  constructor(
    public auth: AuthService,
    private doctorService: DoctorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSpecialites();
    this.loadProfile();
  }

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  loadProfile() {
    this.doctorService.getMyProfile().subscribe({
      next: (data) => {
        if (data) {
          this.profile = {
            adresse: data.adresse || '',
            tarif: data.tarif || 0,
            biographie: data.biographie || '',
            specialite_id: data.specialite_id
          };
          this.selectedSpecialite = data.specialite_id || (data.spec_nom_temp ? 'autre' : '');
          this.autreSpecialite = data.spec_nom_temp || '';
          this.refreshIcons();
        }
      }
    });
  }

  loadSpecialites() {
    this.doctorService.getSpecialites().subscribe({
      next: (data) => {
        this.specialites = data;
        this.refreshIcons();
      }
    });
  }

  onSpecialiteChange() {
    if (this.selectedSpecialite !== 'autre') {
      this.autreSpecialite = '';
    }
    this.refreshIcons();
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    const data: any = {
      adresse: this.profile.adresse,
      tarif: this.profile.tarif,
      biographie: this.profile.biographie
    };

    if (this.selectedSpecialite === 'autre') {
      data.new_specialite = this.autreSpecialite;
    } else {
      data.specialite_id = this.selectedSpecialite;
    }

    this.doctorService.updateProfile(data).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Profile updated successfully!';
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Failed to update profile.';
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
