import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AiService } from '../../../core/services/ai.service';

@Component({
  selector: 'app-questionnaire',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './questionnaire.component.html',
  styleUrl: './questionnaire.component.css'
})
export class QuestionnaireComponent {
  currentStep = 1;
  totalSteps = 3;

  // Step 1 - Symptom category
  categories = [
    { id: 'general', label: 'General Health', icon: '🏥', keywords: 'fatigue fever pain' },
    { id: 'cardio', label: 'Heart & Cardio', icon: '❤️', keywords: 'heart chest pain palpitations' },
    { id: 'derma', label: 'Skin Issues', icon: '🩹', keywords: 'rash skin allergy itching' },
    { id: 'neuro', label: 'Neurological', icon: '🧠', keywords: 'headache migraine dizziness' },
    { id: 'ortho', label: 'Bones & Joints', icon: '🦴', keywords: 'back pain joint fracture' },
    { id: 'dental', label: 'Dental', icon: '🦷', keywords: 'tooth pain dental cavity' }
  ];
  selectedCategory = '';

  // Step 2 - Describe symptoms
  symptomText = '';
  symptomDuration = '';

  // Step 3 - Results
  results: any[] = []; // List mtaa el medecins jaya mel Backend
  aiAnalysis: any = null; // Resultat mtaa el IA (specialite)
  searching = false;

  sidebarItems = [
    { label: 'Dashboard', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', route: '/patient/dashboard' },
    { label: 'Find Doctor', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>', route: '/patient/questionnaire' },
    { label: 'Doctors', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>', route: '/patient/doctors' }
  ];

  constructor(
    private aiService: AiService, 
    private router: Router
  ) {}

  selectCategory(id: string): void {
    this.selectedCategory = id;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      if (this.currentStep === 3) {
        this.runAiPrediction();
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      // Reset results if going back from Step 3
      if (this.currentStep < 3) {
        this.results = [];
        this.aiAnalysis = null;
      }
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1: return !!this.selectedCategory;
      case 2: return this.symptomText.length >= 3;
      default: return true;
    }
  }

  runAiPrediction(): void {
    this.searching = true;
    
    // IMPORTANT: El key lezem ykoun 'symptome' kima tistanna el FastAPI mteek
    const category = this.categories.find(c => c.id === this.selectedCategory);
    const fullSymptomDescription = `${category?.label}: ${this.symptomText}. Duration: ${this.symptomDuration}`;

    const payload = {
      symptome: fullSymptomDescription
    };

    this.aiService.analyzeResults(payload).subscribe({
      next: (res) => {
        // res hna fih { "symptome": "...", "specialite": "...", "medecins": [...] }
        this.aiAnalysis = res;
        this.results = res.medecins;
        this.searching = false;
      },
      error: (err) => {
        console.error("Erreur lors de la prédiction IA:", err);
        this.searching = false;
      }
    });
  }

  bookDoctor(doctorId: number): void {
    this.router.navigate(['/patient/book', doctorId]);
  }

  getStarArray(rating: number = 5): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }
}