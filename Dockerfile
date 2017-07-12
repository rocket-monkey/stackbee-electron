FROM node:alpine
MAINTAINER Remo Vetere <remo.vetere@gmail.com>

# install aws
RUN \
	mkdir -p /aws && \
	apk -Uuv add groff less python py-pip && \
	pip install awscli && \
	apk --purge -v del py-pip && \
	rm /var/cache/apk/* && \
    echo "export PATH=$PATH:/aws"

ADD .aws/credentials /root/.aws/
# ENV AWS_ACCESS_KEY_ID AKIAJYYCPYM535RG7IDA
# ENV AWS_SECRET_ACCESS_KEY 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

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
