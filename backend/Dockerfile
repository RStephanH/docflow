FROM node:20-alpine

WORKDIR /app

# Puppeteer a besoin de ces dépendances système sur Alpine
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Dire à Puppeteer d'utiliser le Chromium système, pas le sien
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]