import { Injectable } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy {
  constructor(private authService: AuthService) {
    // super({ usernameField: 'email' }); // Use 'email' instead of 'username'
  }

  async validate(email: string, password: string): Promise<User> {
    return this.authService.validateUser(email, password);
  }
}
