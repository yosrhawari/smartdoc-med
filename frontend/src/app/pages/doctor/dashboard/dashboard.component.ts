import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService, Appointment } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DoctorDashboardComponent implements OnInit {
  appointments: Appointment[] = [];
  todayCount = 0;
  totalCount = 0;

  sidebarItems = [
    { label: 'Dashboard', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', route: '/doctor/dashboard' },
    { label: 'Patients', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>', route: '/doctor/patients' },
    { label: 'My Profile', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', route: '/doctor/profile' }
  ];

  constructor(public auth: AuthService, private aptService: AppointmentService) {}

  ngOnInit(): void {
    this.aptService.getAppointments().subscribe({
      next: (data) => {
        const userId = this.auth.getUserId();
        this.appointments = data.filter(a => a.medecin_id === userId);
        this.totalCount = this.appointments.length;
        const today = new Date().toISOString().split('T')[0];
        this.todayCount = this.appointments.filter(a => a.date_rdv.startsWith(today)).length;
      }
    });
  }

  updateStatus(id: number, status: string): void {
    this.aptService.updateStatus(id, status).subscribe({
      next: () => {
        const apt = this.appointments.find(a => a.id === id);
        if (apt) apt.statut = status;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PREVU': return 'badge-primary';
      case 'TERMINE': return 'badge-success';
      case 'ANNULE': return 'badge-danger';
      default: return 'badge-warning';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PREVU': return 'Scheduled';
      case 'TERMINE': return 'Completed';
      case 'ANNULE': return 'Cancelled';
      default: return status;
    }
  }
}
