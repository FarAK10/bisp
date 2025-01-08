import { EventType } from '../../../../../../../core/constants/events';

export interface ScheduleFormValue {
  id: number | null;
  startTime: Date | null;
  endTime: Date | null;
  dayOfWeek: number | null;
  type: EventType | null;
  roomNumber: string;
  lectureId: number | null;
}
