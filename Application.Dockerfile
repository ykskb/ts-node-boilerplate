FROM node:8.12.0-alpine

RUN npm install -g typescript typeorm ts-node

WORKDIR /var/www/app

CMD [ "node" ]