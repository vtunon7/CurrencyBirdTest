FROM node:18-alpine

RUN mkdir -p /app/node_modules && chown -R node:node /app

WORKDIR /app

RUN npm install -g npm@8.10.0

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . ./

USER node

EXPOSE 4000

ENTRYPOINT [ "npm", "run" ]

CMD [ "dev" ]
