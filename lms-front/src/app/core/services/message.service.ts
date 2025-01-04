import { Injectable } from '@angular/core';
import { NzMessageRef, NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private defaultDuration: number = 2000;

  constructor(private msg: NzMessageService) {}

  onNotifySuccess(
    message: string,
    duration: number = this.defaultDuration
  ): NzMessageRef {
    return this.msg.success(this.translate(message), { nzDuration: duration });
  }

  onNotifyError(
    message: string,
    duration: number = this.defaultDuration
  ): NzMessageRef {
    return this.msg.error(this.translate(message), { nzDuration: duration });
  }

  onNotifyWarning(
    message: string,
    duration: number = this.defaultDuration
  ): NzMessageRef {
    return this.msg.warning(this.translate(message), { nzDuration: duration });
  }

  onNotifyInfo(
    message: string,
    duration: number = this.defaultDuration
  ): NzMessageRef {
    return this.msg.info(this.translate(message), { nzDuration: duration });
  }

  private translate(message: string): string {
    return message;
  }
}
