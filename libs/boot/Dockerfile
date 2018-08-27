FROM node:8.11.4

ENV NODE_ENV=production
ENV LOG_LEVEL=info

RUN mkdir -p /opt/boot

COPY package.json /opt/boot/package.json
COPY bin /opt/boot/bin
RUN cd /opt/boot && npm link

COPY index.js /opt/boot/index.js
COPY lib /opt/boot/lib

WORKDIR /workspace
ONBUILD COPY package.json /workspace/package.json
ONBUILD RUN npm link @sequeless/boot && npm install
