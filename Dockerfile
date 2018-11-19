FROM node:latest

ENV PORT=8888
ENV NODE_ENV=production
WORKDIR /home/node/app

COPY . ./

RUN npm install
EXPOSE 8888
CMD npm run start
