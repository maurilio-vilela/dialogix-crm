# Complemento — Botões/Lista (PRs/Comunidade) + Ranking Performance/Estabilidade
Data: 2026-02-21 10:40 BRT

## Evidências em PRs (GitHub API)
### Baileys (WhiskeySockets/Baileys)
PRs relacionados a botões/interativos (títulos):
- **#2244** “Add button and interactive message support”
- **#2291** “Restoring buttons”
- **#2295** “v1.0.0 - Initial release with Interactive Buttons & LID Plotting”
Links: https://github.com/WhiskeySockets/Baileys/pull/2244 | /2291 | /2295

**Leitura:** há histórico explícito de **suporte a botões/interativos** sendo adicionado/ajustado, indicando evolução ativa.

### Whatsmeow (tulir/whatsmeow)
Busca por PRs com “button”/“interactive”: **nenhum resultado**.
PR com “list”: **#1017** “notification: handle device list updates” (relacionado a device list/LID, não a lista interativa de mensagens).
Link: https://github.com/tulir/whatsmeow/pull/1017

**Leitura:** **não há evidência pública** de botões/listas interativas em PRs recentes do Whatsmeow.

### Whaileys (canove/whaileys)
README declara foco em **simplicidade e estabilidade**, usado em produção com **5.000+ conexões ativas**. Fonte: https://raw.githubusercontent.com/canove/whaileys/master/README.md

**Evidência no código (clone + grep):** há suporte explícito a **listMessage**, **buttonsMessage** e **interactiveMessage**:
- `src/Socket/messages-send.ts` trata `message.listMessage`, `message.buttonsMessage` e `message.interactiveMessage`
- `src/Utils/messages.ts` monta `buttonsMessage` e `listMessage`
- `src/Types/Message.ts` inclui `buttons` e `sections` (listas)

---

## Ranking por requisitos (botões/listas obrigatórios)
**1) Whaileys** — ✅ botões/listas/interativos presentes no código + foco em estabilidade
**2) Baileys** — ✅ botões/listas/interativos presentes no código + PRs recentes
**3) WPPConnect** — ✅ docs confirmam listas + reações + pix
**4) Whatsmeow** — ❌ sem evidência de botões/listas interativas

---

## Ranking performance (10k tenants, múltiplas conexões)
**1) Whatsmeow (Go)** — mais leve por conexão (sem browser)
**2) Baileys/Whaileys (Node WebSocket)** — bom custo, precisa tuning
**3) WPPConnect (Node + WA Web)** — mais pesado (browser por sessão)

---

## Ranking estabilidade (mudanças WA Web)
**1) Whaileys** — foco declarado em estabilidade, base Baileys, 5k conexões ativas.
**2) Baileys** — PRs ativos para botões/interativos
**3) Whatsmeow** — core estável, mas gap funcional (botões/listas)
**4) WPPConnect** — acompanha updates, mas mais sujeito a mudanças do WA Web

---

## Recomendação operacional (CRM em escala)
- **Camada core multi-tenant:** Whaileys (botões/listas + estabilidade declarada + base leve)
- **Plano B (feature/paridade):** Baileys mainstream (se precisar compatibilidade mais ampla)
- **Superset de features:** WPPConnect quando precisar recursos específicos do WA Web
- **Whatsmeow:** ótimo para core, mas **não atende requisito de botões/listas** no estado atual

---

## Próximos passos sugeridos
1) PoC rápida com Whaileys em ambiente de teste para validar botões/listas e carga.
2) Definir estratégia de “compat layer” (interface única) para alternar entre Whaileys/Baileys/WPPConnect.
3) Monitorar PRs do Baileys para manter compatibilidade com mudanças do WA Web.
