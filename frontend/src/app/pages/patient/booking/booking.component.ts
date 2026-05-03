import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { DoctorService, Doctor } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent implements OnInit {
  doctorId: number = 0;
  selectedDate: string = '';
  selectedTime: string = '';
  booked = false;
  bookedId: string | null = null;
  loading = false;
  error = '';
  doctor: Doctor | null = null;

  currentMonth: Date = new Date();
  calendarDays: (number | null)[] = [];

  timeSlots: string[] = [];
  loadingSlots = false;

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.doctorId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDoctor();
    this.generateCalendar();
  }

  loadDoctor(): void {
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctor = doctors.find(d => d.id === this.doctorId) || null;
      }
    });
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    this.calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarDays.push(day);
    }
  }

  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(day: number): void {
    if (!this.isPastDate(day)) {
      const month = String(this.currentMonth.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      this.selectedDate = `${this.currentMonth.getFullYear()}-${month}-${dayStr}`;
      this.selectedTime = '';
      this.fetchSlots();
    }
  }

  fetchSlots(): void {
    this.loadingSlots = true;
    this.appointmentService.getAvailableSlots(this.doctorId, this.selectedDate).subscribe({
      next: (res: any) => {
        this.timeSlots = res.available_slots;
        this.loadingSlots = false;
      },
      error: () => {
        this.loadingSlots = false;
        this.error = 'Could not load availability. Please try again.';
      }
    });
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  isSelectedDay(day: number): boolean {
    const month = String(this.currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return this.selectedDate === `${this.currentMonth.getFullYear()}-${month}-${dayStr}`;
  }

isPastDate(day: number): boolean {
  const checkDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkDate < today;
}

  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() &&
           this.currentMonth.getMonth() === today.getMonth() &&
           this.currentMonth.getFullYear() === today.getFullYear();
  }

  getMonthName(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  canBook(): boolean {
    return !!this.selectedDate && !!this.selectedTime;
  }

  confirmBooking(): void {
    if (!this.canBook()) return;

    this.loading = true;
    this.error = '';

  this.appointmentService.createAppointment({
    medecin_id: this.doctorId,
    date: this.selectedDate,
    heure: this.selectedTime
  }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.booked = true;
        this.bookedId = res.id;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Booking failed. Please try again.';
      }
    });
  }
}
