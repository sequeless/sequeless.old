/* global define */
'use strict';

define([
	'lodash',
	'body-parser',
	'fs',
	'cluster',
	'os',
	'-/options/index.js',
	'-/logger/index.js',
	'-/store/index.js',
	'-/server/index.js',
	'-/ext/graphql/index.js',
	'-/ext/resolvers/get/index.js'
], (_, bodyParser, fs, cluster, os, options, logger, store, server, graphql, get) => {
	function main() {
		const defaults = {
			port: 80,
			storeUri: 'rethinkdb://admin@127.0.0.1:28015',
			retryInterval: 1000
		};
		const settings = _.defaults(options.get(), defaults);
		const socketPath = '/var/run/resolvers.sock';

		async function fork() {
			const CPUs = os.cpus().length;

			logger.info('fork', { CPUs });

			try {
				fs.unlinkSync(socketPath);
			} catch (err) {
				logger.warn('api unable to unlink socket file', { err });
			}

			for (let i = 0; i < (2 * CPUs); i++) {
				cluster.fork();
			}
		}

		function startMaster() {
			const port = parseInt(_.get(settings, 'port'), 10);

			server.use('/:bctxt/:aggregate/:v', graphql.middleware());
			logger.info('server.listen()', { port });

			return server.listen(port);
		}

		async function connect() {
			const storeUri = _.get(settings, 'storeUri');
			const retryInterval = parseInt(options.get('retryInterval'), 10);

			try {
				await store.connect({ storeUri });

				logger.info('store has connected', { storeUri });

				server.setState('ready'); // TODO: replace with connected, ready if db was created
			} catch (err) {
				logger.error('store unable to connect', { storeUri, err });
				setTimeout(connect, retryInterval);
			}
		}

		function work() {
			server.use(bodyParser.json());
			server.use('/get/0.0', get.middleware());

			server.setState('ready');

			return server.listen(socketPath);
		}

		return cluster.isMaster
			? fork().then(startMaster).then(connect)
			: work();
	}

	return main;
});
