import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService } from '../../../core/services/admin.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class AdminDoctorsComponent implements OnInit {

  allDoctors: any[] = [];
  loading = true;

  constructor(
    private adminService: AdminService,
    private doctorService: DoctorService,
    private router: Router
  ) {}

  sidebarItems = [
    { label: 'Dashboard', icon: '', route: '/admin/dashboard' },
    { label: 'Users', icon: '', route: '/admin/users' },
    { label: 'Verification', icon: '', route: '/admin/doctors' }
  ];

  ngOnInit(): void {
   this.adminService.getAllDoctors().subscribe({
    next: (data: any[]) => {
      console.log("DATA =", data); 
      this.allDoctors = data;
      this.loading = false;
    },
    error: (err: any) => {
      console.error("ERROR =", err);
      this.loading = false;
    }
  });
  }

  

  validateDoctor(id: number): void {
    this.adminService.validateDoctor(id).subscribe({
      next: () => {
        const doc = this.allDoctors.find(d => d.id === id);
        if (doc) doc.statut_validation = 'VALIDE';
      }
    });
  }

  goToDoctor(id: number) {
    this.router.navigate(['/admin/doctor', id]);
  }

  getStatusClass(status: string): string {
    return status === 'VALIDE' ? 'badge-success' : 'badge-warning';
  }

  getStatusLabel(status: string): string {
    return status === 'VALIDE' ? 'Verified' : 'Pending';
  }

  selectedDoctor: any = null;

  viewDoctorDetails(doctor: any) {
    this.selectedDoctor = doctor;
  }

  closeDetails() {
    this.selectedDoctor = null;
  }
}
