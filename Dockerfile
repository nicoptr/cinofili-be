# ===== STAGE 1: builder =====
FROM node:18.20.8-alpine AS builder
LABEL stage=builder

WORKDIR /app

# Install only dependencies first (cache layer)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY . .
RUN prisma generate
RUN yarn build


# ===== STAGE 2: production runtime =====
FROM node:18.20.8-alpine
LABEL maintainer="Nicola Pietrangelo <nicola.pietrangelo@overzoom.it>"

WORKDIR /app

RUN apk add --no-cache openssl

# Copy only necessary runtime files
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Copy build output
COPY --from=builder /app/dist ./dist

# Setup timezone (optional)
ENV TZ=Europe/Rome

EXPOSE 5000

CMD ["yarn", "start:migrate:prod"]
