FROM node:6

MAINTAINER MIMO!

# WORKDIR /opt/app/dist

ADD package.json /tmp/package.json
ADD bower.json /tmp/bower.json

RUN \
  cd /tmp && \
  npm install -g bower grunt-cli && \
  npm install --production && \
  mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app

ADD . /opt/app

RUN cd /opt/app && bower install --config.interactive=false --allow-root 
#&& grunt build

WORKDIR /opt/app/dist

EXPOSE 8080

# CMD ["node", "server/app.js"]

# FROM node

# COPY package.json /src/package.json
# RUN npm -g update yo
# RUN cd /src; npm install
# RUN bower install

# COPY . /src

# EXPOSE 8080

# # CMD ["node", "/src/index.js"]
