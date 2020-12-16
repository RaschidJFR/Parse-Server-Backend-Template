type CLP<T extends Parse.Object> = Parse.Schema.CLP & {
  protectedFields: {
    '*'?: Extract<keyof T['attributes'], string>[];
    /**
     * @example
     * `['role:Admin']: ['field1', 'field2']`
     */
    [userIdOrRoleName: string]: Extract<keyof T['attributes'], string>[];
  };
};

/**
 * Setup up the database schemas on boot
 *
 * @example
 * const user = new Parse.Schema('_User')
 *  .addString('phone')
 *  .addString('name')
 *  .addBoolean('isAdmin');
 *
 *  await Promise.all([
 *    tryUpdateSchema(user)
 *  ]);
 */
export default async function() {
  try {
    // Write your code here
  } catch (e) {
    console.error(e);
  }
}

/** Apply same CLP to all opperations */
function applyCLP<T extends Parse.Object>(schema: Parse.Schema<T>, acl: Parse.Schema.CLPField) {
  const clp: Parse.Schema.CLP = {
    find: acl,
    get: acl,
    count: acl,
    create: acl,
    update: acl,
    delete: acl,
    addField: acl,
  };
  schema.setCLP(clp);
  return schema;
}

async function tryUpdateSchema(schema: Parse.Schema) {
  try {
    await schema.save();
  } catch (e) {
    try {
      await schema.update();
    } catch (e) {
      console.warn((schema as any).className, '-', e);  // tslint:disable-line
    }
  }
}
