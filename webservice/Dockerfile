FROM node:18
WORKDIR /root

COPY package*.json ./

RUN npm clean-install
 
COPY service.js main.js
 
CMD [ "node", "service.js" ]