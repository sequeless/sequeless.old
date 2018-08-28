/* globals define */
'use strict';

define([
	'lodash',
	'express',
	'jwks-rsa',
	'jsonwebtoken',
	'passport',
	'passport-jwt',
	'passport-anonymous',
	'-/logger/index.js',
	'-/ext/graphql/lib/get-config.js',
	'-/ext/graphql/lib/get-aggregate.js',
	'-/ext/graphql/lib/get-repository.js',
	'-/ext/graphql/lib/get-api.js'
], (
	_,
	{ Router },
	jwksRsa,
	passportJwt,
	passport,
	{ Strategy: JwtStrategy, ExtractJwt },
	{ Strategy: AnonymousStrategy },
	logger,
	getConfig,
	getAggregate,
	getRepository,
	getAPI
) => async function getView(args) {
	const config = await getConfig(args);
	const { authentication } = config || {};
	const aggregate = getAggregate(config, args);
	const repository = getRepository(config, aggregate);

	const router = new Router();

	function getJwtStrategy(options) {
		const defaults = {
			secretOrKeyProvider,
			algorithms: ['RS256'],
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			verifyCallback: (payload, done) => done(null, payload)
		};
		const settings = _.defaultsDeep(options, defaults);

		return new JwtStrategy(settings, settings.verifyCallback);
	}

	function secretOrKeyProvider(req, rawJwtToken, cb) {
		const { header } = passportJwt.decode(rawJwtToken, { complete: true }) || {};

		const { jwksUri } = authentication || {};
		const client = jwksRsa({
			cache: true,
			rateLimit: true,
			jwksRequestsPerMinute: 5,
			jwksUri
		});

		const notRSA = !header || header.alg !== 'RS256';

		if (notRSA) {
			return cb(null, null);
		}

		const handler = getSigningKeyCallback(cb);

		return client.getSigningKey(header.kid, handler);
	}

	function getSigningKeyCallback(cb) {
		return (err, key) => cb(null, (err || !key) ? null : (key.publicKey || key.rsaPublicKey));
	}

	// TODO: move into an extension
	if (authentication) {
		passport.use(getJwtStrategy());
		passport.use(new AnonymousStrategy());
		router.use(passport.initialize());
		router.use(passport.authenticate(['jwt', 'anonymous'], { session: false }));
		router.use((req, res, next) => {
			logger.debug('user', { user: req.user });
			next();
		});
	}
	router.use(getAPI({ aggregate, repository }));

	return router;
});
