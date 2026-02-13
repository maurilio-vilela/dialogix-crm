import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPayload } from '../../common/interfaces/user-payload.interface';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar uma nova mensagem' })
  create(@CurrentUser() user: UserPayload, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(user.tenantId, user.userId, createMessageDto);
  }

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Listar todas as mensagens de uma conversa' })
  findAllByConversation(
    @CurrentUser() user: UserPayload,
    @Param('conversationId') conversationId: string,
  ) {
    // A validação de tenant ocorre no service
    return this.messagesService.findAllByConversation(conversationId, user.tenantId);
  }
}
