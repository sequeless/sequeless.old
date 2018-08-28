'use strict';

const r = require('rethinkdb');
const retryInterval = parseInt(process.env.RETRY_INTERVAL || '100', 10);
const retryMax = parseInt(process.env.RETRY_INTERVAL || '1000', 10);

let retryCount = 1;

connectAndSeed();

async function connectAndSeed() {
	try {
		const conn = await r.connect({
			host: process.env.HOST || 'rethinkdb',
			port: process.env.PORT || 28015,
			username: process.env.USERNAME || 'admin',
			password: process.env.PASSWORD
		});
		const domains = 'domains';

		await r.tableList().contains(domains)
			.do(tableExists => r.branch(tableExists, { tables_created: 0 }, r.tableCreate(domains))) // eslint-disable-line camelcase
			.run(conn);

		console.log('Seed Domains:', await seedDomain({ conn, table: domains })); // eslint-disable-line no-console

		const boundedContexts = 'boundedContexts';

		await r.tableList().contains(boundedContexts)
			.do(tableExists => r.branch(tableExists, { tables_created: 0 }, r.tableCreate(boundedContexts))) // eslint-disable-line camelcase
			.run(conn);

		console.log('Seed Bounded Contexts:', await seedBoundedContexts({ conn, table: boundedContexts })); // eslint-disable-line no-console
	} catch (err) {
		console.error('Error seeding:', err); // eslint-disable-line no-console
		setTimeout(connectAndSeed, Math.min(retryInterval * retryCount++, retryMax));
	}
}

function seedDomain({ conn, table }) {
	const id = '127.0.0.1';
	const auth0ClientId = process.env.AUTH0_CLIENT_ID;
	const auth0Domain = process.env.AUTH0_DOMAIN;

	return r
		.table(table)
		.get(id)
		.replace({
			id,
			version: 1,
			disableDefaultRoutes: false,
			routes: [
				{
					path: '^/$',
					view: `http://view/graphiql/auth0/0.0?api=/api/domain/0.0&auth0ClientId=${auth0ClientId}&auth0Domain=${auth0Domain}`
				},
				{
					path: '/assets',
					passthru: true,
					view: 'http://view/assets'
				},
				{
					path: '/api/domain/0.0',
					passthru: true,
					view: 'http://interface'
				}
			]
		})
		.run(conn);
}

function seedBoundedContexts({ conn, table }) {
	const id = '127.0.0.1/api';
	const domain = process.env.AUTH0_DOMAIN;

	return r
		.table(table)
		.get(id)
		.replace({
			id,
			version: 1,
			authentication: { // TODO: add scope
				auth0: {
					domain
				}
			},
			aggregates: {
				domain: {
					tags: {
						latest: '0.0.0',
						stable: '0.0.0'
					},
					versions: {
						'0.0': {
							inputEntities: {
								InputKeyValue: {
									methods: {
										key: {
											returnType: {
												name: 'String'
											}
										},
										value: {
											returnType: {
												name: 'String'
											}
										},
										type: {
											returnType: {
												name: 'String'
											}
										}
									}
								},
								InputDomainID: {
									methods: {
										id: {
											returnType: {
												name: 'ID'
											}
										}
									}
								},
								InputDomainPagination: {
									methods: {
										skip: {
											returnType: {
												name: 'Int'
											}
										},
										length: {
											returnType: {
												name: 'Int'
											}
										},
										direction: {
											returnType: {
												name: 'Int'
											}
										}
									}
								}
							},
							entities: {
								Meta: {
									methods: {
										current: {
											resolver: {
												uri: 'http://unix:/var/run/resolvers.sock:/get/0.0',
												config: {
													path: 'current'
												}
											},
											returnType: {
												name: 'String'
											}
										}
									}
								},
								User: {
									methods: {
										nickname: {
											resolver: {
												uri: 'http://unix:/var/run/resolvers.sock:/get/0.0',
												config: {
													path: 'nickname'
												}
											},
											returnType: {
												name: 'String'
											}
										},
										email: {
											resolver: {
												uri: 'http://unix:/var/run/resolvers.sock:/get/0.0',
												config: {
													path: 'email'
												}
											},
											returnType: {
												name: 'String'
											}
										}
									}
								},
								Repository: {
									methods: {
										name: {
											returnType: {
												name: 'String'
											}
										},
										uri: {
											returnType: {
												name: 'String'
											}
										}
									}
								},
								BoundedContext: {
									methods: {
										name: {
											returnType: {
												name: 'String'
											}
										}
									}
								},
								Entity: {
									methods: {
										name: {
											returnType: {
												name: 'String'
											}
										}
									}
								},
								Method: {
									methods: {
										name: {
											returnType: {
												name: 'String'
											}
										}
									}
								},
								Query: {
									methods: {
										name: {
											returnType: {
												name: 'String'
											}
										}
									}
								},
								Action: {
									methods: {
										name: {
											returnType: {
												name: 'String'
											}
										}
									}
								}
							},
							actions: {
								read: {
									resolver: {
										uri: 'http://repository/queries/read/0.0',
										config: {
											type: 'domains'
										}
									},
									params: {
										in: 'InputDomainID'
									}
								},
								add: {
									params: {
										in: 'InputDomainID'
									}
								},
								edit: {
									params: {
										in: 'InputKeyValue'
									},
									resolver: {
										uri: 'http://resolvers/utils/set/0.0'
									}
								},
								delete: {
									params: {
										in: 'InputDomainID'
									}
								}
							},
							methods: {
								meta: {
									resolver: {
										uri: 'http://unix:/var/run/resolvers.sock:/get/0.0',
										config: {
											path: 'meta'
										}
									},
									returnType: {
										name: 'Meta'
									}
								},
								user: {
									resolver: {
										uri: 'http://unix:/var/run/resolvers.sock:/get/0.0',
										config: {
											path: 'user'
										}
									},
									returnType: {
										name: 'User'
									}
								},
								name: {
									returnType: {
										name: 'String'
									}
								},
								entities: {
									returnType: {
										name: 'Entity',
										isCollection: true
									}
								},
								methods: {
									returnType: {
										name: 'Method',
										isCollection: true
									}
								},
								queries: {
									returnType: {
										name: 'Query',
										isCollection: true
									}
								},
								actions: {
									returnType: {
										name: 'Action',
										isCollection: true
									}
								}
							},
							queries: {
								browse: {
									resolver: {
										uri: 'http://repository/queries/browse/0.0',
										config: {
											type: 'domains'
										}
									},
									params: {
										in: 'InputDomainPagination'
									}
								},
								read: {
									resolver: {
										uri: 'http://repository/queries/read/0.0',
										config: {
											type: 'domains'
										}
									},
									params: {
										in: 'InputDomainID'
									}
								}
							},

							// reducers: {}, // TODO: use for showing result aggregates

							repository: 'default',
							rootEntity: 'domain',
							schemaVersion: '0.0'
						}
					}
				}
			},
			repositories: {
				default: {
					uri: 'http://repository/actions/commit/0.0' // TODO: define API for repositories and use https
				}
			}
		})
		.run(conn);
}
