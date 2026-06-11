import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JoinRequestsService } from './join-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CreateJoinRequestDto, RespondJoinRequestDto } from './dto';

@Controller()
export class JoinRequestsController {
  constructor(private readonly joinReqService: JoinRequestsService) {}

  @Post('events/:eventId/join-requests')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateJoinRequestDto,
  ) {
    return this.joinReqService.create(user.id, eventId, dto);
  }

  @Get('events/:eventId/join-requests')
  @UseGuards(JwtAuthGuard)
  getEventRequests(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: User,
  ) {
    return this.joinReqService.getEventRequests(eventId, user.id);
  }

  @Patch('join-requests/:id/respond')
  @UseGuards(JwtAuthGuard)
  respond(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: RespondJoinRequestDto,
  ) {
    return this.joinReqService.respond(id, user.id, dto.status);
  }

  @Get('join-requests/mine')
  @UseGuards(JwtAuthGuard)
  getMyRequests(@CurrentUser() user: User) {
    return this.joinReqService.getMyRequests(user.id);
  }

  @Delete('join-requests/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.joinReqService.cancel(id, user.id);
  }
}
