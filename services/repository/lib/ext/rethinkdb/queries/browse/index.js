/* global define */
'use strict';

define([
	'lodash',
	'-/logger/index.js'
], (_, logger) => {
	const plugin = {
		middleware() {
			return middleware;
		}
	};

	function middleware(req, res) {
		logger.trace('read middleware');

		const { body } = req;
		const { contexts, batch } = body || {};
		const data = _.map(batch, ({ trxId }) => {
			const context = _.get(contexts, trxId);
			const { user } = context || {};
			const results = [];

			for (let i = 0; i < 1000; i++) {
				const current = new Date();

				results.push({
					id: `127.0.0.${i}`,
					version: 1,
					meta: {
						current: current.toISOString()
					},
					repository: {
						name: 'default'
					},
					user
				});
			}

			return results;
		});

		res.writeHead(200, {
			'Content-Type': 'application/json'
		});
		res.write(JSON.stringify({
			data
		}));

		res.end();
	}

	return plugin;
});
