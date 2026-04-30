import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService } from '../../../core/services/admin.service';
import { DoctorService, Doctor } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class AdminDoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  allDoctors: Doctor[] = [];
  loading = true;

  sidebarItems = [
    { label: 'Dashboard', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', route: '/admin/dashboard' },
    { label: 'Users', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>', route: '/admin/users' },
    { label: 'Verification', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', route: '/admin/doctors' }
  ];// items du sidebar pour la navigation entre les différentes sections de l'admin (dashboard, users, doctors)    

  constructor(
    private adminService: AdminService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    // Get all doctors (including non-validated) - we'll use the validated endpoint
    // plus the general endpoint for pending ones
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.allDoctors = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  validateDoctor(id: number): void {
    this.adminService.validateDoctor(id).subscribe({
      next: () => {
        const doc = this.allDoctors.find(d => d.id === id);
        if (doc) doc.statut_validation = 'VALIDE';
      }
    });
  }

  getStatusClass(status: string): string {
    return status === 'VALIDE' ? 'badge-success' : 'badge-warning';
  }

  getStatusLabel(status: string): string {
    return status === 'VALIDE' ? 'Verified' : 'Pending';
  }
}
