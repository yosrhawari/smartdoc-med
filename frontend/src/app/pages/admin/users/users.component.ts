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
  
  // Edit Modal State
  showEditModal = false;
  selectedUser: any = null;
  editForm = {
    email: '',
    password: '',
    role: '',
    specialite_nom: ''
  };

  sidebarItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/admin/dashboard' },
    { label: 'Users', icon: 'users', route: '/admin/users' },
    { label: 'Medical Providers', icon: 'stethoscope', route: '/admin/doctors' },
    { label: 'Verification', icon: 'shield-check', route: '/admin/verification' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
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
      u.role.toLowerCase().includes(query) ||
      u.nom?.toLowerCase().includes(query) ||
      u.prenom?.toLowerCase().includes(query)
    );
    this.refreshIcons();
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'badge-danger';
      case 'MEDECIN': return 'badge-primary';
      case 'PATIENT': return 'badge-patient-premium';
      default: return 'badge-info';
    }
  }

  // CRUD Actions
  openEditModal(user: any): void {
    this.selectedUser = user;
    this.editForm = {
      email: user.email,
      password: '',
      role: user.role,
      specialite_nom: '' // Should fetch if needed, but for now empty
    };
    this.showEditModal = true;
    this.refreshIcons();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  saveUser(): void {
    if (!this.selectedUser) return;
    
    this.adminService.updateUser(this.selectedUser.id, this.editForm).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadUsers();
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
        }
      });
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
