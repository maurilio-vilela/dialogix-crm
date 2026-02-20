# Dialogix CRM — Atendimento

Mini-guia QA e checklist de testes manuais para o módulo **Atendimento**.

> Objetivo: validar fluxos críticos, regras de negócio e UX do Atendimento (abertura, tratamento, conclusão e pós-atendimento).

---

## 1) Escopo (o que testar)
- **Abertura de atendimento** (novo, por cliente, por canal)
- **Listagem e filtros** (status, prioridade, agente, data)
- **Detalhe do atendimento** (dados do cliente, histórico, anexos)
- **Interações** (mensagens, notas internas, respostas prontas)
- **SLA e prazos** (contagem, pausas, alertas)
- **Transferência/atribuição** (entre agentes/filas)
- **Encerramento** (resolução, motivo, CSAT)
- **Reabertura** (regra de tempo e justificativa)
- **Auditoria/logs** (quem fez o quê e quando)
- **Permissões** (agente vs. supervisor vs. admin)

---

## 2) Dados mínimos para testes
- **Clientes**: PF e PJ com cadastro completo e incompleto
- **Canais**: chat, e-mail, telefone (ou simulados)
- **Agentes**: 2 usuários com perfis distintos (agente e supervisor)
- **Filas**: ao menos 2 filas diferentes
- **Catálogo**: 2 motivos de contato e 2 categorias de resolução
- **SLA**: 2 regras (normal e urgente)

---

## 3) Checklist de testes manuais (funcional)

### 3.1 Abertura
- [ ] Criar atendimento com cliente existente
- [ ] Criar atendimento com cliente novo (cadastro rápido)
- [ ] Criar atendimento com dados obrigatórios ausentes → validar mensagens
- [ ] Selecionar canal correto e salvar
- [ ] Validar geração de número/ID do atendimento

### 3.2 Listagem e filtros
- [ ] Filtro por status (aberto, em andamento, resolvido, fechado)
- [ ] Filtro por prioridade (baixa, média, alta, urgente)
- [ ] Filtro por agente/filas
- [ ] Ordenação por data/última interação
- [ ] Busca por cliente/ID do atendimento

### 3.3 Detalhe e histórico
- [ ] Visualizar dados do cliente e contatos
- [ ] Ver histórico completo de interações
- [ ] Anexar arquivo (válido) e visualizar
- [ ] Tentar anexo inválido (tipo/tamanho) → mensagem

### 3.4 Interações e comunicação
- [ ] Enviar mensagem (cliente) e confirmar registro
- [ ] Adicionar nota interna (não visível ao cliente)
- [ ] Usar resposta pronta (template) e salvar
- [ ] Editar/Excluir mensagem (se permitido) → registrar em log

### 3.5 SLA e prazos
- [ ] Início de SLA ao abrir atendimento
- [ ] Pausa de SLA (ex.: aguardando cliente)
- [ ] Retomada do SLA
- [ ] Alerta de SLA próximo do vencimento
- [ ] SLA expirado → marcação visual

### 3.6 Transferência/atribuição
- [ ] Atribuir atendimento a outro agente
- [ ] Transferir para outra fila
- [ ] Validar notificações ao novo responsável

### 3.7 Encerramento e reabertura
- [ ] Encerrar com motivo e resolução obrigatória
- [ ] Validação de campos obrigatórios no fechamento
- [ ] Registrar CSAT/NPS (se aplicável)
- [ ] Reabrir atendimento (regra de tempo) com justificativa
- [ ] Impedir reabertura fora do prazo (mensagem clara)

### 3.8 Permissões e auditoria
- [ ] Agente sem permissão não altera status proibido
- [ ] Supervisor pode reatribuir e reabrir
- [ ] Auditoria registra alterações críticas

---

## 4) Checklist de testes manuais (UX/consistência)
- [ ] Mensagens de erro claras e acionáveis
- [ ] Estados vazios explicativos (sem atendimentos)
- [ ] Loader/feedback ao salvar ações
- [ ] Atalhos ou ações rápidas consistentes
- [ ] Informações críticas visíveis sem rolagem excessiva

---

## 5) Casos de borda (edge cases)
- [ ] Atendimento aberto sem cliente vinculado (bloquear)
- [ ] Encerrar com SLA expirado
- [ ] Transferir atendimento com anexo grande pendente
- [ ] Reabrir atendimento já reaberto previamente
- [ ] Mudança de prioridade no meio do atendimento

---

## 6) Checklist de regressão rápida
- [ ] Abrir → interagir → encerrar
- [ ] Buscar atendimento encerrado
- [ ] Filtros principais funcionam
- [ ] Logs/auditoria registram as ações

---

## 7) Mini-guia QA (execução)
1. **Preparar dados** (clientes, agentes, filas, SLA)
2. **Executar o fluxo feliz** (abertura → atendimento → encerramento)
3. **Cobrir variações** (prioridades, canais, reatribuição)
4. **Testar permissões** (agente vs supervisor)
5. **Validar SLA** (início/pausa/expiração)
6. **Registrar evidências** (prints e IDs de atendimento)

---

## 8) Evidências mínimas
- Print da criação do atendimento
- Print de mensagem enviada e nota interna
- Print do SLA (alerta ou expirado)
- Print da tela de encerramento com motivo/resolução
- Log/auditoria de alteração crítica
