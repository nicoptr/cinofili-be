FROM node:18.20.8-alpine
MAINTAINER Nicola Pietrangelo <nicola.pietrangelo@overzoom.it>

WORKDIR /app

RUN apk add --no-cache openssl

# 🟩 Copia il package e installa dipendenze
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 🟩 Copia tutto il progetto (incluso prisma e src)
COPY . .

# 🟩 Genera Prisma Client
RUN yarn prisma generate

# 🟩 Compila TypeScript
RUN yarn build

# 🟩 Esponi porta server
EXPOSE 5000

# 🟩 Avvio app con migration deploy
CMD ["yarn", "start:migrate:prod"]

