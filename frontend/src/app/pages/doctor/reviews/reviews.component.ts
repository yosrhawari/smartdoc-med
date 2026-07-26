import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

declare var lucide: any;

@Component({
  selector: 'app-doctor-reviews',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" title="Doctor"></app-sidebar>
      <main class="dashboard-main">
        <div class="page-header animate-fade-in-up">
          <h1>Patient Feedback</h1>
          <p class="subtitle">Insights from your patients to help you improve</p>
        </div>
        
        <div class="reviews-grid" *ngIf="!loading && reviews.length > 0">
          <div class="review-card animate-fade-in-up" *ngFor="let rev of reviews">
            <div class="review-header">
              <div class="stars">
                <i data-lucide="star" *ngFor="let filled of getStarArray(rev.note)" 
                   [class.filled]="filled" class="star-icon"></i>
              </div>
              <span class="review-date">
                <i data-lucide="calendar" class="w-3 h-3"></i>
                {{ rev.date }} {{ rev.heure || '' }}
              </span>
            </div>
            
            <div class="review-body">
              <p class="comment">"{{ rev.commentaire }}"</p>
              <div class="patient-info">
                <span>From: <strong>{{ rev.patient_email }}</strong></span>
              </div>
            </div>

            <div class="reply-section">
              <div class="existing-reply" *ngIf="rev.reponse_medecin">
                <div class="reply-header">
                  <i data-lucide="corner-down-right"></i>
                  <span>Your Reply</span>
                </div>
                <p>{{ rev.reponse_medecin }}</p>
              </div>

              <div class="reply-input-group" *ngIf="!rev.reponse_medecin || editingReplyId === rev.id">
                <input 
                  type="text" 
                  [(ngModel)]="replyTexts[rev.id]" 
                  placeholder="Write a reply..." 
                  class="reply-input">
                <button 
                  class="btn-reply" 
                  [disabled]="submittingId === rev.id || !replyTexts[rev.id]"
                  (click)="submitReply(rev.id)">
                  <span *ngIf="submittingId !== rev.id">Reply</span>
                  <i data-lucide="loader-2" class="animate-spin" *ngIf="submittingId === rev.id"></i>
                </button>
              </div>
              
              <button class="btn-edit-reply" *ngIf="rev.reponse_medecin && editingReplyId !== rev.id" (click)="editingReplyId = rev.id; replyTexts[rev.id] = rev.reponse_medecin">
                Edit Reply
              </button>
            </div>
          </div>
        </div>

        <div class="loading-state" *ngIf="loading">
          <i data-lucide="loader-2" class="animate-spin w-8 h-8 text-blue-500"></i>
          <p>Loading feedback...</p>
        </div>

        <div class="empty-state card" *ngIf="!loading && reviews.length === 0">
          <div class="empty-icon">
            <i data-lucide="message-square-off" class="w-12 h-12 text-slate-300"></i>
          </div>
          <h3>No Reviews Yet</h3>
          <p>When patients leave feedback after their appointments, it will appear here.</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; }
    .dashboard-main { flex: 1; padding: 2.5rem 4rem; }
    
    .page-header { margin-bottom: 3rem; }
    .page-header h1 { font-size: 2.5rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem; letter-spacing: -0.025em; }
    .subtitle { color: #64748b; font-size: 1.125rem; }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
      gap: 2rem;
    }

    .review-card {
      background: white;
      border-radius: 1.25rem;
      border: 1px solid #f1f5f9;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      transition: all 0.3s ease;
    }

    .review-card:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
      border-color: #e2e8f0;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stars { display: flex; gap: 4px; }
    .star-icon { width: 1.25rem; height: 1.25rem; color: #e2e8f0; }
    .star-icon.filled { color: #fbbf24; fill: #fbbf24; }

    .review-date {
      font-size: 0.8125rem;
      color: #94a3b8;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .review-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .comment {
      font-size: 1.0625rem;
      line-height: 1.6;
      color: #334155;
      font-style: italic;
      margin: 0;
    }

    .patient-info {
      font-size: 0.875rem;
      color: #64748b;
    }

    .reply-section {
      padding-top: 1.5rem;
      border-top: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .existing-reply {
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: 1rem;
      border: 1px solid #f1f5f9;
    }

    .reply-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 800;
      color: #64748b;
      margin-bottom: 0.75rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .existing-reply p {
      color: #334155;
      margin: 0;
      font-size: 0.9375rem;
      line-height: 1.5;
    }

    .reply-input-group {
      display: flex;
      gap: 0.75rem;
    }

    .reply-input {
      flex: 1;
      padding: 0.875rem 1.25rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.875rem;
      font-size: 0.9375rem;
      transition: all 0.2s;
    }

    .reply-input:focus {
      outline: none;
      border-color: #3b82f6;
      background: white;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .btn-reply {
      padding: 0 1.5rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-reply:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-reply:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-edit-reply {
      align-self: flex-start;
      background: none;
      border: none;
      color: #3b82f6;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }

    .btn-edit-reply:hover { text-decoration: underline; }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6rem 2rem;
      text-align: center;
      color: #64748b;
      gap: 1.5rem;
    }

    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DoctorReviewsComponent implements OnInit, AfterViewInit {
  reviews: any[] = [];
  loading = false;
  replyTexts: { [key: number]: string } = {};
  submittingId: number | null = null;
  editingReplyId: number | null = null;

  sidebarItems = [
    { label: 'Appointments', icon: 'calendar', route: '/doctor/dashboard' },
    { label: 'My Patients', icon: 'users', route: '/doctor/patients' },
    { label: 'My Profile', icon: 'user-cog', route: '/doctor/profile' },
    { label: 'Reviews', icon: 'star', route: '/doctor/reviews' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  constructor(
    private reviewService: ReviewService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  loadReviews(): void {
    this.loading = true;
    this.reviewService.getMyReviews().subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
        this.refreshIcons();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  submitReply(reviewId: number): void {
    const text = this.replyTexts[reviewId];
    if (!text) return;

    this.submittingId = reviewId;
    this.reviewService.replyToReview(reviewId, text).subscribe({
      next: (updated) => {
        const idx = this.reviews.findIndex(r => r.id === reviewId);
        if (idx !== -1) {
          this.reviews[idx].reponse_medecin = updated.reponse_medecin;
        }
        this.submittingId = null;
        this.editingReplyId = null;
        this.replyTexts[reviewId] = '';
        this.refreshIcons();
      },
      error: () => {
        this.submittingId = null;
      }
    });
  }

  getStarArray(note: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < note);
  }

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }
}
