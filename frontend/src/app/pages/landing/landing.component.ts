import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

declare var lucide: any;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements AfterViewInit {
  features = [
    {
      icon: 'sparkles',
      title: 'AI Recommendations',
      description: 'Smart matching with the right doctor based on your symptoms and needs.'
    },
    {
      icon: 'calendar',
      title: 'Easy Booking',
      description: 'Schedule appointments instantly with real-time availability.'
    },
    {
      icon: 'shield',
      title: 'Verified Reviews',
      description: 'Authentic patient reviews from verified appointments.'
    },
    {
      icon: 'clock',
      title: '24/7 Access',
      description: 'Book and manage appointments anytime, anywhere.'
    }
  ];

  stats = [
    { value: '10k+', label: 'Active Patients' },
    { value: '500+', label: 'Verified Doctors' },
    { value: '50k+', label: 'Appointments' },
    { value: '4.9', label: 'Average Rating' }
  ];

  constructor(public auth: AuthService) {}

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  getDashboardLink(): string {
    return this.auth.getDashboardRoute();
  }
}
