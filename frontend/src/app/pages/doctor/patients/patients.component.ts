import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService, Appointment } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-doctor-patients',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class DoctorPatientsComponent implements OnInit {
  patients: { id: number; appointmentCount: number; lastVisit: string }[] = [];

  sidebarItems = [
    { label: 'Dashboard', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', route: '/doctor/dashboard' },
    { label: 'Patients', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>', route: '/doctor/patients' },
    { label: 'My Profile', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', route: '/doctor/profile' }
  ];

  constructor(private auth: AuthService, private aptService: AppointmentService) {}

  ngOnInit(): void {
    this.aptService.getAppointments().subscribe({
      next: (data) => {
        const userId = this.auth.getUserId();
        const myApts = data.filter(a => a.medecin_id === userId);

        const patientMap = new Map<number, { count: number; lastDate: string }>();
        myApts.forEach(apt => {
          const existing = patientMap.get(apt.patient_id);
          if (existing) {
            existing.count++;
            if (apt.date_rdv > existing.lastDate) existing.lastDate = apt.date_rdv;
          } else {
            patientMap.set(apt.patient_id, { count: 1, lastDate: apt.date_rdv });
          }
        });

        this.patients = Array.from(patientMap.entries()).map(([id, info]) => ({
          id,
          appointmentCount: info.count,
          lastVisit: info.lastDate
        }));
      }
    });
  }
}
