import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ConversationStatus, ConversationChannel } from '../entities/conversation.entity';

export class CreateConversationDto {
  @IsUUID()
  contactId: string;

  @IsEnum(ConversationChannel)
  @IsOptional()

  channel?: ConversationChannel;
  @IsUUID()
  @IsOptional()
  assignedUserId?: string;
}
