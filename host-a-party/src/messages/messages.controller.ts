import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { SendMessageDto } from './dto';

@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('chats')
  @UseGuards(JwtAuthGuard)
  getChatList(@CurrentUser() user: User) {
    return this.messagesService.getChatList(user.id);
  }

  @Post('matches/:matchId/messages')
  @UseGuards(JwtAuthGuard)
  send(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @CurrentUser() user: User,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.send(matchId, user.id, dto);
  }

  @Get('matches/:matchId/messages')
  @UseGuards(JwtAuthGuard)
  getChatHistory(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @CurrentUser() user: User,
    @Query('page') page?: string,
  ) {
    return this.messagesService.getChatHistory(matchId, user.id, page ? parseInt(page) : 1);
  }

  @Patch('matches/:matchId/messages/read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  markAsRead(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.markAsRead(matchId, user.id);
  }
}
