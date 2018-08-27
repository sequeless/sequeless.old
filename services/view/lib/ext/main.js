/* global define */
'use strict';

define([
	'lodash',
	'express',
	'-/options/index.js',
	'-/logger/index.js',
	'-/server/index.js'
], (_, express, options, logger, server) => {
	function main() {
		const defaults = {
			port: 8000,
			retryInterval: 1000
		};
		const { port } = _.defaultsDeep(options.get(), defaults);

		async function listen() {
			try {
				server.use('/', (req, res, next) => {
					logger.trace('load static:', { originalUrl: req.originalUrl });
					express.static('public')(req, res, next);
				});

				server.setState('ready');

				const { success } = await server.listen(port) || {};

				logger.info('server is listening', { port, success });
			} catch (err) {
				logger.error('server unable to listen', { port, err });
				process.exitCode = 1;
			}
		}

		return listen();
	}

	return main;
});
