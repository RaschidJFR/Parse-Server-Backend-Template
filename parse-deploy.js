/**
 * This script verifies the cloud code with [ESLint](https://eslint.org/) and then uses the 
 * [Back4App CLI](https://docs.back4app.com/docs/integrations/command-line-interface/) to upload it to the hosting server.
 */

const PATH = './cloud_code/cloud';
if (lint(PATH))
	// deployToBack4App(PATH);
	// else
	console.log("\nFinished with errors\n");


function lint(path) {

	const CLIEngine = require("eslint").CLIEngine;
	const cli = new CLIEngine();

	// lint myfile.js and all files in lib/
	var report = cli.executeOnFiles([path]);
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
			});
		}

	});

	const passed = report.errorCount < 1;
	console.log(`${passed ? '\x1b[32mlint passed\x1b[0m' : '\x1b[33mlint failed\x1b[0m'}\n`);
	return passed;
}

function deployToBack4App(filePath) {

	const Path = require('path');
	filePath = Path.resolve(filePath);

	const fs = require('fs');
	if (!fs.existsSync(`${filePath}\\..\\public`)) {

		var mkdirp = require('mkdirp');
		mkdirp(`${filePath}\\..\\public`, function (err) {
			if (err) console.error(err)
			else console.log(`Created missing ${filePath}\\..\\public directory`)
		});
	}

	const { spawn } = require('child_process');
	const command = `b4a.exe`
	const args = `deploy`.split(' ');

	console.log(`\x1b[32m> ${command} ${args.join(' ')}\x1b[0m`);
	let child = spawn(command, args, { cwd: filePath });

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