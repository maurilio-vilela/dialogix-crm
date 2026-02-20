import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ConversationStatus } from '../entities/conversation.entity';

export class ConversationsQueryDto {
  @ApiPropertyOptional({ enum: ConversationStatus, description: 'Filtrar por status da conversa' })
  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;

  @ApiPropertyOptional({ description: 'Filtrar por responsável (UUID)' })
  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por canal (UUID)' })
  @IsOptional()
  @IsUUID()
  channelId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por contato (UUID)' })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Buscar por nome/email/telefone do contato ou última mensagem' })
  @IsOptional()
  @IsString()
  search?: string;
}
