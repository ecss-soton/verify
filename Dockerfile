FROM node:lts-buster-slim AS base

RUN apt-get update && apt-get install libssl-dev ca-certificates -y

FROM base AS deps

WORKDIR /home/node/app

COPY package.json package-lock.json ./

RUN npm ci

FROM base AS builder

WORKDIR /home/node/app
COPY --from=deps /home/node/app/node_modules ./node_modules

COPY . .
COPY .env.example .env

RUN npm run build

# 3. Production image, copy all the files and run next
FROM base AS runtime

WORKDIR /home/node/app

COPY .env.example .env

ENV NODE_ENV=production

COPY --from=builder /home/node/app/public ./public
COPY --from=builder /home/node/app/assets ./assets
COPY --from=builder /home/node/app/prisma ./prisma

COPY --from=builder /home/node/app/.next/standalone ./
COPY --from=builder /home/node/app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
