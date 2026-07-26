import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService, PlatformStats } from '../../../core/services/admin.service';

declare var lucide: any;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true, 
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  stats: PlatformStats | null = null;
  loading = true;
  Math = Math;

  sidebarItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/admin/dashboard' },
    { label: 'Users', icon: 'users', route: '/admin/users' },
    { label: 'Medical Providers', icon: 'stethoscope', route: '/admin/doctors' },
    { label: 'Verification', icon: 'shield-check', route: '/admin/verification' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
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
    }, 0);
  }
}
