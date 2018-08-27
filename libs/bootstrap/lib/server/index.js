/* global define, Promise */
'use strict';

define([
	'lodash',
	'express',
	'-/server/status-handler.js',
	'-/server/utils.js'
], (
	_,
	express,
	statusHandler,
	utils
) => {
	const app = express();

	app.use(statusHandler.middleware());

	const plugin = {
		use(...args) {
			return app.use(...args);
		},
		listen(...args) {
			app.use(utils.errorHandler()); // TODO: only bubble up safe errors

			return new Promise((resolve, reject) => {
				app.listen(...args, err => (err ? reject(err) : resolve({ success: true })));
			});
		},
		setState(newState) {
			statusHandler.setState(newState);
		}
	};

	return plugin;
});
