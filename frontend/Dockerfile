# Étape de base avec dependencies
FROM node:22-alpine AS base

# Installer les dépendances
FROM base AS deps
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./
RUN npm ci --only=production

# Étape de build
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Étape de développement
FROM base as development
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Étape de production
FROM base AS production
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copier package.json pour installer les dépendances de production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copier l'application entière et les fichiers de build
COPY . .
COPY --from=builder /app/.next ./.next

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
