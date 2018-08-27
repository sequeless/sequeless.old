FROM node:8.11.4

ENV NODE_ENV=production
ENV LOG_LEVEL=info

RUN mkdir -p /opt/boot

COPY package.json /opt/boot/package.json
COPY bin /opt/boot/bin
COPY index.js /opt/boot/index.js
COPY lib /opt/boot/lib

WORKDIR /workspace
RUN cd /opt/boot && cp $(npm pack) /workspace
ONBUILD COPY package.json /workspace/package.json
ONBUILD RUN npm install --save *.tgz && npm install
