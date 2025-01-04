import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private loadingSignal = signal(false);

  loading = this.loadingSignal.asReadonly();

  setLoading(value: boolean): void {
    this.loadingSignal.set(value);
  }
}
