import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { DoctorService, DoctorWithRating } from '../../../core/services/doctor.service';

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
  searchQuery = '';
  loading = true;

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
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
  const q = this.searchQuery.toLowerCase();

  this.filteredDoctors = this.doctors.filter(d =>
    (d.adresse || '').toLowerCase().includes(q) ||
    String(d.id).includes(q) ||
    (d.nom || '').toLowerCase().includes(q) ||
    (d.prenom || '').toLowerCase().includes(q)
  );
}

  getStarArray(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }
}
