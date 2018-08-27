/* global Promise */
'use strict';

const _ = require('lodash');
const path = require('path');
const rjs = require('requirejs');

module.exports = function bootstrap(options) {

	const settings = _.defaults(options, {});

	const { overrides, extensions } = settings;

	const map = _.defaultsDeep({}, overrides ? overrides : {}, {
		'*': {
			'-': path.join(__dirname, 'lib')
		}
	}, {
		'*': {
			'-/ext': extensions
		}
	});

	// Leverage AMD for the plugin architecture
	// We'll be using the `overrides` to re-map the implementation of internal dependencies
	rjs.config({ map });

	return rjs;
};
