import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
  ) {}

  async create(tenantId: string, createContactDto: CreateContactDto) {
    const contact = this.contactsRepository.create({
      ...createContactDto,
      tenantId,
    });
    return this.contactsRepository.save(contact);
  }

  async findAll(tenantId: string) {
    return this.contactsRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.contactsRepository.findOne({
      where: { id, tenantId },
    });
  }

  async remove(id: string, tenantId: string) {
    // Soft delete
    return this.contactsRepository.softDelete({ id, tenantId });
  }
}
