import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from '../entities/badge.entity';
import { UserService } from '@modules/user/services/user.service';

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    private userService: UserService,
  ) {}

  async assignBadge(userId: number, badgeId: number): Promise<void> {
    const badge = await this.badgeRepository.findOne({
      where: { id: badgeId },
      relations: ['users'],
    });
    if (!badge) throw new NotFoundException('Badge not found');
    const user = await this.userService.findOne(userId);
    badge.users.push(user);
    await this.badgeRepository.save(badge);
  }

  async getUserBadges(userId: number): Promise<Badge[]> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.badgeRepository
      .createQueryBuilder('badge')
      .leftJoin('badge.users', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }
}
