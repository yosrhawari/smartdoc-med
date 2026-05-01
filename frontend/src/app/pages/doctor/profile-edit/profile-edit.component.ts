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
      user_id: this.auth.getUserId(),
      adresse: this.profile.adresse,
      tarif: this.profile.tarif,
      biographie: this.profile.biographie
    };

    // Validation spécialité
    if (this.selectedSpecialite === 'autre') {
      if (!this.autreSpecialite.trim()) {
        this.error = 'Veuillez entrer votre spécialité';
        this.loading = false;
        return;
      }
      data.new_specialite = this.autreSpecialite; // 👈 clean backend
    } else {
      if (!this.selectedSpecialite) {
        this.error = 'Veuillez choisir une spécialité';
        this.loading = false;
        return;
      }
      data.specialite_id = this.selectedSpecialite;
    }

    error: (err : any) => {
  this.loading = false;

  console.log('FULL ERROR:', err); // Affiche l'erreur complète pour le débogage    

  if (err.error?.detail?.msg) {
    this.error = err.error.detail.msg;
  } else if (Array.isArray(err.error?.detail)) {
    this.error = err.error.detail[0]?.msg;
  } else if (typeof err.error?.detail === 'string') {
    this.error = err.error.detail;
  } else {
    this.error = 'Erreur inconnue';
  }
}
  }}
