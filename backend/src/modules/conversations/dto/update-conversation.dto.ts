import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ConversationStatus } from '../entities/conversation.entity';

export class UpdateConversationDto {
  @IsEnum(ConversationStatus)
  @IsOptional()
  status?: ConversationStatus;

  @IsUUID()
  @IsOptional()
  assignedUserId?: string;
}
