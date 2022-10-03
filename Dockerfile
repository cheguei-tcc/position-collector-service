FROM node:18.5.0

ARG NPM_TOKEN

RUN mkdir /app

COPY ./package* ./tsconfig.json ./jest.config.js /app/
COPY ./src /app/src

WORKDIR /app

RUN npm ci
RUN npm run build

CMD npm run start
