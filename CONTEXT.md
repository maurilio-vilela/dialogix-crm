# CONTEXT — Dialogix CRM

## Objetivo
- Criar o melhor CRM SaaS Omnichannel com IA do mercado.

## Stack
- Backend: NestJS + TypeORM
- Frontend: React + Vite + TailwindCSS
- Database: PostgreSQL
- Cache: Redis
- Infra: Docker Swarm + Traefik + Portainer

## Repositório
- git@github.com:maurilio-vilela/dialogix-crm.git

## Fork/Submodule WhatsMeow
- Submodule: vendors/whatsmeow (fork Dialogix)

## Status atual (geral)
- Stack `dialogix-crm` rodando no Swarm.
- URLs:
  - Frontend: https://dev.dialogix.com.br
  - API: https://api-dev.dialogix.com.br/api/docs

## Resumo do que foi feito ontem (2026-02-21)
### dialogix-crm
- WhatsApp Channels MVP: backend módulo/endpoints + UI/service.
- Integração WPPConnect: stack Docker + build config + secrets + envs + host/URL internos.
- Webhooks WhatsApp: ingest + parse de payload real + persistência de sessões.
- Migrations/seed: tabela whatsapp_sessions, guards e logs, correções para ausência de tabela.
- Ajustes operacionais: certificados, corepack/yarn, node 22, tokens/sessões, status mapping.
- Docs/relatórios: Oracle/Scribe do dia + relatórios APIs WhatsApp.

### vendors/whatsmeow
- Helpers interativos (buttons/list/native flow) + validações.
- Limites configuráveis de validação.
- Documentação e CHANGELOG específicos da Dialogix.

## Resumo do que foi feito hoje (2026-02-22)
### Fork WhatsMeow
- Nova função: SendGhostMentionAll em vendors/whatsmeow/mentions.go.
- Envia texto para grupo com ContextInfo.MentionedJID preenchido com todos os participantes.
- Sem @ no texto, mas notifica todos.
- Changelog atualizado: CHANGELOG-DIALOGIX.md.
- Commit no fork: e65f13d.
- Submodule no dialogix-crm atualizado: commit 7ea2d58.
- Push realizado em ambos os repositórios usando id_ed25519.

## Pendências imediatas
- Validar deploy/runtime para refletir o submodule atualizado.
- Revisar endpoints e integração final do Channels + WPPConnect.

## Credenciais/URLs úteis
- Portainer: https://portainer.dialogix.com.br

## Notas críticas
- Manter submodule vendors/whatsmeow alinhado com o fork Dialogix.
