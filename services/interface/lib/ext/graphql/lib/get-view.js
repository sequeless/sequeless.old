/* globals define */
'use strict';

define([
	'lodash',
	'express',
	'passport-jwt',
	'request',
	'-/logger/index.js',
	'-/ext/graphql/lib/get-config.js',
	'-/ext/graphql/lib/get-aggregate.js',
	'-/ext/graphql/lib/get-repository.js',
	'-/ext/graphql/lib/get-api.js'
], (
	_,
	{ Router },
	{ ExtractJwt },
	request,
	logger,
	getConfig,
	getAggregate,
	getRepository,
	getAPI
) => async function getView(args) {
	const config = await getConfig(args);
	const aggregate = getAggregate(config, args);
	const repository = getRepository(config, aggregate);

	const router = new Router();

	const auth0Domain = _.get(config, 'authentication.auth0.domain');

	// TODO: move into an extension
	if (auth0Domain) {
		router.use((req, res, next) => {
			const bearer = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

			request({
				url: `https://${auth0Domain}/userinfo`,
				auth: { bearer }
			}, (err, resp, body) => {
				if (!err && resp.statusCode === 200) {
					req.user = JSON.parse(body);
					logger.debug('user', { user: req.user });
				}

				next();
			});

		});
	}
	router.use(getAPI({ aggregate, repository }));

	return router;
});
