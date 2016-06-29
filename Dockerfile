FROM node:4-onbuild

WORKDIR /usr/src/app
RUN make test
RUN make build

CMD npm start

EXPOSE 3000