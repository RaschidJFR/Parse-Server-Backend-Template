// Default Credentials for Admin
export const DEFAULT_ADMIN_ROLE = 'Admin';
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'admin';

export class Setup {

	/**
	 * Delete all objects an classes on the database
	 */
	static deleteDatabase(): Promise<string> {
		let log = '';
		console.warn('deleting database...');
		log += 'deleting database...\n';

		let allSchemas = [];
		return (Parse as any).Schema.all({ useMasterKey: true })
			.then(results => {
				console.log('got schemas');
				allSchemas = results;

				//  Purge all classes
				let getAllObjects: Parse.Promise<Parse.Object[]>[] = [];
				allSchemas.forEach(schema => {
					let className = schema.className as string;
					let query = new Parse.Query(className)
						.limit(Number.MAX_SAFE_INTEGER)
						.find({ useMasterKey: true });

					getAllObjects.push(query);
					console.log('\t%o', className);
				});

				return Promise.all(getAllObjects)
			})
			.then(results => {

				let allObjects: Parse.Object[] = [];
				results.forEach((array: Parse.Object[]) => {
					log += array.length > 0 ? array[0].className + ': ' + array.length + '\n' : '\n';
					allObjects = allObjects.concat(array);
				});

				return Parse.Object.destroyAll(allObjects, { useMasterKey: true });
			})
			.then(result => {
				console.warn('all classes purged');
				log += 'all classes purged\n';

				let deleteAllSchemas: Promise<any>[] = [];
				// allSchemas.forEach(schema => {

				// 	// Don't delete default classes
				// 	if (!(schema.className as string).includes('_'))
				// 		deleteAllSchemas.push(schema.delete({ userMasterKey: true }));
				// });

				return Promise.all(deleteAllSchemas);
			})
			.then(results => {
				console.warn('database has been deleted');
				log += 'database deleted\n';
				return log;
			})
	}

	/**
	 * Creates all needed schemas and default values for this application
	 * on the database.
	 */
	static initDatabase(): Parse.IPromise<string> {
		let log = '';
		let errors = [];
		return this.createAdminUser()
			.catch(error => {
				console.error(error);
				log += 'error: ' + (error as any).message + '\n';
				errors.push((error as any).message);
				return null;
			})
			.then(user => {
				log += 'Admin user created\n';
				this.createAdminRole(user);
			})
			.catch(error => {
				console.error(error);
				errors.push((error as any).message);
				log += 'error: ' + (error as any).message + '\n';
				return null;
			})
			.catch(error => {
				console.error(error);
				errors.push((error as any).message);
				log += 'error: ' + (error as any).message + '\n';
				return null;
			})
			.then(() => {
				if (errors.length > 0)
					throw (log);
				else
					return log;
			});
	}

	static createAdminRole(user: Parse.User) {
		console.log('create admin role');

		let acl = new Parse.ACL();
		acl.setPublicWriteAccess(false);
		acl.setPublicReadAccess(true);

		let role = new Parse.Role(DEFAULT_ADMIN_ROLE, acl);
		role.getUsers().add(user)
		return role.save(undefined, { useMasterKey: true });
	}

	static createAdminUser(): Parse.Promise<Parse.User> {
		console.log('create admin user');

		let admin = new Parse.User();

		return admin.save({
			username: DEFAULT_ADMIN_USERNAME,
			password: DEFAULT_ADMIN_PASSWORD
		}, {
				useMasterKey: true
			});
	}


	/**
	 * Defines cloud functions for setup
	 */
	static initCloudFunctions() {
		/**
		 * Delete all objects and classes in database
		 */
		Parse.Cloud.define('deleteDatabase', (request) => {
			if (!request.master) {
				throw ('unahtorized');
			}

			let log = '';
			return Setup.deleteDatabase()
				.then(resultLog => {
					log += resultLog;
					return Setup.initDatabase();
				})
				.then(resultLog => {
					log += resultLog;
					return { success: true, details: log };
				});
		});

		/**
		 * Create default objects
		 */
		Parse.Cloud.define('setupDatabase', (request) => {
			if (!request.master) throw ('unahtorized');

			return Setup.initDatabase();
		});
	}
}