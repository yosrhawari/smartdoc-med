import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  features = [
    {
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a5 5 0 015 5c0 3.87-5 9-5 9s-5-5.13-5-9a5 5 0 015-5z"/><circle cx="12" cy="7" r="1.5"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>`,
      title: 'AI Doctor Match',
      description: 'Our intelligent algorithm analyzes your symptoms and matches you with the most qualified specialists in seconds.'
    },
    {
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>`,
      title: 'Easy Booking',
      description: 'Book appointments with just a few clicks. Choose your preferred date, time, and doctor — all online.'
    },
    {
      icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
      title: 'Verified Reviews',
      description: 'Read authentic reviews from real patients to make informed decisions about your healthcare provider.'
    }
  ];

  stats = [
    { value: '500+', label: 'Verified Doctors' },
    { value: '10K+', label: 'Happy Patients' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support Available' }
  ];
}
