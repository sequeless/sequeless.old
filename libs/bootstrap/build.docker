FROM node:8.11.4

ENV NODE_ENV=production
ENV LOG_LEVEL=info

RUN mkdir -p /opt/bootstrap

COPY package.json /opt/bootstrap/package.json
COPY bin /opt/bootstrap/bin
COPY index.js /opt/bootstrap/index.js
COPY lib /opt/bootstrap/lib

WORKDIR /workspace
RUN cd /opt/bootstrap && cp $(npm pack) /workspace/bootstrap.tgz
ONBUILD COPY package.json /workspace/package.json
ONBUILD RUN npm install --save bootstrap.tgz && npm install
