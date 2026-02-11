# Guia de Desenvolvimento - Dialogix CRM

## 🛠️ Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+
- Git
- VS Code (recomendado)

### Extensões VS Code Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "mikestead.dotenv"
  ]
}
```

---

## 🚀 Setup Inicial

### 1. Clonar e Instalar

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/dialogix-crm.git
cd dialogix-crm

# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Configurar Banco de Dados

```bash
# Criar banco de dados
createdb dialogix_crm_dev

# Ou via psql
psql -U postgres
CREATE DATABASE dialogix_crm_dev;
CREATE USER dialogix_dev WITH PASSWORD 'dev123';
GRANT ALL PRIVILEGES ON DATABASE dialogix_crm_dev TO dialogix_dev;
\q
```

### 3. Configurar Redis

```bash
# Redis já deve estar rodando na porta padrão 6379
redis-cli ping  # deve retornar PONG
```

### 4. Rodar Migrations

```bash
cd backend
npm run migration:run

# Seed de dados de teste
npm run seed:run
```

### 5. Iniciar Desenvolvimento

```bash
# Terminal 1 - Backend API
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - WebSocket (se separado)
cd backend
npm run start:ws
```

Acessar:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs

---

## 📁 Estrutura de Pastas Detalhada

### Backend (NestJS)

```
backend/
├── src/
│   ├── modules/              # Módulos da aplicação
│   │   ├── auth/            # Autenticação e autorização
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   └── decorators/
│   │   │
│   │   ├── users/           # Gestão de usuários
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── contacts/        # Gestão de contatos
│   │   ├── conversations/   # Conversas e atendimento
│   │   ├── messages/        # Mensagens
│   │   ├── channels/        # Canais de comunicação
│   │   ├── pipelines/       # Pipeline de vendas
│   │   ├── deals/           # Oportunidades
│   │   ├── tasks/           # Tarefas
│   │   ├── tags/            # Tags
│   │   ├── quick-replies/   # Respostas rápidas
│   │   ├── ai-agents/       # Agentes de IA
│   │   ├── webhooks/        # Webhooks
│   │   ├── subscriptions/   # Assinaturas SaaS
│   │   ├── payments/        # Pagamentos
│   │   └── analytics/       # Analytics e relatórios
│   │
│   ├── common/              # Código compartilhado
│   │   ├── decorators/      # Decorators customizados
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── current-tenant.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── filters/         # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/          # Guards de autenticação
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── tenant.guard.ts
│   │   ├── interceptors/    # Interceptors
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── tenant.interceptor.ts
│   │   ├── pipes/           # Pipes de validação
│   │   │   └── validation.pipe.ts
│   │   ├── interfaces/      # Interfaces TypeScript
│   │   └── utils/           # Utilitários
│   │
│   ├── config/              # Configurações
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   │
│   ├── database/            # Banco de dados
│   │   ├── migrations/      # Migrations
│   │   │   └── 1644578400000-CreateTables.ts
│   │   ├── seeds/           # Seeds de desenvolvimento
│   │   │   └── 1644578400001-SeedData.ts
│   │   └── data-source.ts   # TypeORM DataSource
│   │
│   ├── gateways/            # WebSocket Gateways
│   │   ├── chat.gateway.ts
│   │   ├── notifications.gateway.ts
│   │   └── presence.gateway.ts
│   │
│   ├── queues/              # BullMQ Queues
│   │   ├── processors/
│   │   │   ├── message.processor.ts
│   │   │   ├── ai.processor.ts
│   │   │   └── notification.processor.ts
│   │   └── queue.module.ts
│   │
│   ├── integrations/        # Integrações externas
│   │   ├── whatsapp/
│   │   │   ├── whatsapp.service.ts
│   │   │   └── evolution-api.client.ts
│   │   ├── instagram/
│   │   ├── telegram/
│   │   ├── openai/
│   │   ├── stripe/
│   │   └── aws-s3/
│   │
│   ├── app.module.ts        # Módulo raiz
│   ├── main.ts              # Entry point
│   └── swagger.ts           # Configuração Swagger
│
├── test/                    # Testes
│   ├── unit/
│   └── e2e/
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

### Frontend (React)

```
frontend/
├── public/                  # Assets públicos
│   ├── favicon.ico
│   └── logo.png
│
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/            # Componentes base (Shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/        # Componentes de layout
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── forms/         # Componentes de formulário
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   ├── FormTextarea.tsx
│   │   │   ├── FormDatePicker.tsx
│   │   │   └── FormFileUpload.tsx
│   │   │
│   │   └── shared/        # Componentes compartilhados
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── Pagination.tsx
│   │       └── SearchInput.tsx
│   │
│   ├── pages/             # Páginas da aplicação
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx
│   │   │
│   │   ├── Attendance/    # Atendimento
│   │   │   ├── AttendancePage.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── ContactInfo.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── components/
│   │   │
│   │   ├── Contacts/      # Contatos
│   │   │   ├── ContactsPage.tsx
│   │   │   ├── ContactsList.tsx
│   │   │   ├── ContactDetails.tsx
│   │   │   └── ContactForm.tsx
│   │   │
│   │   ├── Pipeline/      # Pipeline de Vendas
│   │   │   ├── PipelinePage.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── DealCard.tsx
│   │   │   └── DealForm.tsx
│   │   │
│   │   ├── Tasks/
│   │   ├── AIAgents/
│   │   ├── Reports/
│   │   ├── Settings/
│   │   └── Billing/
│   │
│   ├── services/          # API Services
│   │   ├── api.ts         # Axios instance
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── contacts.service.ts
│   │   ├── conversations.service.ts
│   │   ├── messages.service.ts
│   │   └── ...
│   │
│   ├── hooks/             # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useWebSocket.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePagination.ts
│   │   └── useInfiniteScroll.ts
│   │
│   ├── store/             # Zustand Stores
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   ├── conversationStore.ts
│   │   ├── notificationStore.ts
│   │   └── themeStore.ts
│   │
│   ├── utils/             # Utilitários
│   │   ├── format.ts      # Formatação de dados
│   │   ├── validators.ts  # Validações
│   │   ├── constants.ts   # Constantes
│   │   └── helpers.ts     # Funções auxiliares
│   │
│   ├── types/             # TypeScript Types
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── contact.types.ts
│   │   ├── conversation.types.ts
│   │   └── api.types.ts
│   │
│   ├── styles/            # Estilos globais
│   │   ├── globals.css
│   │   └── tailwind.css
│   │
│   ├── App.tsx            # Componente raiz
│   ├── main.tsx           # Entry point
│   └── router.tsx         # Configuração de rotas
│
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🎨 Padrões de Código

### TypeScript

```typescript
// ✅ Bom: Tipagem explícita
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Evitar: any
function processData(data: any) {
  // ...
}
```

### NestJS Controllers

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuários' })
  async findAll(@CurrentUser() user: User) {
    return this.usersService.findAll(user.tenant_id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar usuário' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.create(user.tenant_id, createUserDto);
  }
}
```

### NestJS Services

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(tenantId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, tenant_id: tenantId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async create(tenantId: string, dto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      ...dto,
      tenant_id: tenantId,
    });

    return this.usersRepository.save(user);
  }
}
```

### React Components

```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  initialData?: ContactFormData;
}

export const ContactForm: React.FC<ContactFormProps> = ({ 
  onSubmit, 
  initialData 
}) => {
  const [formData, setFormData] = useState<ContactFormData>(
    initialData || {
      name: '',
      email: '',
      phone: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      
      <Button type="submit">
        Salvar
      </Button>
    </form>
  );
};
```

### Custom Hooks

```typescript
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(url, {
      auth: {
        token: localStorage.getItem('access_token'),
      },
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url]);

  return { socket, connected };
};
```

---

## 🧪 Testes

### Backend - Unit Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', tenant_id: 'tenant-1' },
        { id: '2', name: 'User 2', tenant_id: 'tenant-1' },
      ];

      repository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll('tenant-1');

      expect(result).toEqual(mockUsers);
      expect(repository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-1' },
        order: { created_at: 'DESC' },
      });
    });
  });
});
```

### Frontend - Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactForm } from './ContactForm';

describe('ContactForm', () => {
  it('renders form fields', () => {
    render(<ContactForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
  });

  it('calls onSubmit with form data', () => {
    const onSubmit = jest.fn();
    render(<ContactForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'João Silva' },
    });

    fireEvent.click(screen.getByText('Salvar'));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'João Silva',
      email: '',
      phone: '',
    });
  });
});
```

---

## 🔧 Scripts Úteis

### Backend

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\"",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm -- migration:generate -d src/database/data-source.ts",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run -d src/database/data-source.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/database/data-source.ts",
    "seed:run": "ts-node src/database/seeds/run-seeds.ts"
  }
}
```

### Frontend

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## 📚 Convenções

### Git Commit Messages

```
feat: adiciona autenticação JWT
fix: corrige erro de validação no formulário de contato
docs: atualiza documentação da API
style: formata código com prettier
refactor: refatora serviço de mensagens
test: adiciona testes para UsersService
chore: atualiza dependências
```

### Branch Naming

```
feature/user-authentication
bugfix/message-validation
hotfix/security-issue
refactor/conversation-service
```

### Pull Request Template

```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de Mudança
- [ ] Nova feature
- [ ] Correção de bug
- [ ] Breaking change
- [ ] Atualização de documentação

## Checklist
- [ ] Código segue o style guide
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Build passou sem erros
- [ ] Lint passou sem erros
```

---

## 🐛 Debugging

### VS Code Launch Configuration

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

---

## 📖 Recursos de Aprendizado

- [NestJS Documentation](https://docs.nestjs.com)
- [React Documentation](https://react.dev)
- [TypeORM Documentation](https://typeorm.io)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Shadcn/ui Components](https://ui.shadcn.com)

---

**Última Atualização**: 11 de Fevereiro de 2025
