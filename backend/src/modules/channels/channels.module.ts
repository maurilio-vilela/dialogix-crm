import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { Channel } from './entities/channel.entity';
import { WhatsAppController } from './whatsapp/whatsapp.controller';
import { WhatsAppService } from './whatsapp/whatsapp.service';
import { WhatsAppSession } from './whatsapp/entities/whatsapp-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, WhatsAppSession])],
  controllers: [ChannelsController, WhatsAppController],
  providers: [ChannelsService, WhatsAppService],
  exports: [ChannelsService, WhatsAppService],
})
export class ChannelsModule {}
