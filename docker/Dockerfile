FROM node:latest

# Reuse dotenv file
COPY ./.env /usr/local/src/scheduler-demo-app/

# Install React app dependencies and build static Web resources
WORKDIR /usr/local/src/scheduler-demo-app/web
COPY web/package.json /usr/local/src/scheduler-demo-app/web/
COPY web/package-lock.json /usr/local/src/scheduler-demo-app/web/
RUN npm ci
COPY ./web/ .
RUN npm run build

# Install API & Web server dependencies and run
WORKDIR /usr/local/src/scheduler-demo-app/server
COPY server/package.json /usr/local/src/scheduler-demo-app/server/
COPY server/package-lock.json /usr/local/src/scheduler-demo-app/server/
RUN npm ci
COPY ./server/ .
EXPOSE 3100

CMD ["node", "index.js"]