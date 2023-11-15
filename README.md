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

El endpoint para poder hacer los pagos es:

```
POST/ http://localhost:{PUERTO}/payment
```

Es necesario enviar en el body un json con lo siguiente:

```
{
  "email": "email@ejemplo.cl",
  "amount": 5000
}
```

Si la respuesta es exitosa se recibe:

```
{
  "amount": 5000,
  "email": "email@ejemplo.cl",
  "retries": 0,
  "transferCode": "email@ejemplo.cl"
}
```

Si falla por email no autorizado

```
{
  "message": "Error fetching token"
}
```

Si falla por error haciendo fetch a la información del pago:

```
{
  "message": "Error fetching payment"
}
```

Si falla por error haciendo POST a la información del pago:

```
{
  "message": "Error payment already made"
}
```
