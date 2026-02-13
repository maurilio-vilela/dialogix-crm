# Segurança - Dialogix CRM

Este documento descreve as medidas de segurança implementadas no Dialogix CRM.

## 🛡️ Medidas Implementadas

### 1. **Helmet.js - Headers de Segurança**

O Helmet.js adiciona automaticamente headers HTTP de segurança para proteger contra vulnerabilidades comuns:

- **X-DNS-Prefetch-Control**: Controla o DNS prefetching do navegador
- **X-Frame-Options**: Previne ataques de clickjacking
- **X-Content-Type-Options**: Previne MIME type sniffing
- **Strict-Transport-Security (HSTS)**: Força HTTPS
- **X-Download-Options**: Previne downloads automáticos no IE
- **X-Permitted-Cross-Domain-Policies**: Controla políticas cross-domain do Flash/PDF
- **Referrer-Policy**: Controla informações de referrer
- **Content-Security-Policy (CSP)**: Previne XSS e injeção de scripts maliciosos

**Localização:** `backend/src/main.ts`

```typescript
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
```

---

### 2. **Rate Limiting - Proteção Contra Brute-Force**

Implementamos rate limiting em três níveis usando `@nestjs/throttler`:

| Nível  | Janela de Tempo | Limite de Requisições |
|--------|-----------------|----------------------|
| Short  | 1 segundo       | 10 requisições       |
| Medium | 10 segundos     | 50 requisições       |
| Long   | 1 minuto        | 100 requisições      |

**Proteção contra:**
- Ataques de força bruta em login
- Spam de requisições
- Scraping agressivo
- DDoS básico

**Localização:** `backend/src/app.module.ts`

**Como pular rate limiting em rotas específicas:**

```typescript
import { SkipThrottling } from '@/common/decorators/skip-throttle.decorator';

@SkipThrottling()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```

**Casos de uso para @SkipThrottling():**
- Health checks
- Webhooks externos (Evolution API, Meta, etc.)
- Uploads de arquivos grandes
- WebSocket connections

---

### 3. **CORS Otimizado**

Configuração de CORS restrita e segura:

- **Origens permitidas:** Apenas frontend configurado (variável `FRONTEND_URL`)
- **Credenciais:** Habilitado (`credentials: true`)
- **Métodos HTTP:** Lista explícita de métodos permitidos
- **Headers permitidos:** Apenas `Content-Type` e `Authorization`

**Localização:** `backend/src/main.ts`

```typescript
app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Configuração via .env:**

```bash
# Múltiplas origens (separadas por vírgula)
FRONTEND_URL=https://app.dialogix.com,https://app-staging.dialogix.com

# Desenvolvimento
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

---

### 4. **Autenticação JWT**

- **Tokens JWT** com expiração de 7 dias
- **Secret seguro** armazenado em variável de ambiente (`JWT_SECRET`)
- **Guards de autenticação** em todas as rotas protegidas
- **Validação de token** no handshake do WebSocket

---

### 5. **Validação de Dados (Class-validator)**

Todas as requisições são validadas automaticamente:

- **Whitelist:** Remove propriedades não esperadas
- **Transform:** Transforma tipos automaticamente
- **ForbidNonWhitelisted:** Rejeita requisições com propriedades extras

**Localização:** `backend/src/main.ts`

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }),
);
```

---

### 6. **Multi-Tenancy com Isolamento**

- **Isolamento de dados** por tenant (via `tenantId` em todas as queries)
- **WebSocket rooms** separados por tenant (`tenant:${tenantId}`)
- **Impossível** acessar dados de outro tenant sem permissão

---

## 🔐 Próximas Melhorias de Segurança (Roadmap)

### Fase Futura 1: Autenticação Avançada
- [ ] Refresh Tokens
- [ ] 2FA (Two-Factor Authentication)
- [ ] Blacklist de tokens revogados (Redis)
- [ ] Login com Google/Microsoft (OAuth2)

### Fase Futura 2: Criptografia
- [ ] Criptografia de campos sensíveis no banco (E2E)
- [ ] Hashing de senhas com Argon2 (atualmente bcrypt)
- [ ] Criptografia de arquivos uploadados (S3/MinIO)

### Fase Futura 3: Auditoria e Compliance
- [ ] Logs de auditoria (quem fez o quê e quando)
- [ ] LGPD: Anonimização de dados
- [ ] GDPR: Right to be forgotten
- [ ] SOC 2 Type II compliance

### Fase Futura 4: Infraestrutura
- [ ] WAF (Web Application Firewall) no Nginx
- [ ] Fail2Ban para bloqueio automático de IPs suspeitos
- [ ] CDN com proteção DDoS (Cloudflare)
- [ ] Monitoramento de vulnerabilidades (Snyk, Dependabot)

---

## 📋 Checklist de Deploy Seguro

Antes de colocar em produção, garanta:

- [ ] `JWT_SECRET` é uma string aleatória e forte (min. 32 caracteres)
- [ ] `FRONTEND_URL` está configurado com o domínio correto (sem `*`)
- [ ] HTTPS está habilitado com certificado válido (Let's Encrypt)
- [ ] Firewall permite apenas portas necessárias (80, 443, 5432 apenas internamente)
- [ ] PostgreSQL **não** está exposto publicamente
- [ ] Redis **não** está exposto publicamente
- [ ] Senhas de banco e Redis são fortes
- [ ] Backup automático está configurado
- [ ] Logs estão sendo coletados e monitorados
- [ ] Rate limiting está ativo e testado
- [ ] CORS está restrito ao frontend correto

---

## 🚨 Reportar Vulnerabilidades

Se você encontrar uma vulnerabilidade de segurança, **NÃO** abra uma issue pública.

Entre em contato diretamente via:
- **Email:** security@dialogix.com (não configurado ainda)
- **Telegram:** @mauriliovilela (temporário)

Responderemos em até 48 horas úteis.

---

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/helmet)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [@nestjs/throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
