FROM mhart/alpine-node:8

RUN apk add --no-cache make gcc g++ python

WORKDIR /meoup

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ENV PORT=8080 \
    NODE_ENV=production

RUN npm run build

EXPOSE 8080
CMD ["npm", "start"]