FROM node:18.20.8-alpine
MAINTAINER Carmine Verde <carmine.verde@overzoom.it>

WORKDIR /app

RUN apk add openssl

# Copy package.json and lockfile
COPY package.json .
COPY yarn.lock .

# Copy source files
COPY . .

RUN mkdir -p public/images
RUN mkdir -p public/pdf

# Launch PM2
EXPOSE 5000
CMD ["yarn", "start:migrate:prod"]
