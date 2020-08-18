import { DEFAULT_ADMIN_ROLE } from '@modules/auth';

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
export default async function () {
  // await setAllCLP(); // Make all schemas master-only
}

async function setAllCLP() {

  function setMasterKeyOnlyCLP(schemas: Parse.Schema[]): Parse.Schema[] {
    const acl = { [`role:${DEFAULT_ADMIN_ROLE}`]: true };
    const adminOnly = {
      find: acl,
      get: acl,
      count: acl,
      create: acl,
      update: acl,
      delete: acl,
      addField: acl,
      readUserFields: [],
      writeUserFields: []
    };
    return schemas.map((schema: any) => {
      schema.setCLP(adminOnly);
      return schema;
    });
  }

  try {
    let schemas = await Parse.Schema.all();
    schemas = schemas.map((s: any) => new Parse.Schema(s.className));
    schemas = setMasterKeyOnlyCLP(schemas as Parse.Schema[]);

    await Promise.all(
      schemas.map(s => tryUpdateSchema(s))
    );
  } catch (e) {
    console.warn(e);
  }
}

async function tryUpdateSchema(schema: Parse.Schema) {
  try {
    await schema.save();
  } catch (e) {
    try {
      await schema.update();
    } catch (e) {
      console.warn(e);
    }
  }
}
