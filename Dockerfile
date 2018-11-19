FROM node:11.1.0

ENV PORT=8888
EXPOSE 8888

WORKDIR /home/node/app
COPY . ./
RUN npm install

CMD npm run start
