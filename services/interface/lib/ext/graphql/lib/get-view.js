/* globals define */
'use strict';

define([
	'express',
	'passport',
	'passport-anonymous',
	'-/ext/graphql/lib/get-config.js',
	'-/ext/graphql/lib/get-aggregate.js',
	'-/ext/graphql/lib/get-repository.js',
	'-/ext/graphql/lib/get-api.js'
], (
	{ Router },
	passport,
	AnonymousStrategy,
	getConfig,
	getAggregate,
	getRepository,
	getAPI
) => async function getView(args) {
	const config = await getConfig(args);
	const aggregate = getAggregate(config, args);
	const repository = getRepository(config, aggregate);

	const router = new Router();

	passport.use(new AnonymousStrategy());
	router.use(passport.initialize());
	router.use(getAPI({ aggregate, repository }));

	return router;
});
