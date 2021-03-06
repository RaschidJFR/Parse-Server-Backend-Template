// Note: Make sure directory structure is ok
const Path = require('path');
const ROOT_FOLDER = Path.resolve(__dirname + '/..');
const BUILD_PATH = Path.resolve(ROOT_FOLDER + '/build/cloud');
const DATA_PUBLIC_PATH = Path.resolve(ROOT_FOLDER + '/assets');
const CONFIG_PATH = Path.resolve(ROOT_FOLDER + '/config/ssh.config.json');

const flags = require('node-flags');
const toB4A = flags.get('b4a');
const toSSH = flags.get('ssh');
const onlyPrepare = flags.get('only-prepare');

if (!toB4A && !toSSH)
  throw ('Please choose an option to deploy to: `--b4a` or `--ssh`\n');

copyPackageDotJson();

if (toB4A)
  deployToBack4App(BUILD_PATH);
else if (toSSH)
  deployToSSH(BUILD_PATH);


function deployToBack4App(filePath) {

  const Path = require('path');
  const execPAth = Path.resolve(filePath + '/..');
  const publicPath = Path.resolve(filePath + '/../public');
  filePath = Path.resolve(filePath);

  // Create `public` directory if missing
  const fs = require('fs');
  if (!fs.existsSync(`${filePath}\\..\\public`)) {

    var mkdirp = require('mkdirp');
    mkdirp(publicPath, function (err) {
      if (err) console.error(err)
      else console.log(`Created needed directory ${publicPath}`)
    });
  }

  // Copy content from `assets`
  copyDataPublicContent(DATA_PUBLIC_PATH, publicPath, () => {
    if (onlyPrepare) {
      console.log(`\x1b[32mDone!: ${0}\x1b[0m\n`);
      return;
    }

    // Upload using b4a.exe
    const { spawn } = require('child_process');
    const command = 'b4a'
    const args = 'deploy -f'.split(' ');

    console.log(`> ${command} ${args.join(' ')}`);
    let child = spawn(command, args, { cwd: execPAth });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('close', (code) => {
      if (code)
        console.log('\x1b[31mCould not upload!\x1b[0m\n')
      else
        console.log(`\x1b[32mDone!: ${code}\x1b[0m\n`);
    });

  });
}

function deployToSSH(localPath) {
  const Path = require('path');
  localPath = Path.resolve(localPath);

  const config = getSSHConfig();
  const remotePath = config.remoteRoot;

  const path = require('path');
  const node_ssh = require('node-ssh');
  const sshClient = new node_ssh();

  console.log('Connecting to ssh...');

  return sshClient.connect({
    host: config.host,
    username: config.user,
    password: config.password
  })
    .then(function () {
      console.log('Start transfer to remote path \x1b[33m%s\x1b[0m', remotePath);

      // Putting entire directories
      // let failed = [];
      // let successful = [];
      return sshClient.putDirectory(localPath, remotePath, {
        recursive: true,
        concurrency: 10,
        validate: function (itemPath) {
          const baseName = path.basename(itemPath)
          return baseName.substr(0, 1) !== '.' && // do not allow dot files
            baseName !== 'node_modules' // do not allow node_modules
        },
        tick: function (localItem, remoteItem, error) {
          if (error) {
            console.log('\x1b[31mfailed: %s\x1b[0m', localItem);
            // failed.push(`${localItem} => ${remoteItem}`);
          } else {
            console.log('\x1b[32msuccess: %s\x1b[0m', localItem);
            // successful.push(`${localItem} => ${remoteItem}`);
          }
        }
      })
    })
    .then(function (status) {
      console.log('the directory transfer was %s\n', status ? '\x1b[32msuccessful\x1b[0m' : '\x1b[31munsuccessful\x1b[0m');
      // console.log('successful: \x1b[32m%s\x1b[0m', successful.join('\n'));
      // console.log('failed: \x1b[30m%s\x1b[0m', failed.join('\n'));
    })
    .then(function () {
      if (config.restartCommand)
        return sshClient.execCommand(config.restartCommand)
      else
        return null
    })
    .then(function (result) {
      if (result) {
        console.log('STDOUT:\n\n' + result.stdout)
        console.log('\nSTDERR:\n\n' + result.stderr)
      }
      process.exit();
    })
    .catch(function (error) {
      console.log('\x1b[31mfailed: %s\x1b[0m', error);
      process.exit();
    });
}

function copyDataPublicContent(source, destination, callback) {
  const fs = require('fs');
  if (!fs.existsSync(source)) {
    callback();
  }

  console.log('copying %o to %s', 'assets', destination);
  const ncp = require('ncp').ncp;
  ncp.limit = 1;

  ncp(source, destination, function (err) {
    if (err) {
      return console.error(err);
    }
    callback();
  });
}

function copyPackageDotJson() {
  console.log('Copy package.json to ', BUILD_PATH);
  const fs = require('fs');
  let buffer = fs.readFileSync(ROOT_FOLDER + '/package.json');
  let text = buffer.toString();
  let pkg = JSON.parse(text);

  console.log('\nSearch and remove incompatible B4A dependencies...');

  // Remove parse-server
  if (pkg.devDependencies['parse-server']){
    console.log('Found parse-server in devDependencies. Remove.');
    delete pkg.devDependencies['parse-server'];
  } if (pkg.dependencies['parse-server']) {
    console.log('Found parse-server in Dependencies. Remove.');
    delete pkg.dependencies['parse-server'];
  }

  // Remove express
  if (pkg.devDependencies['express']) {
    console.log('Found express in devDependencies. Remove.');
    delete pkg.devDependencies.express;
  } if (pkg.dependencies['express']) {
    console.log('Found express in Dependencies. Remove.');
    delete pkg.dependencies.express;
  }

  // Modify Aliases to new path
  console.log('\nRewriting path aliases in package.json...');
  let moduleAlias = pkg._moduleAliases;
  if (moduleAlias) {
    Object.keys(moduleAlias).forEach(k => {

      let aliasPath = moduleAlias[k].replace(/^build\/cloud\/?/, '') || '.';
      aliasPath = aliasPath.indexOf('/') == 0 ? aliasPath.slice(1) : aliasPath;

      console.log('\t%s => %s', moduleAlias[k], aliasPath);
      moduleAlias[k] = aliasPath;
    });
  }
  pkg._moduleAliases = moduleAlias;

  if (!fs.existsSync(BUILD_PATH)) {
    throw new Error('Folder ' + BUILD_PATH + ' not found');
  }
  fs.writeFileSync(`${BUILD_PATH}/package.json`, JSON.stringify(pkg, null, '\t'));
}

function getSSHConfig() {
  const fs = require('fs');
  const Path = require('path');

  const SSH_OPTIONS_STRUCT = {
    localFolder: 'build',
    host: 'yourhost.com',
    user: 'user@yourhost.com',
    password: '********',
    remoteRoot: '/path/to/remote/folder',
    restartCommand: 'sudo ./stop_parse & sudo ./start_parse'
  }

  const configFileName = Path.resolve(CONFIG_PATH);

  let data;
  try {
    data = fs.readFileSync(configFileName, 'utf8');
  } catch (err) {

    if (err.code == 'ENOENT') {
      console.error('\x1b[31mThe file\x1b[33m %o \x1b[31mhas not been found in the root directory. Please create it using the following structure:\x1b[0m\n\n %s \n',
        configFileName, JSON.stringify(SSH_OPTIONS_STRUCT, null, 2));

      process.exit();
    }

    throw err;
  }

  const config = JSON.parse(data);
  return config;
}
