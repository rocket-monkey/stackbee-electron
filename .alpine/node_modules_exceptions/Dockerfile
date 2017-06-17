FROM node:alpine
MAINTAINER Remo Vetere <remo.vetere@gmail.com>

# install python3
RUN apk update && \
    apk add python && \
    apk add make && \
    apk add g++

# Bundle app source
ADD . /src

RUN chown -R $USER:$(id -gn $USER) -R /src
RUN chmod -R 700 /src

WORKDIR /src

# Install the project as global cli command "sbm" (see package.json)
# RUN npm install -g

EXPOSE  3000

CMD rm -rf node_modules && \
    npm install && \
    npm config set unsafe-perm=true && \
    npm install -g && \
    node_modules/.bin/babel-node app.js