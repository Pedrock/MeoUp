FROM node:8-alpine as build
RUN apk add --update --no-cache make gcc g++ python
WORKDIR /server
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ENV PORT=8080 \
    NODE_ENV=production
RUN npm run build && npm prune --production


FROM keymetrics/pm2:8-alpine
RUN apk add --update --no-cache python ca-certificates openssl \
	&& update-ca-certificates \
	&& echo "Installing PhantomJS" \
	&& wget -qO- https://github.com/Overbryd/docker-phantomjs-alpine/releases/download/2.11/phantomjs-alpine-x86_64.tar.bz2 | tar xj -C /usr/share \
  	&& ln -s /usr/share/phantomjs/phantomjs /usr/bin/phantomjs
WORKDIR /server
COPY --from=build /server .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["pm2-runtime", "dist/server/main.js", "--instances", "max"]