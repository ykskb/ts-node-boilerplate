FROM node:10.15-alpine

RUN npm install -g typescript ts-node

WORKDIR /var/www/app

CMD [ "node" ]