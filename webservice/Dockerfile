FROM node:18
WORKDIR /root

COPY package*.json ./

RUN npm install

COPY service.js service.js

CMD [ "node", "service.js" ]