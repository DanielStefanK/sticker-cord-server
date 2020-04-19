FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN apt-get update \
  && apt-get install -y --no-install-recommends graphicsmagick \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 6080
CMD [ "npm", "run", "prod" ]