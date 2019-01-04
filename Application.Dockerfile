FROM node:10.15-alpine

RUN npm install -g typescript typeorm ts-node

WORKDIR /var/www/app

CMD [ "node" ]