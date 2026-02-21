import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPayload } from '../../common/interfaces/user-payload.interface';

@ApiTags('channels')
@ApiBearerAuth()
@Controller('channels')
@UseGuards(AuthGuard('jwt'))
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar canais do tenant' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.channelsService.findAll(user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar canal' })
  create(@CurrentUser() user: UserPayload, @Body() createChannelDto: CreateChannelDto) {
    return this.channelsService.create(user.tenantId, createChannelDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar canal' })
  update(@CurrentUser() user: UserPayload, @Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
    return this.channelsService.update(id, user.tenantId, updateChannelDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir canal' })
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.channelsService.remove(id, user.tenantId);
  }
}
