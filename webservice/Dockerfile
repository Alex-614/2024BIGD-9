FROM node:18
WORKDIR /app

COPY package*.json ./
COPY .npmrc ./

#RUN npm install

#RUN npm install --verbose --registry=https://registry.npmjs.org/
RUN npm install --verbose --unsafe-perm

COPY . .

#CMD [ "npm", "run", "start" ]
CMD [ "npm", "start" ]
