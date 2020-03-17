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
# FROM node:alpine

# # Create app directory
# RUN mkdir -p /usr/src/account-service
# WORKDIR /usr/src/account-service

# # Install app dependencies
# COPY package.json /usr/src/account-service
# RUN npm config set unsafe-perm=true
# RUN npm install

# # Bundle app source
# COPY . /usr/src/account-service

# EXPOSE 3000

# HEALTHCHECK --interval=1m --timeout=3s CMD curl --fail http://localhost/vitals/docker || exit 1

# CMD [ "npm run dev" ]

