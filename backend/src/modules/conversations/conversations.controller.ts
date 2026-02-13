import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPayload } from '../../common/interfaces/user-payload.interface';

@ApiTags('conversations')
@ApiBearerAuth()
@Controller('conversations')
@UseGuards(AuthGuard('jwt'))
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova conversa' })
  create(@CurrentUser() user: UserPayload, @Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.create(user.tenantId, createConversationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as conversas do tenant' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.conversationsService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma conversa específica' })
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.conversationsService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma conversa (status, responsável)' })
  update(@CurrentUser() user: UserPayload, @Param('id') id: string, @Body() updateConversationDto: UpdateConversationDto) {
    return this.conversationsService.update(id, user.tenantId, updateConversationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma conversa' })
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.conversationsService.remove(id, user.tenantId);
  }
}
