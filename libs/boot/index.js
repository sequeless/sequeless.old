/* global Promise */
'use strict';

const _ = require('lodash');
const path = require('path');
const rjs = require('requirejs');

module.exports = function mvp(argv) {

	const settings = _.defaultsDeep(argv, {});

	const { overrides, extensions } = settings;

	const mapOverrides = overrides
		? overrides
		: {};

	const map = _.defaultsDeep({}, mapOverrides, {
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
	rjs.config({ map, baseUrl: __dirname });

	return rjs;
};
