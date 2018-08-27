FROM sequeless/boot:latest

ENV STORE_URI=rethinkdb://admin@rethinkdb:28015
ENV PORT=80

VOLUME /var/run

COPY index.js /workspace/index.js
COPY lib /workspace/lib

CMD npm start
