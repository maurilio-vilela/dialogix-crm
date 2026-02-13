import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('contacts')
@UseGuards(AuthGuard('jwt'))
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(user.tenantId, createContactDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.contactsService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.contactsService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, user.tenantId, updateContactDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.contactsService.remove(id, user.tenantId);
  }
}
