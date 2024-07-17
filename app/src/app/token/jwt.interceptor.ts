import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap } from 'rxjs';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const authService = inject(AuthService)
  if (req.headers.get('skip'))
    return next(req);

  return from(authService.getSession().pipe(
    switchMap((session) => {

      if (session == null) {
        authService.logout();
        router.navigate(['/login']);
      }
      let token = req.clone({
        setHeaders: {
          Authorization: session?.getIdToken().getJwtToken() || "",
        },
      });
      return next(token);
    })
  ))
};
