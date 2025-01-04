import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private notification: NzNotificationService) {}

  onNotifyError(text: string, nzDuration = 20000, title = ''): string {
    return this.notification.error(title, text, {
      nzDuration,
    }).messageId;
  }

  onNotifySuccess(text: string, nzDuration = 2000, title = ''): string {
    return this.notification.success(title, text, {
      nzDuration,
    }).messageId;
  }

  onNotifyWarning(text: string, nzDuration = 10000): string {
    return this.notification.warning('', text, {
      nzDuration,
    }).messageId;
  }

  onNotifyInfo(text: string, nzDuration = 2000): string {
    return this.notification.info('', text, {
      nzDuration,
    }).messageId;
  }
}
