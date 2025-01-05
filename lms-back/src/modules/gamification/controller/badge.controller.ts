import { Controller, Post, Get, Param } from '@nestjs/common';
import { BadgeService } from '../services/badge.service';
import { Public } from '@common/decorators/public.decorator';
@Public()
@Controller('badges')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Post(':userId/assign/:badgeId')
  assignBadge(
    @Param('userId') userId: number,
    @Param('badgeId') badgeId: number,
  ): Promise<void> {
    return this.badgeService.assignBadge(userId, badgeId);
  }

  @Get(':userId')
  getUserBadges(@Param('userId') userId: number): Promise<any> {
    return this.badgeService.getUserBadges(userId);
  }
}
