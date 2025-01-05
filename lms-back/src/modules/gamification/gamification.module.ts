import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from './entities/badge.entity';
import { BadgeController } from './controller/badge.controller';
import { BadgeService } from './services/badge.service';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Badge]), UserModule],
  controllers: [BadgeController],
  providers: [BadgeService],
  exports: [],
})
export class GamificationModule {}
