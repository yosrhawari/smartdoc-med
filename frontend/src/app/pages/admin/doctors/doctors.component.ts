import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService } from '../../../core/services/admin.service';
import { DoctorService } from '../../../core/services/doctor.service';

declare var lucide: any;

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class AdminDoctorsComponent implements OnInit, AfterViewInit {
  allDoctors: any[] = [];
  loading = true;
  selectedDoctor: any = null;

  sidebarItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/admin/dashboard' },
    { label: 'Users', icon: 'users', route: '/admin/users' },
    { label: 'Verification', icon: 'shield-check', route: '/admin/doctors' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  constructor(
    private adminService: AdminService,
    private doctorService: DoctorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  loadDoctors(): void {
    this.adminService.getAllDoctors().subscribe({
      next: (data: any[]) => {
        this.allDoctors = data;
        this.loading = false;
        this.refreshIcons();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  validateDoctor(id: number): void {
    this.adminService.validateDoctor(id).subscribe({
      next: () => {
        const doc = this.allDoctors.find(d => d.id === id);
        if (doc) doc.statut_validation = 'VALIDE';
        this.refreshIcons();
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'VALIDE': return 'badge-success';
      case 'EN_ATTENTE': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'VALIDE': return 'Verified';
      case 'EN_ATTENTE': return 'Pending';
      default: return status;
    }
  }

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }
}
