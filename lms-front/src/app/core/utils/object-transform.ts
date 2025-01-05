import { SelectItem } from '../../types/select-item';

export function createSelectItem<T>(enumObj: T): SelectItem[] {
  return Object.entries(enumObj)
    .filter(([key]) => isNaN(Number(key)))
    .map(([label, value]) => ({
      label,
      value: value,
    }));
}
