import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  contactId: string;

  @ApiPropertyOptional({ description: 'Canal por ID (UUID)' })
  @IsUUID()
  @IsOptional()
  channelId?: string;

  @ApiPropertyOptional({ description: 'Canal por tipo/nome (ex.: whatsapp)' })
  @IsString()
  @IsOptional()
  channel?: string;

  @IsUUID()
  @IsOptional()
  assignedUserId?: string;
}
