import { Auth } from './auth';

export class Setup {
  static callback: () => void;

  /**
	 * Override this class to setup your custom schemas
	 */
  protected static createSchemas(): Promise<any> {
    return Promise.resolve();
  }

  /**
	 * @param superuser If provided, a superuser will be created when setting up database
   * @param callback Function to call whenever database setup is executed
	 */
  static initCloudJobs(superuser?: { password: string, username: string, }, callback?: () => void) {
    this.callback = callback;
    /**
		 * Delete and setup all objects and classes in database
		 */
    Parse.Cloud.job('blankDatabase', (request) => {

      let log = '';
      return Setup.resetDatabase()
        .then(resultLog => {
          log += resultLog;
          return Setup.initDatabase(superuser);
        })
        .then(resultLog => {
          log += resultLog;
          request.message(log);
        });
    });

    Parse.Cloud.define('blankDatabase', request => {
      if (!request.master)
        throw new Error('Unauthorized');

      return Parse.Cloud.startJob('blankDatabase', {});
    });
  }

  /**
	 * Creates all needed schemas and default values for this application
	 * on the database.
	 */
  static async initDatabase(defaultSuperuserCredentials?: { password: string, username: string, }): Promise<string> {
    let log = '';
    let errors = [];

    if (defaultSuperuserCredentials) await Auth.createSuperUser(defaultSuperuserCredentials)
      .catch(error => {
        console.error(error);
        log += 'error: ' + (error as any).message + '\n';
        errors.push((error as any).message);
        return null;
      })


    log += 'Creating schemas\n'
    await this.createSchemas()
      .catch(error => {
        console.error(error);
        errors.push((error as any).message);
        log += 'error: ' + (error as any).message + '\n';
        return null;
      })

    if (errors.length > 0)
      throw (log);

    if (this.callback) this.callback();
    return log;
  }

  /**
	 * Delete all objects an classes on the database
	 */
  static resetDatabase(): Promise<string> {
    let log = '';
    console.warn('deleting database...');
    log += 'deleting database...\n';

    let allSchemas = [];
    return (Parse as any).Schema.all({ useMasterKey: true })
      .then(results => {
        console.log('got schemas');
        allSchemas = results;

        // Find all objetcs from all classes
        let getAllObjects: Promise<Parse.Object[]>[] = [];
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

        // Destroy all objects
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
      });
  }
}
