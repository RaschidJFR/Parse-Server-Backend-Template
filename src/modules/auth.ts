import { DEFAULT_ADMIN_ROLE } from "./setup";

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
	static getAdminRole(): Parse.IPromise<Parse.Role> {
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
}