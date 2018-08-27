FROM sequeless/bootstrap:latest

ENV STORE_URI=rethinkdb://admin@rethinkdb:28015
ENV PORT=80

VOLUME /var/run

COPY lib /workspace/lib

CMD npm start
