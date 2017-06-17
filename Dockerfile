FROM node:alpine
MAINTAINER Remo Vetere <remo.vetere@gmail.com>

# Bundle app source
ADD . /src

RUN chown -R $USER:$(id -gn $USER) -R /src
RUN chmod -R 700 /src

WORKDIR /src

RUN rm -rf node_modules/bcrypt
RUN mv .alpine/node_modules_exceptions/bcrypt node_modules/

# Install the project as global cli command "sbm" (see package.json)
# RUN npm install -g

EXPOSE  3000

CMD npm config set unsafe-perm=true && \
    npm install -g && \
    node_modules/.bin/babel-node app.js
