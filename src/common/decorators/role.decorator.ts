// roles.decorator.ts
import { Role } from '@common/constants/roles.enum';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
