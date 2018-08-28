/* globals define */
'use strict';

define([
	'lodash',
	'express',
	'passport-jwt',
	'request',
	'dataloader',
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
	DataLoader,
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

	// TODO: refactor and move into an extension
	if (auth0Domain) {
		const userLoader = new DataLoader(keys => Promise.all(_.map(keys, bearer => new Promise((resolve, reject) => {
			request({
				url: `https://${auth0Domain}/userinfo`,
				auth: { bearer }
			}, (err, resp, body) => {
				if (!err && resp.statusCode === 200) {
					const user = JSON.parse(body);

					return resolve(user);
				}

				return reject(err);
			});
		}))));

		router.use((req, res, next) => {
			const bearer = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

			userLoader.load(bearer).then(user => {
				logger.debug('user', { user });
				req.user = user;

				next();
			}, () => {
				next();
			});
		});
	}
	router.use(getAPI({ aggregate, repository }));

	return router;
});
