# Sprint WhatsApp (WPPConnect) — Status

**Objetivo:** Colocar no ar o canal WhatsApp com WPPConnect na página de Canais, pronto para continuidade do módulo de atendimentos.

## ✅ Concluído
### Frontend
- Página **Canais** com foco WhatsApp (WPPConnect) pronta.
- Estados visuais: desconectado, conectando, aguardando QR, conectado, erro.
- Ações: conectar, reconectar, desconectar, atualizar QR.
- QR Code em modal com refresh.
- Metadados (número, sessão, última atualização, heartbeat).
- Polling configurável via `VITE_CHANNELS_POLLING_MS`.
- Provider-agnostic + adapter/mocks (`channels.service.ts`).
- Mocks locais via `VITE_CHANNELS_MOCKS=true`.
- Provider configurável via `VITE_WHATSAPP_PROVIDER`.

## ✅ Concluído (Backend — parcial)
- Módulo `channels/whatsapp` criado (controller/service/module).
- Endpoints implementados: `POST /connect`, `POST /disconnect`, `POST /reconnect`, `GET /status`, `GET /qrcode`.
- Payload padronizado (status, phone, sessionId, error, timestamps).
- Logging básico de eventos.
- QR placeholder disponível para fluxo de UI.

## ⏳ Pendente
### Backend (WPPConnect)
- Integrar WPPConnect de fato (substituir placeholders).
- Persistir estado mínimo da sessão (DB/cache real).
- Atualizar status para **connected** via evento real.

## 🧭 Próximos passos sugeridos
1. Levantar estrutura de backend existente e padrão de módulos.
2. Implementar controller + service + DTOs do canal WhatsApp.
3. Definir camada de persistência (cache/DB) para estado.
4. Integrar WPPConnect e expor QR no status.
5. Validar payload com o frontend.

---
Atualizado em: 2026-02-21
