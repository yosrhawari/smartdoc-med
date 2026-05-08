import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService } from '../../../core/services/admin.service';

declare var lucide: any;

@Component({
  selector: 'app-admin-verification',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class AdminVerificationComponent implements OnInit, AfterViewInit {
  pendingDoctors: any[] = [];
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPending();
  }

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  loadPending(): void {
    this.loading = true;
    this.adminService.getAllDoctors().subscribe({
      next: (data: any[]) => {
        this.pendingDoctors = data;
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
        this.pendingDoctors = this.pendingDoctors.filter(d => d.id !== id);
        this.selectedDoctor = null;
        this.refreshIcons();
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
