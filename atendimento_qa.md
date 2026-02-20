# Roteiro de QA e Casos de Teste - Módulo de Atendimento

## Checklist de Validação

- [ ] **Endpoints Validados:**
  - [ ] `GET /conversations` - Retorna a lista de conversas com todos os campos esperados.
  - [ ] `GET /messages/conversation/{id}` - Retorna as mensagens de uma conversa específica.
  - [ ] `POST /messages` - Envia uma nova mensagem com sucesso.
- [ ] **WebSocket Conectado:**
  - [ ] Conexão estabelecida ao carregar a página.
  - [ ] Evento `message:new` recebido ao chegar nova mensagem.
- [ ] **Ambiente de Teste:**
  - [ ] Usuário de teste com permissão para Atendimento.
  - [ ] Massa de dados (conversas, contatos, mensagens) disponível.

---

## Casos de Teste Funcionais

### 1. Lista de Conversas

| ID    | Cenário | Passos | Resultado Esperado |
| :---- | :------ | :----- | :----------------- |
| TC-01 | Visualizar lista de conversas | Acessar a página de Atendimento | A lista de conversas é exibida com nome do contato, última mensagem e data/hora. |
| TC-02 | Conversa ativa destacada | Clicar em uma conversa | A conversa selecionada fica destacada (fundo diferente). |
| TC-03 | Indicador de mensagens não lidas | Receber mensagem em conversa inativa | Badge com quantidade de não lidas aparece na conversa correspondente. |
| TC-04 | Atualização ao receber nova mensagem | Receber mensagem em qualquer conversa | Conversa sobe para o topo e última mensagem/hora são atualizadas. |
| TC-05 | Exibição de canais | Visualizar lista | Badge com cor do canal (WhatsApp/Instagram/Telegram/etc.) é exibida. |
| TC-06 | Status da conexão WebSocket | Observar topo da lista | Indicador Online/Offline reflete o estado da conexão. |
| TC-07 | Fallback de atualização (polling) | Simular falha do WebSocket e aguardar 10s | Lista atualiza via refetch periódico. |

### 2. Janela de Chat Ativo

| ID    | Cenário | Passos | Resultado Esperado |
| :---- | :------ | :----- | :----------------- |
| TC-08 | Exibir mensagens da conversa | Clicar em conversa | Mensagens são carregadas no painel central. |
| TC-09 | Diferenciação inbound/outbound | Visualizar chat | Outbound alinhado à direita, inbound à esquerda. |
| TC-10 | Enviar mensagem | Digitar e enviar | Mensagem aparece no chat e campo é limpo. |
| TC-11 | Envio em progresso | Enviar mensagem | Botão/textarea desabilitados e spinner exibido. |
| TC-12 | Receber mensagem em tempo real | Estar em conversa ativa e receber mensagem | Mensagem chega sem refresh e scroll desce automaticamente. |
| TC-13 | Trocar de conversa | Alternar entre conversas | Histórico e cabeçalho atualizam conforme a conversa. |

### 3. Detalhes do Contato

| ID    | Cenário | Passos | Resultado Esperado |
| :---- | :------ | :----- | :----------------- |
| TC-14 | Exibir detalhes do contato | Selecionar conversa | Coluna direita exibe nome, email e telefone (quando houver). |
| TC-15 | Estado inicial sem conversa | Abrir módulo sem seleção | Mensagem instrucional é exibida nos painéis. |
| TC-16 | Alternar detalhes | Trocar de conversa | Detalhes do contato refletem a conversa ativa. |

---

## Roteiro de Testes Manuais (QA Script)

**Objetivo:** validar o fluxo completo do módulo Atendimento.

**Pré-requisitos:**
1. Login com usuário de teste.
2. Acesso à página de Atendimento.
3. Pelo menos duas conversas com mensagens distintas.

**Passos:**
1. Verificar carregamento da lista e status Online (TC-01, TC-06).
2. Selecionar primeira conversa e validar destaque, mensagens e detalhes do contato (TC-02, TC-08, TC-14).
3. Enviar mensagem via Enter e via botão (TC-10, TC-11).
4. Receber mensagem em conversa ativa (TC-12).
5. Alternar para outra conversa e validar atualização dos painéis (TC-13, TC-16).
6. Receber mensagem em conversa inativa e validar badge/nova ordenação (TC-03, TC-04).
7. (Opcional) Simular falha de WebSocket e confirmar polling (TC-07).
