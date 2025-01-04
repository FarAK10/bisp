import { Role } from '../constants';

export function doesUserHasPermission(
  userRoles: Role[],
  requiredRoles: Role[]
): boolean {
  if (requiredRoles?.length) {
    const isPermissionInclued = userRoles.some((value) =>
      requiredRoles?.includes(value)
    );

    return isPermissionInclued;
  }

  return true;
}
