import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService, User } from '../../../core/services/admin.service';

declare var lucide: any;

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class AdminUsersComponent implements OnInit, AfterViewInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  loading = true;

  sidebarItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/admin/dashboard' },
    { label: 'Users', icon: 'users', route: '/admin/users' },
    { label: 'Verification', icon: 'shield-check', route: '/admin/doctors' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.loading = false;
        this.refreshIcons();
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(u => 
      u.email.toLowerCase().includes(query) || 
      u.role.toLowerCase().includes(query)
    );
    this.refreshIcons();
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'badge-danger';
      case 'MEDECIN': return 'badge-primary';
      case 'PATIENT': return 'badge-success';
      default: return 'badge-info';
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
