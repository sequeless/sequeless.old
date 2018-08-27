/* global define */
'use strict';


define([
	'-/logger/index.js'
], logger => {
	let state = 'disconnected';

	return {
		middleware() {
			return (req, res, next) => {
				switch (state) {
				case 'ready':
					return next();
				default:
					logger.warn('server state is not yet ready');
					return res.status(503).end();
				}
			};
		},
		setState(newState) {
			state = newState;

			logger.info('server has changed state', { state });
		}
	};
});
