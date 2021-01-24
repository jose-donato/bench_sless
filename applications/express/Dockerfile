FROM node:current-alpine
WORKDIR /base
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3003

CMD ["npm", "run", "start"]
#docker build -t sa-express .
#docker run -p 3003:3003 --memory="1g" --cpus="1" sa-express