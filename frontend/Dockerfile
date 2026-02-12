# Multi-stage build para produção otimizada
FROM node:20-alpine AS builder

WORKDIR /app

# Build args para variáveis de ambiente do Vite
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_APP_NAME="Dialogix CRM"

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Nginx para servir arquivos estáticos
FROM nginx:alpine

# Copiar build do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
