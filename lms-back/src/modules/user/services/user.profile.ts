import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { GetUserDto } from '../dto/get-user.dto';

@Injectable()
export class UserProfile {
  mapUserToGetUserDto(user: User): GetUserDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
