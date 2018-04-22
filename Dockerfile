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
RUN apk add --update --no-cache python ca-certificates \
	&& update-ca-certificates
WORKDIR /server
COPY --from=build /server .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["pm2-runtime", "dist/server/main.js", "--instances", "max"]