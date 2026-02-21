import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WhatsAppService } from './whatsapp.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserPayload } from '../../../common/interfaces/user-payload.interface';

@ApiTags('channels')
@ApiBearerAuth()
@Controller('channels/whatsapp')
@UseGuards(AuthGuard('jwt'))
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('status')
  @ApiOperation({ summary: 'Obter status do canal WhatsApp' })
  getStatus(@CurrentUser() user: UserPayload) {
    return this.whatsappService.getStatus(user.tenantId);
  }

  @Post('connect')
  @ApiOperation({ summary: 'Conectar WhatsApp (iniciar sessão)' })
  connect(@CurrentUser() user: UserPayload) {
    return this.whatsappService.connect(user.tenantId);
  }

  @Post('reconnect')
  @ApiOperation({ summary: 'Reconectar WhatsApp (reativar sessão)' })
  reconnect(@CurrentUser() user: UserPayload) {
    return this.whatsappService.reconnect(user.tenantId);
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Desconectar WhatsApp (encerrar sessão)' })
  disconnect(@CurrentUser() user: UserPayload) {
    return this.whatsappService.disconnect(user.tenantId);
  }

  @Get('qrcode')
  @ApiOperation({ summary: 'Obter QR Code da sessão WhatsApp' })
  getQrCode(@CurrentUser() user: UserPayload) {
    return this.whatsappService.getQrCode(user.tenantId);
  }
}
