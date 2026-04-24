import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data?.['role'] as string;
  const currentRole = authService.getRole();

  if (authService.isLoggedIn() && currentRole === expectedRole) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
