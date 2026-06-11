import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CheckInDto } from './dto';

@Controller('events/:eventId/check-ins')
@UseGuards(JwtAuthGuard)
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post()
  checkIn(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: User,
    @Body() dto: CheckInDto,
  ) {
    return this.checkInsService.checkIn(user.id, eventId, dto.latitude, dto.longitude);
  }

  @Get()
  getEventCheckIns(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.checkInsService.getEventCheckIns(eventId);
  }

  @Get('status')
  getStatus(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: User,
  ) {
    return this.checkInsService.getCheckInStatus(user.id, eventId);
  }
}
