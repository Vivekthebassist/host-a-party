import { IsEnum } from 'class-validator';
import { JoinRequestStatus } from '../../entities/join-request.entity';

export class RespondJoinRequestDto {
  @IsEnum([JoinRequestStatus.APPROVED, JoinRequestStatus.REJECTED], {
    message: 'Status must be approved or rejected',
  })
  status: JoinRequestStatus;
}
