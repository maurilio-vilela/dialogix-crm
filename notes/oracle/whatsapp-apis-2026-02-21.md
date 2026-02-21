# Relatório Técnico — APIs Não Oficiais WhatsApp (Dialogix CRM)
Data: 2026-02-21 09:45 BRT

## Resumo executivo
Principais candidatos:
- **Whatsmeow (Go)**: alta performance, core completo, app-state, receipts, retry. Ótimo para backend robusto.
- **WPPConnect (Node)**: cobertura avançada (reações, pix, listas, typing/gravação, gestão de grupos). Bom para feature richness.
- **Baileys (Node)**: leve e estável (WebSocket sem browser), mas exige validação de features avançadas.

Observações e gaps (alto nível):
- **Chamadas**: não suportadas (Whatsmeow).
- **Broadcast list**: inexistente no WA Web.
- **Botões/carrossel**: instabilidade (varia por lib/versão).

Recomendação resumida:
- **Curto prazo (MVP)**: Baileys ou WPPConnect para velocidade de implementação.
- **Médio prazo (escala/robustez)**: migrar ou manter core em Whatsmeow.

---

## Contexto e premissas
- Objetivo: selecionar **até 2 APIs não oficiais** para integração com o CRM (em paralelo à API oficial). Foco em **Open Source**, **alta performance**, recursos avançados (grupos, reações, recibos, digitação/gravação, mídia, etc.).
- **Risco legal/operacional:** todas as APIs não oficiais **violam os Termos do WhatsApp** e podem sofrer bloqueios instáveis. A própria documentação do whatsapp-web.js alerta que o método não é seguro e que o uso oficial é recomendado para aplicações críticas. Fonte: https://wwebjs.dev/guide/
- **Base técnica**: falta de documentação pública do protocolo leva à engenharia reversa; literatura acadêmica destaca que a ausência de documentação obriga implementações não-oficiais e estudos de segurança com base em engenharia reversa. Fonte (PDF): https://kclpure.kcl.ac.uk/ws/files/324396471/whatsapp.pdf

## Principais candidatos (Open Source)
### 1) **Whatsmeow (Go)** — https://github.com/tulir/whatsmeow
**Resumo:** biblioteca Go para API multi-device do WhatsApp Web. Foco em performance e estabilidade.
**Recursos confirmados (README):**
- Envio/recebimento de mensagens em chats privados e grupos (texto/mídia).
- Gestão de grupos e eventos de mudanças.
- Links de convite (criar/usar).
- Digitação (typing) e recibos de entrega/leitura.
- **App state** (lista de contatos, pin/mute, etc.).
- **Retry receipts** quando descriptografia falha.
- Mensagens de **status** (experimental).
- **Não implementa chamadas**; **broadcast list não é suportado no WhatsApp Web**.
Fonte: https://raw.githubusercontent.com/tulir/whatsmeow/main/README.md
**Aderência aos requisitos:** muito alta para núcleo de mensagens, grupos, recibos, typing, app-state, retries. Chamadas e broadcast list ausentes.
**Performance:** alta (Go, sem browser).
**Possibilidade de customização:** alta (Go, open source, bom para ajustes no core e integrações internas).

### 2) **WPPConnect (Node)** — https://github.com/wppconnect-team/wppconnect
**Resumo:** API completa baseada no WhatsApp Web com grande cobertura funcional.
**Recursos confirmados (docs):**
- Reações: `sendReactionToMessage` / `getReactions`.
- Listas: `sendListMessage`.
- Digitação/gravação: `startTyping`, `startRecording`, `stopTyping`, `stopRecording`.
- Envio de localização: `sendLocation`.
- Pix: `sendPixKey`.
- Envio de mídia/arquivos (vários métodos), contatos e vCards.
- Gestão de grupos (criação, adicionar/remover/promover/demover, convites, admins, etc.).
Fontes (docs): https://wppconnect.io/wppconnect/classes/Whatsapp.html
**Aderência aos requisitos:** muito alta (inclui **reação**, **pix**, **listas**, **typing/gravação**, **gestão completa de grupos**).
**Performance:** média/alta, mas **usa WhatsApp Web**, normalmente com headless/puppeteer; tende a consumir mais RAM/CPU que libs sem browser.
**Possibilidade de customização:** alta (open source), porém depende do WhatsApp Web (mudanças frequentes).

### 3) **Baileys (TS)** — https://github.com/WhiskeySockets/Baileys
**Resumo:** biblioteca TypeScript via WebSocket, **sem browser**, multidevice. Muito usada e base de vários wrappers.
**Pontos confirmados (README):**
- WebSocket direto (sem Selenium/Chromium), menor RAM.
- Suporte multi-device e WhatsApp Web.
Fontes: https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/README.md
**Aderência aos requisitos:** **provável** alta (ecosistema grande), mas README não lista todos os recursos; **precisa validar** recursos específicos (reação, listas, pix, status, receipts avançados). 
**Performance:** alta (sem browser).
**Possibilidade de customização:** alta (open source), código TS sólido, mas requer validação de features e compatibilidade.

### 4) **open-wa/wa-automate (Node)** — https://github.com/open-wa/wa-automate-nodejs
**Resumo:** API avançada via WhatsApp Web, com lista extensa de funções.
**Recursos confirmados (docs):**
- Receber mensagens, enviar texto, mídia, contatos, localização.
- Simular typing, read receipts, live location, grupos.
Fonte: https://docs.openwa.dev (referências no README) + https://raw.githubusercontent.com/open-wa/wa-automate-nodejs/master/README.md
**Aderência aos requisitos:** alta para uso geral, mas pode ser mais pesada (browser). 

### 5) **whatsapp-web.js (Node)** — https://github.com/pedroslopez/whatsapp-web.js
**Resumo:** biblioteca popular via puppeteer; docs alertam sobre risco de bloqueio e uso não oficial.
**Aderência aos requisitos:** razoável, porém menos “enterprise” e com risco operacional claro.
Fonte: https://wwebjs.dev/guide/

---

## Requisitos críticos vs cobertura (síntese)
**Requisitos completos** (reação, grupos avançados, recibos, typing, app-state, retry receipts, pix, status, listas, mídia extensa):
- **Whatsmeow** cobre **quase tudo**, exceto chamadas e broadcast list (não suportadas no WA Web). Não há menção explícita a reações/pix/listas.
- **WPPConnect** cobre **muito do que foi pedido** (inclui reação, pix, listas, typing/gravação, grupos completos).
- **Baileys** é **forte em performance**, mas requer **validação** para recursos específicos (reação, listas, pix, status, etc.).

**Conclusão de seleção (top 2 candidatos):**
1) **Whatsmeow (Go)** — melhor base performance/estabilidade + recursos core + app-state + receipts + retries.
2) **WPPConnect (Node)** — melhor cobertura de features “avançadas” (reação, pix, listas, gestão de grupos).
**Alternativa**: Baileys pode substituir WPPConnect se confirmarmos features avançadas sem browser.

---

## Gaps e pontos de atenção
- **Chamadas (ligação):** não suportado em Whatsmeow; outras libs geralmente não oferecem chamadas estáveis.
- **Broadcast list / mensagens em massa:** não suportado oficialmente no WA Web; alto risco de ban. 
- **Botões/carrossel:** WA Web tem limitações; WPPConnect oferece listas; botões e carrossel precisam validação real (muito instável).
- **“Marcações fantasma” em grupos:** não há evidência pública de suporte; provável inviável sem hack específico.
- **API State (block/mute/status):** Whatsmeow oferece leitura/escrita de app-state; outras libs variam.

---

## Possibilidade de modificação para requisitos
- **Whatsmeow:** excelente para adaptar; base Go facilita integrar com serviços internos (ex.: transcrição Go). 
- **WPPConnect:** ampla cobertura, mas depende de mudanças do WA Web; precisa esforço contínuo de manutenção.
- **Baileys:** ótima base sem browser; se confirmar features específicas, pode ser a opção mais eficiente.

---

## Recomendação técnica imediata
1) **Prototipar com Whatsmeow** (Go) para núcleo de mensagens, grupos e receipts.
2) **Prototipar com WPPConnect** para features avançadas (reação, pix, listas, typing/gravação). 
3) **Rodar PoC de Baileys** e verificar recursos críticos (reação, listas, pix, status, retry receipts). Se cobrir, considerar substituir WPPConnect para reduzir custo de browser.

---

## Fontes principais
- Whatsmeow README (features): https://raw.githubusercontent.com/tulir/whatsmeow/main/README.md
- WPPConnect API docs (reação, listas, pix, typing, grupos): https://wppconnect.io/wppconnect/classes/Whatsapp.html
- Baileys README (WebSocket sem browser, multi-device): https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/README.md
- whatsapp-web.js disclaimer (risco de ban): https://wwebjs.dev/guide/
- Paper técnico (engenharia reversa, falta de documentação): https://kclpure.kcl.ac.uk/ws/files/324396471/whatsapp.pdf
