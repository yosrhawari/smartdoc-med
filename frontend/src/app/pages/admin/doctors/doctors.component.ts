import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService } from '../../../core/services/admin.service';
import { DoctorService } from '../../../core/services/doctor.service';

declare var lucide: any;

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class AdminDoctorsComponent implements OnInit, AfterViewInit {
  allDoctors: any[] = [];
  filteredDoctors: any[] = [];
  searchQuery = '';
  loading = true;
  selectedDoctor: any = null;

  sidebarItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/admin/dashboard' },
    { label: 'Users', icon: 'users', route: '/admin/users' },
    { label: 'Medical Providers', icon: 'stethoscope', route: '/admin/doctors' },
    { label: 'Verification', icon: 'shield-check', route: '/admin/verification' },
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
    this.adminService.getAllProviders().subscribe({
      next: (data: any[]) => {
        this.allDoctors = data;
        this.filteredDoctors = data;
        this.loading = false;
        this.refreshIcons();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredDoctors = this.allDoctors.filter(doc => 
      doc.nom.toLowerCase().includes(query) || 
      doc.prenom.toLowerCase().includes(query) ||
      doc.email.toLowerCase().includes(query) ||
      doc.specialite.toLowerCase().includes(query)
    );
    this.refreshIcons();
  }

  validateDoctor(id: number): void {
    this.adminService.validateDoctor(id).subscribe({
      next: () => {
        this.loadDoctors(); // Reload to get updated status
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'VALIDE': return 'badge-verified-premium';
      case 'EN_ATTENTE': return 'badge-pending-premium';
      default: return 'badge-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'VALIDE': return 'VERIFIED';
      case 'EN_ATTENTE': return 'PENDING';
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
