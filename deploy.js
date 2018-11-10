const BUILD_PATH = './build/cloud';

const flags = require('node-flags');
const toB4A = flags.get('b4a');
const toSSH = flags.get('ssh');

if(!toB4A && !toSSH)
	throw ('Please choose an option to deploy to: `--b4a` or `--ssh`\n');

copyPackageDotJson();

if (toB4A)
	deployToBack4App(BUILD_PATH);
else if (toSSH)
	deployToSSH(BUILD_PATH);


function eslint(path) {

	const CLIEngine = require("eslint").CLIEngine;
	const cli = new CLIEngine();

	// lint myfile.js and all files in lib/
	let errorCount = 0;
	const report = cli.executeOnFiles([path]);
	report.results.forEach(file => {
		if (!file.filePath.includes('node_modules')) {
			console.log(`${file.filePath}`);

			file.messages.forEach(message => {

				const line = message.line;
				const col = message.column;
				const severity = message.severity > 1 ? '\x1b[31merror\x1b[0m' : '\x1b[33mwarning\x1b[0m';
				const msg = message.message;
				const rule = message.ruleId;

				console.log(`${line}:${col}\t${severity}\t${msg}\t${rule}\t${file.filePath}:${line}:${col}`);
				errorCount += severity > 1 ? 1 : 0;
			});
		}

	});

	const passed = errorCount < 1;
	console.log(`${passed ? '\x1b[32mlint passed\x1b[0m' : '\x1b[31mlint failed, ' + errorCount + ' errors\x1b[0m'}\n`);
	return passed;
}

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
			else console.log(`Created missing directory ${publicPath}`)
		});
	}

	// Upload using b4a.exe
	const { spawn } = require('child_process');
	const command = `b4a.exe`
	const args = `deploy`.split(' ');

	console.log(`\x1b[32m> ${command} ${args.join(' ')}\x1b[0m`);
	let child = spawn(command, args, { cwd: execPAth });

	child.stdout.on('data', (data) => {
		console.log(`${data}`);
	});

	child.stderr.on('data', (data) => {
		console.log(`\x1b[31m${data}\x1b[0m`);
	});

	child.on('close', (code) => {
		console.log(`\x1b[32mDone!: ${code}\x1b[0m\n`);
	});
}

function deployToSSH(localPath) {
	const config = getSSHConfig();
	const remotePath = config.remoteRoot;

	const fs = require('fs')
	const path = require('path')
	const node_ssh = require('node-ssh')
	const sshClient = new node_ssh()

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

function copyPackageDotJson() {
	console.log('copying package.json to ', BUILD_PATH);
	const fs = require('fs');
	let buffer = fs.readFileSync('package.json');
	let text = buffer.toString();
	let package = JSON.parse(text);

	// Modify Aliases to new path
	let moduleAlias = package._moduleAliases;
	if (moduleAlias) {
		Object.keys(moduleAlias).forEach(k => {

			let aliasPath = moduleAlias[k];
			aliasPath = aliasPath.replace(BUILD_PATH.replace('./', ''), '');
			aliasPath = aliasPath.indexOf('/') == 0 ? aliasPath.slice(1) : aliasPath;

			console.log('psackage.json: Rewriting alias %o => %o\n', moduleAlias[k], aliasPath);
			moduleAlias[k] = aliasPath;
		});
	}
	package._moduleAliases = moduleAlias;

	if (!fs.existsSync(BUILD_PATH)) {
		throw 'The build directory has not been created. Use `npm run deploy\n`'
	}
	fs.writeFileSync(`${BUILD_PATH}/package.json`, JSON.stringify(package, null, '\t'));
}

function getSSHConfig() {
	const SSH_OPTIONS_STRUCT = {
		localFolder: 'build',
		host: "yourhost.com",
		user: "user@yourhost.com",
		password: "********",
		remoteRoot: "/path/to/remote/folder",
		restartCommand: "sudo ./stop_parse & sudo ./start_parse"
	}

	const fs = require('fs');
	const configFileName = 'ssh-config.json';

	let data;
	try {
		data = fs.readFileSync(configFileName, 'utf8');
	} catch (err) {

		if (err.code == 'ENOENT') {
			console.error(`\x1b[31mThe file\x1b[33m %o \x1b[31mhas not been found in the root directory. Please create it using the following structure:\x1b[0m\n\n %s \n`,
				configFileName, JSON.stringify(SSH_OPTIONS_STRUCT, null, 2));

			process.exit();
		}

		throw err;
	}

	const config = JSON.parse(data);
	return config;
}