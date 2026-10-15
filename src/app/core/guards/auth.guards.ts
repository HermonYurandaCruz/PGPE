import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../shared/models/auth.models';

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(...allowedRoles)) {
      return true;
    }

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    return router.createUrlTree(['/acesso-negado']);
  };
}
