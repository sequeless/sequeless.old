FROM ubuntu:xenial

ENTRYPOINT ["npm", "run"]
WORKDIR /workspace

RUN apt-get update && apt-get install -y curl make nodejs npm

RUN curl -fsSL get.docker.com | sh
RUN curl -L https://github.com/docker/compose/releases/download/1.20.1/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose && chmod a+x /usr/local/bin/docker-compose

COPY package.json /workspace/package.json
COPY docker-compose.yml /workspace/docker-compose.yml

CMD ["usage"]
