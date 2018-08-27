/* global define */
'use strict';

define([
	'-/options/index.js',
	'-/logger/index.js',
	'-/store/index.js',
	'-/server/index.js',
	'-/ext/controller/index.js'
], (options, logger, store, server, controller) => {
	function main() {
		const defaults = {
			port: 8000,
			retryInterval: 1000
		};
		const { port, storeUri, retryInterval } = options.init(defaults);

		async function listen() {
			try {
				server.use(controller.middleware());

				const { success } = await server.listen(port) || {};

				logger.info('server is listening', { port, success });
			} catch (err) {
				logger.error('server unable to listen', { port, err });
				process.exitCode = 1;
			}
		}

		async function connect() {
			try {
				const { success } = await store.connect({ storeUri }) || {};

				logger.info('store has connected', { storeUri, success });

				server.setState('ready'); // TODO: replace with connected, ready if db was created
			} catch (err) {
				logger.error('store unable to connect', { storeUri, err });
				setTimeout(connect, retryInterval);
			}
		}

		return listen().then(connect);
	}

	return main;
});
