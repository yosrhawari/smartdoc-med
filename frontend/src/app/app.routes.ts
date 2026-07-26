import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },

  // Auth
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Patient Routes
  {
    path: 'patient/dashboard',
    loadComponent: () => import('./pages/patient/dashboard/dashboard.component').then(m => m.PatientDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'PATIENT' }
  },
  {
    path: 'patient/questionnaire',
    loadComponent: () => import('./pages/patient/questionnaire/questionnaire.component').then(m => m.QuestionnaireComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'PATIENT' }
  },
  {
    path: 'patient/doctors',
    loadComponent: () => import('./pages/patient/doctor-list/doctor-list.component').then(m => m.DoctorListComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'PATIENT' }
  },
  {
    path: 'patient/doctor/:id',
    loadComponent: () => import('./pages/patient/doctor-profile/doctor-profile.component').then(m => m.DoctorProfileComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'PATIENT' }
  },
  {
    path: 'patient/book/:id',
    loadComponent: () => import('./pages/patient/booking/booking.component').then(m => m.BookingComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'PATIENT' }
  },

  // Doctor Routes
  {
    path: 'doctor/dashboard',
    loadComponent: () => import('./pages/doctor/dashboard/dashboard.component').then(m => m.DoctorDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEDECIN' }
  },

  {
    path: 'doctor/complete-profile',
    loadComponent: () => import('./pages/doctor/complete-profile/complete-profile.component').then(m => m.CompleteProfileComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEDECIN' }
  },
  {
    path: 'doctor/pending-approval',
    loadComponent: () => import('./pages/doctor/pending-approval/pending-approval.component').then(m => m.PendingApprovalComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEDECIN' }
  },

  {
    path: 'doctor/patients',
    loadComponent: () => import('./pages/doctor/patients/patients.component').then(m => m.DoctorPatientsComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEDECIN' }
  },
  {
    path: 'doctor/profile',
    loadComponent: () => import('./pages/doctor/profile-edit/profile-edit.component').then(m => m.DoctorProfileEditComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEDECIN' }
  },
  {
    path: 'doctor/reviews',
    loadComponent: () => import('./pages/doctor/reviews/reviews.component').then(m => m.DoctorReviewsComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MEDECIN' }
  },

  // Admin Routes
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/admin/users/users.component').then(m => m.AdminUsersComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/doctors',
    loadComponent: () => import('./pages/admin/doctors/doctors.component').then(m => m.AdminDoctorsComponent),
    canActivate: [roleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/verification',
    loadComponent: () => import('./pages/admin/verification/verification.component').then(m => m.AdminVerificationComponent),
    canActivate: [roleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/doctor/:id',
    loadComponent: () => import('./pages/patient/doctor-profile/doctor-profile.component').then(m => m.DoctorProfileComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' }
  },

  // Shared Settings
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
