'use strict';

const path = require('path');
const boot = require('@sequeless/boot');

const define = boot({
	extensions: path.join(__dirname, './lib/ext')
});

define([
	'-/ext/main.js'
], instance => {
	instance()
		.catch(err => {
			throw new Error(err);
		});
});
