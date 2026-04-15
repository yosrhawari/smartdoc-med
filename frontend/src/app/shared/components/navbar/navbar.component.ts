import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  mobileMenuOpen = false;

  constructor(public auth: AuthService) {}

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  getDashboardLink(): string {
    const role = this.auth.getRole();
    switch(role) {
      case 'PATIENT': return '/patient/dashboard';
      case 'MEDECIN': return '/doctor/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/';
    }
  }
}
