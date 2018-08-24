# Sequeless (@sequeless/sequeless)

**EXPERIMENTAL**: Not yet ready to be released

## REQUIREMENTS

### Docker w/ Swarmkit initialized and nodes labeled

- install Docker: https://docs.docker.com/install/
- create a swarm: https://docs.docker.com/engine/swarm/swarm-mode/#view-the-join-command-or-update-a-swarm-join-token

### OPTIONAL: For development only

- git
- make
- node
- npm
- docker-compose

## USAGE


### Deployment

```
docker run -v /var/run/docker.sock:/var/run/docker.sock sequeless/sequeless deploy
```

### Development

```
git clone git@github.com:sequeless/sequeless.git
cd sequeless
npm install
npm run bootstrap
npm run watch

open http://127.0.0.1/api/domain/0.0
```

#### Scripts

##### Monorepo Related

- `npm run bootstrap`: installs root packages in all sub-packages
- `npm run manage`: launches the wizard to manage the monorepo
- `npm run watch`: watches the monorepo for changes to initiate a re-deploy

##### Docker Related

- `npm run build`: builds all the Docker images - i.e. sequeless/sequeless and other services
- `npm run ship`: pushes all the Docker images into Docker Hub
- `npm run deploy`: deploys the Docker services on the local Docker swarm
- `npm run usage`: prints out the usage if the Docker container was ran without a command
