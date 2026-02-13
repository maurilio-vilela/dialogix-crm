import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'tenantId'] // Seleciona a senha explicitamente para auth
    });
  }

  async findOne(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
