import { Component, OnInit } from '@angular/core';
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
export class DoctorProfileEditComponent implements OnInit {

  profile = {
    specialite_id: null as any,
    adresse: '',
    tarif: 0,
    biographie: ''
  };

  //  spécialités njiboha API
  specialites: any[] = [];
  loadingSpecialites = false;

  //  spécialité select
  selectedSpecialite: any = '';
  autreSpecialite: string = '';

  success = '';
  error = '';
  loading = false;

  sidebarItems = [
    { label: 'Dashboard', icon: '<svg width="18" height="18" ...></svg>', route: '/doctor/dashboard' },
    { label: 'Patients', icon: '<svg width="18" height="18" ...></svg>', route: '/doctor/patients' },
    { label: 'My Profile', icon: '<svg width="18" height="18" ...></svg>', route: '/doctor/profile' }
  ];

  constructor(
    private auth: AuthService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.loadSpecialites();
    this.loadProfile();
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
        }
      }
    });
  }

  // load API
  loadSpecialites() {
    this.loadingSpecialites = true;
    this.doctorService.getSpecialites().subscribe({
      next: (data) => {
        this.specialites = data;
        this.loadingSpecialites = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load specialties';
        this.loadingSpecialites = false;
      }
    });
  }

  // change handler
  onSpecialiteChange() {
    if (this.selectedSpecialite !== 'autre') {
      this.autreSpecialite = '';
    }
  }

  // submit handler
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
      if (!this.autreSpecialite.trim()) {
        this.error = 'Veuillez entrer votre spécialité';
        this.loading = false;
        return;
      }
      data.new_specialite = this.autreSpecialite;
    } else {
      if (!this.selectedSpecialite) {
        this.error = 'Veuillez choisir une spécialité';
        this.loading = false;
        return;
      }
      data.specialite_id = this.selectedSpecialite;
    }

    this.doctorService.updateProfile(data).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Profile mis à jour avec succès !';
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Une erreur est survenue';
      }
    });
  }
}
