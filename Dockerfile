FROM node:20-slim

LABEL org.opencontainers.image.authors="Elias Shekh"

WORKDIR /app

COPY package.json .

RUN npm i -g pnpm

RUN pnpm i

COPY . .

RUN pnpm run build

CMD ["sh", "-c", "node build/main"]

EXPOSE 8000
