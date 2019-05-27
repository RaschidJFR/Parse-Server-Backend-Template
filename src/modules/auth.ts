// Default Credentials for Admin
export const DEFAULT_ADMIN_ROLE = 'SuperUser';

export class Auth {

	static async createSuperUser(credentials: { username: string, password: string }): Promise<Parse.User> {
		console.log('create super user');

		// Create user
		const user = await new Parse.User()
			.save({
				username: credentials.username,
				password: credentials.password
			}, { useMasterKey: true });


		// Create SuperUser role
		let acl = new Parse.ACL();
		acl.setPublicWriteAccess(false);
		acl.setPublicReadAccess(true);

		let role = new Parse.Role(DEFAULT_ADMIN_ROLE, acl);
		role.getUsers().add(user)
		await role.save(undefined, { useMasterKey: true });

		return user;
	}

	/**
	 * Checks if a user is in the default admin role
	 * @returns `true` if user is found on the default admin role
	 * @deprecated Use `isUserInRole()` instead
	 */
	static getIsAdmin(user: Parse.User): Promise<boolean> {
		if (!user) return Promise.resolve(false);

		const username = user.getUsername();

		return new Promise((resolve, reject) => {

			this.getAdminRole()
				.then(role => {
					return role.getUsers()
						.query()
						.equalTo('username', username)
						.first({ useMasterKey: true })
				})
				.then(usr => {
					return (usr != null);
				})
				.then(response => {
					resolve(response);
					return response;
				})
				.catch(error => reject(error));
		})
	}

	/**
	 * Returns default admin role
	 */
	static getAdminRole(): Promise<Parse.Role> {
		return new Parse.Query(Parse.Role)
			.equalTo('name', DEFAULT_ADMIN_ROLE)
			.first({ useMasterKey: true })
	}

	/**
	 * Read/Write access for the owner and Read access for Admin.
	 */
	static getDefaultACL(owner: Parse.User | Parse.Object): Parse.ACL {

		if (owner instanceof Parse.User) {
			let acl = new Parse.ACL(owner);
			acl.setRoleReadAccess(DEFAULT_ADMIN_ROLE, true);
			return acl;

		} else if (owner instanceof Parse.Object) {
			let user = owner.get('user');
			if (!user) throw 'No owner found';

			let acl = new Parse.ACL(user);
			acl.setRoleReadAccess(DEFAULT_ADMIN_ROLE, true);
			return acl;
		}
	}

	/**
	 * Read access only for Admin.
	 */
	static getReservedACL(): Parse.ACL {
		let acl = new Parse.ACL();
		acl.setRoleReadAccess(DEFAULT_ADMIN_ROLE, true);
		return acl;
	}

	/**
	 * Read/Write access for the owner and Read access for public.
	 */
	static getPublicReadACL(owner: Parse.User | Parse.Object): Parse.ACL {

		if (owner instanceof Parse.User) {
			let acl = new Parse.ACL(owner);
			acl.setPublicReadAccess(true);
			return acl;

		} else if (owner instanceof Parse.Object) {
			let user = owner.get('user');
			if (!user) throw 'No owner found';

			let acl = new Parse.ACL(user);
			acl.setPublicReadAccess(true);
			return acl;
		}
	}

	/**
	 * Search recursively a user in a Role
	 * @param depth Number of nested queries to go into. Default = `2`
	 */
	static async isUserInRole(user: Parse.User, role: Parse.Role, depth = 2): Promise<boolean> {
		if (!user) return false;

		let isInRole = false;
		const found = await role.getUsers()
			.query()
			.equalTo('objectId', user.id)
			.first({ useMasterKey: true })

		if (found) {
			return true;
		} else {
			const roles = await role.getRoles().query().find({ useMasterKey: true });
			for (let i = 0; i < roles.length && i < depth; i++) {
				const role = roles[i];
				isInRole = await this.isUserInRole(user, role, depth - 1);
				if (isInRole) break;
			}

			return isInRole;
		}
	}

	/**
	 * Inits cloud functions for auth module
	 */
	static initCloudFunctions() {

		/**
		 * Checks whether requesting user in the default role.
		 */
		Parse.Cloud.define('amAdmin', async (request) => {
			const user = request.user;
			const role = await this.getAdminRole();
			const result: boolean = await Auth.isUserInRole(user, role);
			return result;
		});

		/**
		 * Search recursively a user in a Role
		 * @param depth Number of nested queries to go into. Default = `2`
		 * @returns `boolean`
	   */
		Parse.Cloud.define('role:hasUser', request => {
			const params: {
				user: Parse.Pointer,
				role: Parse.Pointer,
				depth?: number
			} = request.params;

			const user = Parse.User.createWithoutData<Parse.User>(params.user.objectId);
			const role = Parse.Role.createWithoutData<Parse.Role>(params.role.objectId);

			return Auth.isUserInRole(user, role, params.depth)
		})
	}
}