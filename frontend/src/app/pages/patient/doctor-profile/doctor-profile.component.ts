import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DoctorService, Doctor } from '../../../core/services/doctor.service';
import { ReviewService, Review } from '../../../core/services/review.service';
import { AppointmentService } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.css'
})
export class DoctorProfileComponent implements OnInit {
  doctorId: number = 0;
  doctor: Doctor | null = null;
  reviews: Review[] = [];
  doctorReviews: Review[] = [];
  averageRating = 0;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private reviewService: ReviewService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.doctorId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDoctor();
    this.loadReviews();
  }

  loadDoctor(): void {
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctor = doctors.find(d => d.id === this.doctorId) || null;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadReviews(): void {
    this.reviewService.getReviews().subscribe({
      next: (reviews) => {
        // Filter reviews for this doctor's appointments
        this.reviews = reviews;
        this.appointmentService.getAppointments().subscribe({
          next: (apts) => {
            const doctorAptIds = apts
              .filter(a => a.medecin_id === this.doctorId)
              .map(a => a.id);
            this.doctorReviews = reviews.filter(r => doctorAptIds.includes(r.rendezvous_id));
            if (this.doctorReviews.length > 0) {
              this.averageRating = this.doctorReviews.reduce((sum, r) => sum + r.note, 0) / this.doctorReviews.length;
            }
          }
        });
      }
    });
  }

  getStarArray(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }
}
