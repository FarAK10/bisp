import { Role } from '../core/constants';

export type NavigationItemType = 'single' | 'multiple';

export type NavigationItem = {
  title: string;
  url?: string;
  type?: NavigationItemType;
  icon?: string;
  groupName?: string;
  roles?: Role[];
  children?: NavigationItem[];
};
export interface AppRoute {
  path: string;
  loadChildren: () => Promise<any>;
  title: string;
  icon: string;
  roles: Role[];
  children?: AppRoute[]; // For nested routes if needed
}
