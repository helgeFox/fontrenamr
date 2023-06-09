FROM node:lts-alpine3.18

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install --quiet

COPY . .

EXPOSE 3003

CMD [ "npm", "start" ]
