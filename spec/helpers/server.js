const path = require('path');
const parseServerPath = path.join(__dirname, '../../', 'node_modules', 'parse-server');
const parseServerModule = require(parseServerPath);


function start(config) {
  const ParseServer = parseServerModule.ParseServer;
  return ParseServer.start(config, () => {
    console.log('parse-server running on port 1337.');
  });
}
module.exports = {
  start,
  /** @returns Promise<void> */
  destroyAllDataPermanently: function() {
    if (process.env.DB) throw new Error('Will not destroy data on a remote database');
    return parseServerModule.TestUtils.destroyAllDataPermanently();
  }
};
