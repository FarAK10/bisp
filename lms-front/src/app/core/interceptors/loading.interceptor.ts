import {
  HttpHandlerFn,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { ProgressService } from '../services';
import { finalize } from 'rxjs';

export const LoadingInterceptor: HttpInterceptorFn = (
  req,
  next: HttpHandlerFn
) => {
  const progressService = inject(ProgressService);

  progressService.setLoading(true);

  return next(req).pipe(
    finalize(() => {
      progressService.setLoading(false);
    })
  );
};
