FROM node:8 as base
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
EXPOSE 8000

FROM base as development
ENV NODE_ENV development
COPY package.json package-lock.json ./
RUN npm install
COPY .babelrc .eslintrc.json webpack.config.js server.js ./
COPY client ./client
COPY config ./config
COPY server ./server

FROM development as build
ENV NODE_ENV=production
RUN npm run build && npm run build:server

FROM base as production
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm install --production
COPY index.js ./
COPY --from=build /usr/src/app/dist ./dist
CMD ["npm", "run", "start:prod"]
