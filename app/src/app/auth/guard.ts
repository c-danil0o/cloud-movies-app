import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { of, switchMap } from "rxjs";

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.getSession().pipe(switchMap((session) => {
    if (session != null) {
      let groups: string[] = (session.getIdToken().decodePayload()['cognito:groups'])
      authService.updateRole(authService.extractRole(session))
      if (groups.length == 0)
        return of(false)
      return of(groups.includes('Admin') || groups.includes("User"));
    } else {
      router.navigate(['/login']);
      return of(false)
    }

  }));
};
export const authGuard_admin: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.getSession().pipe(switchMap((session) => {
    if (session != null) {
      let groups: string[] = (session.getIdToken().decodePayload()['cognito:groups'])
      authService.updateRole(authService.extractRole(session))
      if (groups.length == 0)
        return of(false)
      return of(groups.includes('Admin'));
    } else {
      router.navigate(['/login']);
      return of(false)
    }

  }));
};
export const authGuard_user: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.getSession().pipe(switchMap((session) => {
    if (session != null) {
      let groups: string[] = (session.getIdToken().decodePayload()['cognito:groups'])
      authService.updateRole(authService.extractRole(session))
      if (groups.length == 0)
        return of(false)
      return of(groups.includes('User'));
    } else {
      router.navigate(['/login']);
      return of(false)
    }

  }));
};
