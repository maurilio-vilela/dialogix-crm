import { Transform } from 'class-transformer';
import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  @Transform(({ value, obj }) => value ?? obj?.conversation_id)
  @IsUUID()
  conversationId: string;

  @Transform(({ value, obj }) => value ?? obj?.content_type)
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsString()
  content: string;
}
