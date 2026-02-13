import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPayload } from '../../common/interfaces/user-payload.interface';

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('contacts')
@UseGuards(AuthGuard('jwt'))
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo contato' })
  create(@CurrentUser() user: UserPayload, @Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(user.tenantId, createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os contatos do tenant' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.contactsService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um contato específico' })
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.contactsService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um contato existente' })
  update(@CurrentUser() user: UserPayload, @Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, user.tenantId, updateContactDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um contato' })
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.contactsService.remove(id, user.tenantId);
  }
}
