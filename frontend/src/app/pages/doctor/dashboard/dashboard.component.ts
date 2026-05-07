import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService, Appointment } from '../../../core/services/appointment.service';
import { MedicalRecordService, MedicalRecord } from '../../../core/services/medical-record.service';
import { FormsModule } from '@angular/forms';

declare var lucide: any;

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DoctorDashboardComponent implements OnInit, AfterViewInit {
  appointments: Appointment[] = [];
  todayCount = 0;
  totalCount = 0;
  earnings = 0;

  sidebarItems = [
    { label: 'Appointments', icon: 'calendar', route: '/doctor/dashboard' },
    { label: 'My Patients', icon: 'users', route: '/doctor/patients' },
    { label: 'My Profile', icon: 'user-cog', route: '/doctor/profile' },
    { label: 'Reviews', icon: 'star', route: '/doctor/reviews' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  pendingCount = 0;
  confirmedCount = 0;
  currentDate = new Date();

  // Modal State
  showRecordModal = false;
  selectedAppointment: Appointment | null = null;
  recordForm: MedicalRecord = {
    notes: '',
    prescription: '',
    rendezvous_id: 0
  };
  hasRecordMap: { [key: number]: boolean } = {};

  constructor(
    public auth: AuthService, 
    private aptService: AppointmentService,
    private recordService: MedicalRecordService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  loadData(): void {
    this.aptService.getDoctorAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.totalCount = this.appointments.length;
        const today = new Date().toISOString().split('T')[0];
        this.todayCount = this.appointments.filter(a => (a.date_rdv || '').startsWith(today)).length;
        
        // Count statuses
        this.pendingCount = this.appointments.filter(a => {
          const s = (a.statut || '').toUpperCase();
          return s === 'PENDING' || s === 'PREVU';
        }).length;

        this.confirmedCount = this.appointments.filter(a => {
          const s = (a.statut || '').toUpperCase();
          return s === 'CONFIRMED' || s === 'CONFIRME';
        }).length;
        
        this.refreshIcons();
        this.checkRecords();
      }
    });
  }

  checkRecords(): void {
    this.appointments.forEach(apt => {
      if (apt.id) {
        this.recordService.getRecordByRendezvous(apt.id).subscribe(record => {
          this.hasRecordMap[apt.id!] = !!record;
        });
      }
    });
  }

  openRecordModal(apt: Appointment): void {
    this.selectedAppointment = apt;
    this.showRecordModal = true;
    this.recordForm = {
      notes: '',
      prescription: '',
      rendezvous_id: apt.id!
    };

    // If record exists, load it
    this.recordService.getRecordByRendezvous(apt.id!).subscribe(record => {
      if (record) {
        this.recordForm = { ...record };
      }
      this.refreshIcons();
    });
  }

  closeRecordModal(): void {
    this.showRecordModal = false;
    this.selectedAppointment = null;
  }

  saveRecord(): void {
    console.log('Saving record...', this.recordForm);
    if (!this.recordForm.notes || !this.recordForm.prescription) {
      console.warn('Form is incomplete');
      return;
    }

    this.recordService.saveRecord(this.recordForm).subscribe({
      next: (res) => {
        console.log('Record saved successfully:', res);
        this.hasRecordMap[this.recordForm.rendezvous_id] = true;
        this.closeRecordModal();
      },
      error: (err) => {
        console.error('Failed to save record:', err);
        alert('Error: Could not save the medical record. Check the console for details.');
      }
    });
  }


  updateStatus(id: number, status: string): void {
    this.aptService.updateStatus(id, status).subscribe({
      next: () => {
        const apt = this.appointments.find(a => a.id === id);
        if (apt) {
          apt.statut = status;
          this.loadData(); // Reload to update counts
        }
        this.refreshIcons();
      }
    });
  }

  getStatusClass(status: string): string {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PENDING':
      case 'PREVU': return 'badge-warning';
      case 'CONFIRMED':
      case 'CONFIRME': return 'badge-success-outline';
      case 'COMPLETED':
      case 'TERMINE': return 'badge-success';
      case 'REJECTED':
      case 'REFUSE':
      case 'ANNULE':
      case 'CANCELLED': return 'badge-destructive-outline';
      default: return 'badge-secondary';
    }
  }

  getStatusLabel(status: string): string {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PENDING':
      case 'PREVU': return 'Pending';
      case 'CONFIRMED':
      case 'CONFIRME': return 'Confirmed';
      case 'COMPLETED':
      case 'TERMINE': return 'Completed';
      case 'REJECTED':
      case 'REFUSE': return 'Rejected';
      case 'ANNULE':
      case 'CANCELLED': return 'Cancelled';
      default: return status;
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
