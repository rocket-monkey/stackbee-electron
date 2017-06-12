FROM node:alpine
MAINTAINER Remo Vetere <remo.vetere@gmail.com>

# Bundle app source
ADD . /src

RUN chown -R $USER:$(id -gn $USER) -R /src
RUN chmod -R 700 /src

WORKDIR /src

# Install the project as global cli command "sbm" (see package.json)
# RUN npm install -g

EXPOSE  3000

CMD ["node_modules/.bin/babel-node", "app.js"]
