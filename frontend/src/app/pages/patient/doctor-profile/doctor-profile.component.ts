import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DoctorService, Doctor } from '../../../core/services/doctor.service';
import { ReviewService, Review } from '../../../core/services/review.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
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
  ) { }

  ngOnInit(): void {
    this.doctorId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDoctor();
    this.loadReviews();
  }

 loadDoctor(): void {
  this.doctorService.getDoctorById(this.doctorId).subscribe({
    next: (doctor) => {
      this.doctor = doctor;
      this.loading = false;
    },
    error: () => {
      this.loading = false;
    }
  });

  }

  loadReviews(): void {
    forkJoin({
      reviews: this.reviewService.getReviews(),
      apts: this.appointmentService.getAppointments()
    }).subscribe({
      next: ({ reviews, apts }) => {
        this.reviews = reviews;
        const doctorAptIds = apts
          .filter(a => a.medecin_id === this.doctorId)
          .map(a => a.id);
        this.doctorReviews = reviews.filter(r => doctorAptIds.includes(r.rendezvous_id));
        if (this.doctorReviews.length > 0) {
          this.averageRating = this.doctorReviews.reduce((sum, r) => sum + r.note, 0) / this.doctorReviews.length;
        }
      },
      error: () => {
        console.error('Failed to load reviews');
      }
    });
  }

  getStarArray(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }
}
