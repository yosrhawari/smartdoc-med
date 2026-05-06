import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService, Appointment } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-patients',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class DoctorPatientsComponent implements OnInit {
  patients: any[] = [];
  loading = false;

  sidebarItems = [
    { label: 'Dashboard', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', route: '/doctor/dashboard' },
    { label: 'Patients', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>', route: '/doctor/patients' },
    { label: 'My Profile', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', route: '/doctor/profile' }
  ];

  constructor(
    private auth: AuthService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.doctorService.getMyPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
