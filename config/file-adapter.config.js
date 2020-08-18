/**
 * Files Adapter: proxy (read-only) files from back4app
 * You need to install the package variation from `https://github.com/RaschidJFR/parse-server-fs-adapter.git#feature/http`
 * inside the parse-server directory:
 *
 * ```shell
 * $ cd `npm root -g`/parse-server
 * $ npm i https://github.com/RaschidJFR/parse-server-fs-adapter.git#feature/http
 * ```
 */

module.exports = function (appId) {
  return {
    module: '@parse/fs-files-adapter',
    options: {
      filesSubDirectory: `https://parsefiles.back4app.com/${appId}`
    }
  };
};
