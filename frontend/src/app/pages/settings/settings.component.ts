import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';

declare var lucide: any;

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit, AfterViewInit {
  sidebarItems: any[] = [];
  
  settings = {
    emailNotifications: true,
    smsNotifications: false,
    publicProfile: true,
    language: 'english'
  };

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    const role = this.auth.getRole();
    if (role === 'ADMIN') {
      this.sidebarItems = [
        { label: 'Dashboard', icon: 'layout-dashboard', route: '/admin/dashboard' },
        { label: 'Users', icon: 'users', route: '/admin/users' },
        { label: 'Verification', icon: 'shield-check', route: '/admin/doctors' },
        { label: 'Settings', icon: 'settings', route: '/settings' }
      ];
    } else if (role === 'MEDECIN') {
      this.sidebarItems = [
        { label: 'Appointments', icon: 'calendar', route: '/doctor/dashboard' },
        { label: 'My Patients', icon: 'users', route: '/doctor/patients' },
        { label: 'My Profile', icon: 'user-cog', route: '/doctor/profile' },
        { label: 'Reviews', icon: 'star', route: '/doctor/reviews' },
        { label: 'Settings', icon: 'settings', route: '/settings' }
      ];
    } else {
      this.sidebarItems = [
        { label: 'Dashboard', icon: 'layout-dashboard', route: '/patient/dashboard' },
        { label: 'Find Doctor', icon: 'search', route: '/patient/questionnaire' },
        { label: 'Doctors', icon: 'users', route: '/patient/doctors' },
        { label: 'Settings', icon: 'settings', route: '/settings' }
      ];
    }
  }


  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  saveSettings(): void {
    // Placeholder for actual save logic
    alert('Settings saved successfully!');
  }

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }
}
