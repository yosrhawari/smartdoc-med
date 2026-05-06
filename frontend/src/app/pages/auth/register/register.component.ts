import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  // --- CHAMPS COMMUNS ---
  nom = '';
  prenom = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = 'PATIENT'; // Par défaut

  // --- CHAMPS MÉDECIN ---
  selectedSpecialite = '';
  autreSpecialite = '';
  adresse = '';
  tarif: number = 0;
  biographie = '';
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  // --- DATA & UI ---
  specialites: any[] = [];
  error = '';
  success = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.doctorService.getSpecialites().subscribe({
      next: (data) => this.specialites = data,
      error: () => console.error('Failed to load specialites')
    });
  }

  selectRole(role: string): void {
    this.role = role;
    this.error = ''; // Reset error quand on change de rôle
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
  this.error = '';
  this.loading = true;

  if (this.role === 'MEDECIN') {
    // 1. Thabbet elli el image mawjouda
    if (!this.selectedFile) {
      this.error = "L'image est obligatoire";
      this.loading = false;
      return;
    }

    // 2. 3abbi el FormData b-kol chay (Auth + Profil)
    const formData = new FormData();
    
    // DATA AUTH (lezem el backend ya9rahom bech yasna3 el User)
    formData.append('nom', this.nom);
    formData.append('prenom', this.prenom);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('role', 'MEDECIN');

    // DATA PROFIL
    formData.append('adresse', this.adresse);
    formData.append('tarif', this.tarif.toString());
    formData.append('biographie', this.biographie);
    formData.append('specialite_nom', this.selectedSpecialite === 'autre' ? this.autreSpecialite : this.selectedSpecialite);
    
    // IMAGE
    formData.append('image', this.selectedFile);

    // 3. APPEL WEHED BARKA (One-Shot)
    this.doctorService.registerDoctor(formData).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Compte créé avec succès !';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        // Houni i9ollek "User not found" ken el Backend ma yasna3ch User
        this.error = err.error?.detail || 'Erreur lors de la création';
      }
    });
  } 
    // 3. CAS PATIENT : Envoi JSON simple
    else {
      const payload = {
        nom: this.nom,
        prenom: this.prenom,
        email: this.email,
        password: this.password,
        role: "PATIENT"
      };

      this.authService.register(payload).subscribe({
        next: () => {
          this.loading = false;
          this.success = 'Compte patient créé avec succès !';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.error = err.error?.detail || 'L\'inscription a échoué';
        }
      });
    }
  }
}