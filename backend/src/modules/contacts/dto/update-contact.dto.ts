import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateContactDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;
}
