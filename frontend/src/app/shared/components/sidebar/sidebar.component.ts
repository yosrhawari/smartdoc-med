import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

declare var lucide: any;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements AfterViewInit, OnChanges {
  @Input() items: any[] = [];
  @Input() title: string = '';
  collapsed = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.refreshIcons();
    }
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.refreshIcons();
  }

  navigateDashboard(): void {
    this.router.navigate([this.auth.getDashboardRoute()]);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }


  private refreshIcons(): void {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }
}
