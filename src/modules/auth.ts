// Default Credentials for Admin
export const DEFAULT_ADMIN_ROLE = 'Admin';
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'admin';

export class Auth {

	/**
	 * Checks if a user is in the default admin role
	 * @param username
	 * @returns true if user is found on the default admin role
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
	 * Defines cloud functions for auth module
	 */
	static initCloudFunctions() {
		/**
		 * Checks whether requesting user in the DRiskIt role or note.
		 * @returns {boolean}
		 */
		Parse.Cloud.define('amAdmin', (request) => {
			return Auth.getIsAdmin(request.user);
		});
	}

	static async isUserInRole(user: Parse.User, role: Parse.Role): Promise<boolean> {
		let isInRole = false;
		return role.getUsers().query().equalTo('objectId', user.id).first({ useMasterKey: true })
			.then(found => {
				if (found) {
					return true;
				} else {
					return role.getRoles().query().find({ useMasterKey: true })
						.then(async (roles) => {

							for (let i = 0; i < roles.length; i++) {
								const role = roles[i];
								isInRole = await this.isUserInRole(user, role);
								if (isInRole) break;
							}

							return isInRole;
						});
				}
			});
	}
}