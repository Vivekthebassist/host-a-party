import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { SwipeDto } from './dto';

@Controller()
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post('events/:eventId/swipe')
  @UseGuards(JwtAuthGuard)
  swipe(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: User,
    @Body() dto: SwipeDto,
  ) {
    return this.connectionsService.swipe(user.id, eventId, dto.targetUserId, dto.direction);
  }

  @Get('events/:eventId/candidates')
  @UseGuards(JwtAuthGuard)
  getCandidates(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: User,
  ) {
    return this.connectionsService.getSwipeCandidates(user.id, eventId);
  }

  @Get('events/:eventId/matches')
  @UseGuards(JwtAuthGuard)
  getEventMatches(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: User,
  ) {
    return this.connectionsService.getEventMatches(user.id, eventId);
  }

  @Get('matches')
  @UseGuards(JwtAuthGuard)
  getAllMatches(@CurrentUser() user: User) {
    return this.connectionsService.getAllMatches(user.id);
  }
}
