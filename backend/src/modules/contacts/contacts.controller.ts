import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('contacts')
@UseGuards(AuthGuard('jwt'))
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Request() req, @Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(req.user.tenantId, createContactDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.contactsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.contactsService.findOne(id, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.contactsService.remove(id, req.user.tenantId);
  }
}
