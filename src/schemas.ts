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
  // Your code here
}

async function tryUpdateSchema(schema: Parse.Schema) {
  try {
    await schema.save({ useMasterKey: true });
  } catch (e) {
    console.warn(e);
    try {
      await schema.update({ useMasterKey: true });
    } catch (e) {
      console.warn(e);
    }
  }
}
