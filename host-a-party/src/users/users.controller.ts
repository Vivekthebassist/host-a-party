import { Controller, Get, Put, Patch, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { SetupProfileDto, UpdateProfileDto, UpdateLocationDto, UpdatePreferencesDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: User) {
    return this.usersService.getMyProfile(user.id);
  }

  @Put('me/setup')
  @UseGuards(JwtAuthGuard)
  setupProfile(@CurrentUser() user: User, @Body() dto: SetupProfileDto) {
    return this.usersService.setupProfile(user.id, dto);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/location')
  @UseGuards(JwtAuthGuard)
  updateLocation(@CurrentUser() user: User, @Body() dto: UpdateLocationDto) {
    return this.usersService.updateLocation(user.id, dto);
  }

  @Patch('me/preferences')
  @UseGuards(JwtAuthGuard)
  updatePreferences(@CurrentUser() user: User, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(user.id, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getPublicProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getPublicProfile(id);
  }
}
