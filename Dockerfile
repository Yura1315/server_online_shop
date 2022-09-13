FROM node
ENV NODE_ENV=dev

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . .


EXPOSE 5000


CMD npm run start