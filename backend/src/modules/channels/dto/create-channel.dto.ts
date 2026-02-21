import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ChannelStatus, ChannelType } from '../entities/channel.entity';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @Length(2, 255)
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsEnum(ChannelStatus)
  @IsOptional()
  status?: ChannelStatus;

  @Transform(({ value, obj }) => value ?? obj?.phone_number)
  @IsString()
  @IsOptional()
  @Length(8, 20)
  phoneNumber?: string;

  @Transform(({ value, obj }) => value ?? obj?.is_default)
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
