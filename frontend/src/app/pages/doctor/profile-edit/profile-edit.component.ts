import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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

  // ── Profile data ────────────────────────────────────────────────────────────
  profile = {
    nom: '',
    prenom: '',
    email: '',
    adresse: '',
    tarif: 0,
    biographie: '',
    specialite_id: null as number | null,
    specialite: ''
  };

  // ── Specialities list ────────────────────────────────────────────────────────
  specialites: any[] = [];

  // ── Photo preview ────────────────────────────────────────────────────────────
  photoPreview: string | null = null;

  // ── UI state ─────────────────────────────────────────────────────────────────
  success = '';
  error = '';
  loading = false;
  loadingProfile = true;

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  sidebarItems = [
    {
      label: 'Dashboard',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
      route: '/doctor/dashboard'
    },
    {
      label: 'Patients',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
      route: '/doctor/patients'
    },
    {
      label: 'My Profile',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      route: '/doctor/profile'
    }
  ];

  constructor(
    private auth: AuthService,
    private doctorService: DoctorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSpecialites();
    this.loadMyProfile();
  }

  // ── Load logged-in doctor's profile ──────────────────────────────────────────
  loadMyProfile(): void {
    this.loadingProfile = true;
    this.doctorService.getMyProfile().subscribe({
      next: (data) => {
        this.profile.nom         = data.nom    || '';
        this.profile.prenom      = data.prenom || '';
        this.profile.email       = data.email  || '';
        this.profile.adresse     = data.adresse || '';
        this.profile.tarif       = data.tarif  || 0;
        this.profile.biographie  = data.biographie || '';
        this.profile.specialite_id = data.specialite_id || null;
        this.profile.specialite  = data.specialite || '';
        this.loadingProfile = false;
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.error = 'Impossible de charger le profil';
        this.loadingProfile = false;
      }
    });
  }

  // ── Load specialities list ────────────────────────────────────────────────────
  loadSpecialites(): void {
    this.doctorService.getSpecialites().subscribe({
      next: (data) => { this.specialites = data; },
      error: (err) => { console.error('Specialites error:', err); }
    });
  }

  // ── Photo upload preview ──────────────────────────────────────────────────────
  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerPhotoInput(): void {
    document.getElementById('photo-input')?.click();
  }

  // ── Get initials for avatar fallback ─────────────────────────────────────────
  getInitials(): string {
    const first = this.profile.prenom?.[0] || '';
    const last  = this.profile.nom?.[0]    || '';
    return (first + last).toUpperCase() || 'DR';
  }

  // ── Submit form ───────────────────────────────────────────────────────────────
  onSubmit(): void {
    this.loading = true;
    this.error   = '';
    this.success = '';

    const payload: any = {
      nom:          this.profile.nom,
      prenom:       this.profile.prenom,
      adresse:      this.profile.adresse,
      tarif:        this.profile.tarif,
      biographie:   this.profile.biographie,
      specialite_id: this.profile.specialite_id
    };

    this.doctorService.updateMyProfile(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Profil mis à jour avec succès ✓';
        setTimeout(() => { this.success = ''; }, 4000);
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.detail) {
          this.error = typeof err.error.detail === 'string'
            ? err.error.detail
            : err.error.detail[0]?.msg || 'Erreur inconnue';
        } else {
          this.error = 'Erreur lors de la mise à jour';
        }
      }
    });
  }

  // ── Cancel ────────────────────────────────────────────────────────────────────
  onCancel(): void {
    this.router.navigate(['/doctor/dashboard']);
  }
}
