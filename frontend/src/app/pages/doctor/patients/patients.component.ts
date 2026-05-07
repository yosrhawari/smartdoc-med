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
  currentView: 'list' | 'history' = 'list';
  selectedPatient: any = null;
  patientHistory: any[] = [];

  sidebarItems = [
    { label: 'Appointments', icon: 'calendar', route: '/doctor/dashboard' },
    { label: 'My Patients', icon: 'users', route: '/doctor/patients' },
    { label: 'My Profile', icon: 'user-cog', route: '/doctor/profile' },
    { label: 'Reviews', icon: 'star', route: '/doctor/reviews' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  constructor(
    private auth: AuthService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
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

  viewHistory(patient: any): void {
    this.selectedPatient = patient;
    this.currentView = 'history';
    this.loading = true;
    this.doctorService.getPatientHistory(patient.id).subscribe({
      next: (data) => {
        this.patientHistory = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.currentView = 'list';
    this.selectedPatient = null;
    this.patientHistory = [];
  }
}
