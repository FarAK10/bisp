import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BaseLayoutService {
  #isEmpty = new BehaviorSubject<boolean>(false);
  isEmpty$: Observable<boolean> = this.#isEmpty.asObservable();

  set isEmpty(state: boolean) {
    this.#isEmpty.next(state);
  }
}
