FROM node:22.21.1-alpine3.20 as builder

RUN apk add wget && apk add --no-cache git
WORKDIR /home/node
RUN git clone https://github.com/wppconnect-team/wppconnect-server.git /home/node/app
WORKDIR /home/node/app
COPY ./config.ts /home/node/app/src
RUN yarn install

FROM node:22.21.1-alpine3.20
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
WORKDIR /home/node/app
RUN apk add chromium
COPY --from=builder /home/node/app/ .

EXPOSE 21465

CMD ["yarn", "dev"]
