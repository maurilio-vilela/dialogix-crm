FROM node:22.21.1-alpine as builder

RUN apk add wget && apk add --no-cache git
WORKDIR /home/node
RUN git clone https://github.com/wppconnect-team/wppconnect-server.git /home/node/app
WORKDIR /home/node/app
COPY ./config.ts /home/node/app/src
RUN corepack enable && corepack prepare yarn@4.12.0 --activate
RUN yarn install

FROM node:22.21.1-alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
WORKDIR /home/node/app
RUN apk add chromium
RUN corepack enable && corepack prepare yarn@4.12.0 --activate
COPY --from=builder /home/node/app/ .
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 21465

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
