FROM node:18
ENV NODE_VERSION 18.12.1
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

RUN yarn install
RUN apt-get update -y


EXPOSE 80
CMD [ "yarn", "dev" ]

