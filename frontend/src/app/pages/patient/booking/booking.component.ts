import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent implements OnInit {

  doctorId: number = 0;
  doctor: any; 

  selectedDate: string = '';
  selectedTime: string = '';
  booked = false;
  loading = false;
  error = '';

  currentMonth: Date = new Date();
  calendarDays: (number | null)[] = [];

  timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    // 
    this.doctorId = Number(this.route.snapshot.paramMap.get('id'));

    console.log("doctorId =", this.doctorId);

    // 
    this.doctorService.getDoctorById(this.doctorId).subscribe({
      next: (res) => {
        console.log("doctor =", res);
        this.doctor = res;
        
      },
      error: () => {
        this.error = "Doctor not found";
      }
    });

    this.generateCalendar();
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
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  selectDate(day: number): void {
    if (!this.isPastDate(day)) {
      const month = String(this.currentMonth.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');

      this.selectedDate = `${this.currentMonth.getFullYear()}-${month}-${dayStr}`;
    }
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
    const date = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      day
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date < today;
  }

  isToday(day: number): boolean {
    const today = new Date();

    return (
      day === today.getDate() &&
      this.currentMonth.getMonth() === today.getMonth() &&
      this.currentMonth.getFullYear() === today.getFullYear()
    );
  }

  getMonthName(): string {
    return this.currentMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }

  canBook(): boolean {
    return !!this.selectedDate && !!this.selectedTime;
  }

  bookAppointment(): void {
    if (!this.canBook()) return;

    this.loading = true;
    this.error = '';

    const dateTime = `${this.selectedDate} ${this.selectedTime}`;

    // request clean
    this.appointmentService.createAppointment({
      medecin_id: this.doctorId,
      date_rdv: dateTime,
      heure: this.selectedTime
    }).subscribe({
      next: () => {
        this.loading = false;
        this.booked = true;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Booking failed';
      }
    });
  }
}