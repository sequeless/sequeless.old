/* global define */
'use strict';

define([
	'lodash',
	'yargs'
], (_, { argv }) => {

	let settings = argv;

	function init(defaults) {

		// Provide defaults
		settings = _.defaultsDeep(argv, defaults);

		return get();
	}

	function get(path) {
		return path
			? _.get(settings, path)
			: _.cloneDeep(settings);
	}

	return {
		init, get
	};
});
