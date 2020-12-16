// Default Credentials for Super Admin
export let DEFAULT_ADMIN_ROLE = 'SuperAdmin';

export class Auth {

  public static async createSuperAdmin(defaultAdminRoleName = DEFAULT_ADMIN_ROLE): Promise<Parse.Role> {
    console.log('create super admin role');
    DEFAULT_ADMIN_ROLE = defaultAdminRoleName;

    // Create SuperUser role
    const acl = new Parse.ACL();
    acl.setPublicWriteAccess(false);
    acl.setPublicReadAccess(true);

    const role = new Parse.Role(defaultAdminRoleName, acl);
    try {
      await role.save(null, { useMasterKey: true });
    } catch (e) {
      if (e.code === Parse.Error.DUPLICATE_VALUE) {
        console.log('SuperAdmin role already created');
      } else {
        console.warn('Could not create superuser role:' + e);
        throw e;
      }
    }

    return role;
  }

  /**
   * Returns default admin role
   */
  public static getAdminRole(): Promise<Parse.Role> {
    return new Parse.Query(Parse.Role)
      .equalTo('name', DEFAULT_ADMIN_ROLE)
      .first({ useMasterKey: true });
  }

  /**
   * Read/Write access for the owner and Read access for Admin.
   */
  public static getDefaultACL(owner: Parse.User): Parse.ACL {
    const acl = new Parse.ACL(owner);
    acl.setRoleReadAccess(DEFAULT_ADMIN_ROLE, true);
    return acl;
  }

  /**
   * Checks if a user is in the default admin role
   * @returns `true` if user is found on the default admin role
   * @deprecated Use `isUserInRole()` instead
   */
  public static getIsAdmin(user: Parse.User): Promise<boolean> {
    if (!user) { return Promise.resolve(false); }

    const username = user.getUsername();

    return new Promise((resolve, reject) => {

      this.getAdminRole()
        .then((role) => {
          return role.getUsers()
            .query()
            .equalTo('username', username)
            .first({ useMasterKey: true });
        })
        .then((usr) => {
          return (usr != null);
        })
        .then((response) => {
          resolve(response);
          return response;
        })
        .catch((error) => reject(error));
    });
  }

  /**
   * Read/Write access for the owner and Read access for public.
   */
  public static getPublicReadACL(owner: Parse.User | Parse.Role): Parse.ACL {

    const acl = new Parse.ACL(owner);
    acl.setPublicReadAccess(true);
    return acl;
  }

  /**
   * Read access only for Admin and optionally for the owner.
   */
  public static getReservedACL(owner?: Parse.User): Parse.ACL {
    const acl = new Parse.ACL();
    acl.setRoleReadAccess(DEFAULT_ADMIN_ROLE, true);

    if (owner instanceof Parse.User) {
      acl.setReadAccess(owner, true);
    }

    return acl;
  }

  /**
   * Assambles a query to find roles with the user in them and with 1-level nested roles in them.
   */
  public static getRoleQuery(user: Parse.User): Parse.Query<Parse.Role> {
    const queryRolesWithUserInThem = new Parse.Query(Parse.Role).equalTo('users', user.toPointer());
    const queryRolesWithRolesWithUserInThem = new Parse.Query(Parse.Role).matchesQuery('roles', queryRolesWithUserInThem);
    const queryRoles = Parse.Query.or(queryRolesWithUserInThem, queryRolesWithRolesWithUserInThem);
    return queryRoles;
  }

  /**
   * Inits cloud functions for auth module
   */
  public static initCloudFunctions() {

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
    Parse.Cloud.define('role:hasUser', (request: Parse.Cloud.FunctionRequest<{
      depth?: number
      role: Parse.Pointer,
      user: Parse.Pointer,
    }>) => {
      const params = request.params;

      const user = Parse.User.createWithoutData<Parse.User>(params.user.objectId);
      const role = Parse.Role.createWithoutData<Parse.Role>(params.role.objectId);

      return Auth.isUserInRole(user, role, params.depth);
    });
  }

  /**
   * Search recursively a user in a Role.
   * WARNING: This is an inefficient query for now.
   * @param depth Number of nested queries to go into. Default = `2`.
   */
  public static async isUserInRole(user: Parse.User, role: Parse.Role, depth = 2): Promise<boolean> {
    if (!user) { return false; }

    let isInRole = false;
    const found = await role.getUsers()
      .query()
      .equalTo('objectId', user.id)
      .first({ useMasterKey: true });

    if (found) {
      return true;
    } else {
      const roles = await role.getRoles().query().find({ useMasterKey: true });
      for (let i = 0; i < roles.length && i < depth; i++) {
        isInRole = await this.isUserInRole(user, roles[i], depth - 1);
        if (isInRole) { break; }
      }

      return isInRole;
    }
  }
}
