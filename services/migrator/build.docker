FROM node:8.11.4

ENV DB_HOST rethinkdb
ENV DB_PORT 28015

WORKDIR /workspace

COPY wait-for-it.sh /workspace/
COPY package.json /workspace/
RUN npm install

COPY index.js /workspace/

CMD ./wait-for-it.sh -t 0 -h ${DB_HOST} -p ${DB_PORT} -- node index.js
