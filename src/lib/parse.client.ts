// This script loads the module `parse` on the client as
// it is not implicit in the environment. This should be aliased as @parse
// in `tsconfig.json` and in server's `package.json` in the property `_moduleAliases`
// used by the module [module-alias](https://www.npmjs.com/package/module-alias).

// tslint:disable-next-line: import-blacklist
import * as _Parse from 'parse';
export default _Parse;
