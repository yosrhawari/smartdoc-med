import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { Router } from '@angular/router';

declare var lucide: any;

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-approval.component.html',
  styleUrl: './pending-approval.component.css'
})
export class PendingApprovalComponent implements OnInit {
  checking = false;

  constructor(
    public authService: AuthService,
    private doctorService: DoctorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshIcons();
    // Auto check on load
    this.checkStatus();
  }

  checkStatus(): void {
    this.checking = true;
    this.doctorService.getMyProfile().subscribe({
      next: (profile) => {
        this.checking = false;
        if (profile?.statut_validation === 'VALIDE') {
          this.router.navigate(['/doctor/dashboard']);
        }
        this.refreshIcons();
      },
      error: () => {
        this.checking = false;
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
}
