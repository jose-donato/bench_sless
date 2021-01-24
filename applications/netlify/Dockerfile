FROM node:current-alpine
WORKDIR /base
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run lambda-build
EXPOSE 8888
CMD ["npm", "run", "lambda-serve"]
#docker build -t sa-netlify .
#docker run -p 8888:8888 --memory="1g" --cpus="1" sa-netlify