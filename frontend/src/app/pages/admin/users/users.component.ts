import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService, User } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  loading = true;

  sidebarItems = [
    { label: 'Dashboard', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', route: '/admin/dashboard' },
    { label: 'Users', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>', route: '/admin/users' },
    { label: 'Verification', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', route: '/admin/doctors' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase(); //<!-- convertir la requête de recherche en minuscules pour une comparaison insensible à la casse -->
    this.filteredUsers = this.users.filter(u => //<!-- filtrer les utilisateurs en fonction de la requête de recherche -->
      u.email.toLowerCase().includes(q) || //<!-- vérifier si l'email de l'utilisateur contient la requête de recherche -->
      u.role.toLowerCase().includes(q)
    );
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {//<!-- retourner une classe CSS différente en fonction du rôle de l'utilisateur -->
      case 'ADMIN': return 'badge-danger';
      case 'MEDECIN': return 'badge-primary';
      case 'PATIENT': return 'badge-success';
      default: return 'badge-info';
    }
  }
}
