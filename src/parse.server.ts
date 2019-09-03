// This script avoids requiring the module `parse` on the server as
// it is implicit in the framework. This should be aliased as @parse
// in `tsconfig.json` and in the server's `package.json` in the property `_moduleAliases`
// used by the module [module-alias](https://www.npmjs.com/package/module-alias).

export default Parse;
