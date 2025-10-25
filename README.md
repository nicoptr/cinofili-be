# CINOFILI API

Questo progetto è un'utility creata al volo per organizzare una serata degli Oscar con gli amici.
Permette all'admin di creare un evento e a chiunque di registrarsi e inviare una candidatura, sulla base di una categoria, in forma completamente anonima: il vincitore uscirà allo scoperto solo al momento dell'assegnazione dei premi!

## Run locally

1) Setup postgres
```
cd docker/
docker-compose up --build -d postgresql
```
2) Setup Node.js, Yarn and Install dependencies

```
nvm use 18.15.0
yarn install
cp .env.example .env
```
#### IMPORTANTE
3) Aggiungere nel proprio .yarnrc.yml la parte relativa a prisma presente nel .yarnrc.yml.example

4) Setup prisma config and Run application
```
yarn prisma generate
yarn dev
```

5) On start a new migration
```
yarn prisma generate
yarn prisma migrate dev --name "init"
```

Swagger documentation is available at `http://localhost:5000/docs`

## Build

```
yarn build
```
Build output will be available at `/dist/`
