# Multi-stage build para produção otimizada
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY . .

# Build-time env for Vite
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 2: Nginx para servir arquivos estáticos
FROM nginx:alpine

# Copiar build do estágio anterior
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html
# Copiar configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
