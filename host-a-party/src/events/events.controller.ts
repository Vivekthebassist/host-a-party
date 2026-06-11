import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CreateEventDto, UpdateEventDto, QueryEventsDto } from './dto';
import { EventStatus } from '../entities/event.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: User, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user.id, dto);
  }

  @Get('discover')
  @UseGuards(JwtAuthGuard)
  discover(@Query() query: QueryEventsDto) {
    return this.eventsService.discover(query);
  }

  @Get('my-events')
  @UseGuards(JwtAuthGuard)
  getMyEvents(@CurrentUser() user: User) {
    return this.eventsService.getMyHostedEvents(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, user.id, dto);
  }

  @Patch(':id/status/:status')
  @UseGuards(JwtAuthGuard)
  setStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('status') status: EventStatus,
    @CurrentUser() user: User,
  ) {
    return this.eventsService.setStatus(id, user.id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.eventsService.delete(id, user.id);
  }
}
