import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AiService } from '../../../core/services/ai.service';
import { Doctor } from '../../../core/services/doctor.service';

declare var lucide: any;

@Component({
  selector: 'app-questionnaire',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './questionnaire.component.html',
  styleUrl: './questionnaire.component.css'
})
export class QuestionnaireComponent implements OnInit, AfterViewInit {
  currentStep = 1;
  totalSteps = 4;
  showResults = false;
  
  patientInfo = {
    ageGroup: '',
    gender: ''
  };
  
  symptomText: string = '';
  selectedArea: string = '';
  severity: number = 5;
  symptomDuration: string = '';

  ageGroups = [
    { id: 'infant', label: 'Infant/Toddler', range: '(0-3)', icon: 'baby' },
    { id: 'child', label: 'Child/Teen', range: '(4-17)', icon: 'user' },
    { id: 'adult', label: 'Adult', range: '(18-64)', icon: 'user' },
    { id: 'senior', label: 'Senior', range: '(65+)', icon: 'users' }
  ];

  genders = [
    { id: 'female', label: 'Female', icon: 'venus' },
    { id: 'male', label: 'Male', icon: 'mars' }
  ];
  
  bodyAreas = [
    { id: 'head', label: 'Head/Brain', icon: 'brain' },
    { id: 'eyes', label: 'Eyes/Vision', icon: 'eye' },
    { id: 'ent', label: 'Ear/Nose/Throat', icon: 'ear' },
    { id: 'chest', label: 'Chest/Lungs', icon: 'heart' },
    { id: 'digestion', label: 'Digestion', icon: 'coffee' },
    { id: 'bones', label: 'Bones/Joints', icon: 'bone' },
    { id: 'skin', label: 'Skin/Hair', icon: 'scissors' },
    { id: 'mental', label: 'Mental Health', icon: 'smile' },
    { id: 'general', label: 'General/Other', icon: 'activity' }
  ];

  durations = [
    { id: '24h', label: 'Less than 24h' },
    { id: 'days', label: 'A few days' },
    { id: 'weeks', label: 'A few weeks' },
    { id: 'years', label: 'Months/Years' }
  ];

  sidebarItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/patient/dashboard' },
    { label: 'Find Doctor', icon: 'search', route: '/patient/questionnaire' },
    { label: 'Doctors', icon: 'users', route: '/patient/doctors' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  results: any[] = [];
  aiAnalysis: any = null;
  searching = false;

  constructor(
    private aiService: AiService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  canProceed(): boolean {
    if (this.currentStep === 1) return !!this.patientInfo.ageGroup && !!this.patientInfo.gender;
    if (this.currentStep === 2) return this.symptomText.length > 5;
    if (this.currentStep === 3) return !!this.selectedArea;
    if (this.currentStep === 4) return !!this.symptomDuration;
    return true;
  }

  nextStep(): void {
    if (this.currentStep === 4) {
      this.findDoctors();
      this.showResults = true;
    } else if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.refreshIcons();
    }
  }

  prevStep(): void {
    if (this.showResults) {
      this.showResults = false;
      this.refreshIcons();
    } else if (this.currentStep > 1) {
      this.currentStep--;
      this.refreshIcons();
    }
  }

  cancel(): void {
    this.router.navigate(['/patient/dashboard']);
  }

  findDoctors(): void {
    this.searching = true;
    const payload = {
      patient_info: this.patientInfo,
      symptoms: this.symptomText,
      area: this.selectedArea,
      severity: this.severity,
      duration: this.symptomDuration
    };

    this.aiService.analyzeResults(payload).subscribe({
      next: (res: any) => {
        this.aiAnalysis = res;
        this.results = res.doctors || [];
        this.searching = false;
        this.refreshIcons();
      },
      error: (err: any) => {
        console.error("Error analyzing symptoms:", err);
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

  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }
}