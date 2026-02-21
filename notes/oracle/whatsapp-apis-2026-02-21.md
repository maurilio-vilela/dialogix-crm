# Relatório Oracle — APIs não oficiais WhatsApp (Dialogix)
**Data:** 2026-02-21

## Resumo executivo
Principais candidatos:
- **Whatsmeow (Go)**: alta performance, core completo, app-state, receipts, retry. Ótimo para backend robusto.
- **WPPConnect (Node)**: cobertura avançada (reações, pix, listas, typing/gravação, gestão de grupos). Bom para feature richness.
- **Baileys (Node)**: leve e estável (WebSocket sem browser), mas exige validação de features avançadas.

## Observações e gaps
- **Chamadas**: não suportadas (Whatsmeow).
- **Broadcast list**: inexistente no WA Web.
- **Botões/carrossel**: instabilidade (varia por lib/versão).

## Recomendação
- **Curto prazo (MVP)**: Baileys ou WPPConnect para velocidade de implementação.
- **Médio prazo (escala/robustez)**: migrar ou manter core em Whatsmeow.
