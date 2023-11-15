# currencybirdtest

Para instalar dependencias:

```bash
npm install
```

Es necesario tener un archivo ".env" con los siguientes datos:

```bash
# For pg service
PSQL_PASSWORD=<contraseña de psql>

# For app service
PORT=<puerto>
ENV_COMMAND=<commando env>
DATABASE_URL=<url bdd>
```

Para levantar la base de datos, migraciones y seeds:

```bash
npx prisma migrate dev
```

Para correr:

```bash
npm start
```
