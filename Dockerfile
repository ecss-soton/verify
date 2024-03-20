FROM node:18-alpine AS base

FROM base AS deps

RUN apk add --no-cache libc6-compat

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

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /home/node/app/public ./public

COPY --from=builder --chown=nextjs:nodejs /home/node/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /home/node/app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME localhost

CMD ["node", "server.js"]
