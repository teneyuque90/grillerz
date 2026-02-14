FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY scripts/migrate.mjs ./scripts/migrate.mjs
COPY public ./public

RUN mkdir -p /data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/data/grillerz.sqlite
ENV ALLOW_ANY_VERIFICATION_CODE=false

EXPOSE 3000

CMD ["sh", "-c", "node scripts/migrate.mjs && node src/server.js"]
