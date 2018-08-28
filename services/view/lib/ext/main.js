/* global define */
'use strict';

define([
	'lodash',
	'express',
	'express-handlebars',
	'-/options/index.js',
	'-/logger/index.js',
	'-/server/index.js'
], (_, express, expressHandlebars, options, logger, server) => {
	function main() {
		const defaults = {
			port: 8000,
			retryInterval: 1000
		};
		const { port } = _.defaultsDeep(options.get(), defaults);
		const { app } = server;

		app.engine('hbs', expressHandlebars({ defaultLayout: 'default', extname: '.hbs' }));
		app.set('view engine', 'hbs');

		async function listen() {
			try {
				server.use('/assets', (req, res, next) => {
					logger.trace('load static:', { originalUrl: req.originalUrl });
					express.static('assets')(req, res, next);
				});

				server.use('/:namespace/:component/:version', (req, res) => {
					const { namespace, component, version } = req.params || {};

					logger.trace('load dynamic:', {
						originalUrl: req.originalUrl,
						namespace,
						component,
						version
					});

					const template = `${namespace}/${component}/${version}/index`;
					const { query } = req;

					logger.debug('render', { template, query });
					res.render(template, { query });
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
