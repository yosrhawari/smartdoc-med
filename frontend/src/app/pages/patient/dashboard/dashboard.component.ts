import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService, Appointment } from '../../../core/services/appointment.service';
import { MedicalRecordService } from '../../../core/services/medical-record.service';
import { ReviewService } from '../../../core/services/review.service';
import { FormsModule } from '@angular/forms';

declare var lucide: any;

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit, AfterViewInit {
  appointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  medicalRecords: any[] = [];
  loading = false;

  // Review Flow State
  expandedRecordId: number | null = null;
  reviewNote = 0;
  reviewComment = '';
  submittingReview = false;
  reviewSuccess = '';
  reviewError = '';

  sidebarItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/patient/dashboard' },
    { label: 'Find Doctor', icon: 'search', route: '/patient/questionnaire' },
    { label: 'Doctors', icon: 'users', route: '/patient/doctors' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  constructor(
    public auth: AuthService,
    private appointmentService: AppointmentService,
    private recordService: MedicalRecordService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  loadData(): void {
    this.loading = true;
    
    // Load Appointments
    this.appointmentService.getMyAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.upcomingAppointments = data.filter(a => 
          a.statut.toUpperCase() === 'PENDING' || a.statut.toUpperCase() === 'PREVU' || a.statut.toUpperCase() === 'CONFIRMED'
        ).slice(0, 3);
        this.refreshIcons();
      }
    });

    // Load Medical Records
    this.recordService.getMyRecords().subscribe({
      next: (data) => {
        this.medicalRecords = data;
        this.loading = false;
        this.refreshIcons();
      }
    });
  }

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }

  formatDate(dateStr: string): { day: string, month: string } {
    try {
      const date = new Date(dateStr);
      const months = ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOUT', 'SEPT', 'OCT', 'NOV', 'DEC'];
      return {
        day: date.getDate().toString().padStart(2, '0'),
        month: months[date.getMonth()]
      };
    } catch (e) {
      return { day: '--', month: '---' };
    }
  }

  getStatusClass(status: string): string {
    const s = status.toUpperCase();
    if (s === 'PREVU' || s === 'PENDING') return 'status-pending';
    if (s === 'CONFIRME' || s === 'CONFIRMED') return 'status-confirmed';
    if (s === 'TERMINE' || s === 'COMPLETED') return 'status-completed';
    return 'status-cancelled';
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  // Review Methods
  toggleReview(rdvId: number): void {
    if (this.expandedRecordId === rdvId) {
      this.expandedRecordId = null;
    } else {
      this.expandedRecordId = rdvId;
      this.reviewNote = 0;
      this.reviewComment = '';
      this.reviewSuccess = '';
      this.reviewError = '';
    }
    this.refreshIcons();
  }

  setRating(note: number): void {
    this.reviewNote = note;
    this.refreshIcons();
  }

  submitReview(rdvId: number): void {
    if (this.reviewNote === 0) {
      this.reviewError = 'Please select a rating';
      return;
    }

    this.submittingReview = true;
    this.reviewError = '';

    const payload = {
      rendezvous_id: rdvId,
      note: this.reviewNote,
      commentaire: this.reviewComment
    };

    this.reviewService.createReview(payload).subscribe({
      next: () => {
        this.submittingReview = false;
        this.reviewSuccess = 'Thank you for your feedback!';
        
        // Update local state to show "Saved" state
        const record = this.medicalRecords.find(r => r.rendezvous_id === rdvId);
        if (record) {
          record.review = { note: this.reviewNote, commentaire: this.reviewComment };
        }
        this.refreshIcons();

        setTimeout(() => {
          this.expandedRecordId = null;
          this.reviewSuccess = '';
        }, 1500);
      },
      error: (err) => {
        this.submittingReview = false;
        this.reviewError = err.error?.detail || 'Failed to submit review. Have you already reviewed this visit?';
      }
    });
  }
}
