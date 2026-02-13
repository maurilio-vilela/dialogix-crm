import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  @IsUUID()
  conversationId: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsString()
  content: string;
}
