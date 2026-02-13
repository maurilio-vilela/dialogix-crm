import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

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
    const contact = await this.contactsRepository.findOne({
      where: { id, tenantId },
    });
    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }
    return contact;
  }
  
  async update(id: string, tenantId: string, updateContactDto: UpdateContactDto) {
    const contact = await this.findOne(id, tenantId); // findOne já lança o erro se não encontrar
    const updated = this.contactsRepository.merge(contact, updateContactDto);
    return this.contactsRepository.save(updated);
  }

  async remove(id: string, tenantId: string) {
    // Soft delete
    return this.contactsRepository.softDelete({ id, tenantId });
  }
}
