import { IsEnum, IsUUID } from 'class-validator';
import { SwipeDirection } from '../../entities/swipe.entity';

export class SwipeDto {
  @IsUUID()
  targetUserId: string;

  @IsEnum(SwipeDirection)
  direction: SwipeDirection;
}
