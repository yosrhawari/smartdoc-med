import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { DoctorService, DoctorWithRating } from '../../../core/services/doctor.service';

declare var lucide: any;

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css'
})
export class DoctorListComponent implements OnInit {
  doctors: DoctorWithRating[] = [];
  filteredDoctors: DoctorWithRating[] = [];
  loading = true;
  today = new Date().toISOString().split('T')[0];

  // Filter State
  searchName = '';
  selectedSpecialty = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = 'default';
  specialties: string[] = [];

  sidebarItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/patient/dashboard' },
    { label: 'Find Doctor', icon: 'search', route: '/patient/questionnaire' },
    { label: 'Doctors', icon: 'users', route: '/patient/doctors' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];
  selectedDoctor: any = null;

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.doctorService.getDoctorsWithRating().subscribe({
      next: (data) => {
        this.doctors = data;
        this.filteredDoctors = data;
        this.extractSpecialties();
        this.loading = false;
        this.refreshIcons();
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 100);
  }

  extractSpecialties(): void {
    const specs = this.doctors
      .map(d => d.specialite)
      .filter((s): s is string => !!s);
    this.specialties = [...new Set(specs)].sort();
  }

  applyFilters(): void {
    let result = [...this.doctors];

    // Name Filter
    if (this.searchName) {
      const q = this.searchName.toLowerCase();
      result = result.filter(d => 
        (d.nom + ' ' + d.prenom).toLowerCase().includes(q)
      );
    }

    // Specialty Filter
    if (this.selectedSpecialty) {
      result = result.filter(d => d.specialite === this.selectedSpecialty);
    }

    // Price Filter
    if (this.minPrice !== null) {
      result = result.filter(d => d.tarif >= (this.minPrice as number));
    }
    if (this.maxPrice !== null) {
      result = result.filter(d => d.tarif <= (this.maxPrice as number));
    }

    // Sorting
    if (this.sortBy === 'price-low') {
      result.sort((a, b) => a.tarif - b.tarif);
    } else if (this.sortBy === 'price-high') {
      result.sort((a, b) => b.tarif - a.tarif);
    } else if (this.sortBy === 'rating') {
      result.sort((a, b) => (b.note_moyenne || 0) - (a.note_moyenne || 0));
    }

    this.filteredDoctors = result;
    this.refreshIcons();
  }

  clearFilters(): void {
    this.searchName = '';
    this.selectedSpecialty = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'default';
    this.filteredDoctors = this.doctors;
    this.refreshIcons();
  }

  getStarArray(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }
}
