FROM node:18
WORKDIR /root

COPY package*.json ./

RUN npm clean-install

COPY service.js service.js

CMD [ "npm", "run", "start" ]
