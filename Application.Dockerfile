FROM node:8.12.0-alpine

RUN npm install -g typescript typeorm

WORKDIR /var/www/app

CMD [ "node" ]