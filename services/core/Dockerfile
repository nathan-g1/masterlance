FROM node:alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV DEBUG loopback:connector:swagger

# Install dependencies
COPY package.json .
# RUN npm install

# Bundle app source
COPY . .

# Exports
EXPOSE 3000

HEALTHCHECK --interval=1m --timeout=3s CMD curl --fail http://localhost/vitals/docker || exit 1

CMD [ "npm", "run", "start.dev" ]
