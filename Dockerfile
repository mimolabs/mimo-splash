FROM node:6

MAINTAINER MIMO!

RUN echo 123123123

ADD package.json /tmp/package.json
ADD bower.json /tmp/bower.json

RUN \
  npm install -g bower grunt-cli && \
  npm install --production && \
  mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app

ADD . /opt/app

RUN echo 123 && cd /opt/app && bower install --config.interactive=false --allow-root 

WORKDIR /opt/app

EXPOSE 8080
