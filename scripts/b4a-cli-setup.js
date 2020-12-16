const flags = require('flags');
flags.defineString('key');
flags.defineString('project');
flags.defineBoolean('no-download');
flags.defineBoolean('download-only');
flags.parse();

const { spawn, execSync } = require('child_process');
const path = require('path');

const noDownload = flags.get('no-download');
const downloadOnly = flags.get('download-only');

function downloadCLI() {
  execSync('curl https://raw.githubusercontent.com/back4app/parse-cli/back4app/installer.sh | /bin/bash');
}

function setupAccountKey() {
  return new Promise((resolve, reject) => {

    const accountKey = flags.get('key');
    if (!accountKey) reject('Missing parameter: --key');
    console.log('Setup account key...');

    try {
      const child = spawn('b4a', ['configure', 'accountkey']);
      child.stdout.pipe(process.stdout);
      child.on('exit', resolve);
      child.on('error', reject);
      child.on('message', console.log);
      child.stdout.on('data', () => {
        child.stdin.write(accountKey + '\n');
      });
    } catch (e) {
      reject(e);
    }
  });
}

function setupProject() {
  return new Promise((resolve, reject) => {
    console.log('Setup project...');

    try {
      const predefinedInputs = ['e', '1', 'build', 'b'];
      let i = 0;

      const child = spawn('b4a', ['new']);
      child.stdout.pipe(process.stdout);
      child.on('exit', resolve);
      child.on('error', reject);
      child.on('message', console.log);
      child.stdout.on('data', () => {
        child.stdin.write(predefinedInputs[i] + '\n');
        process.stdout.write(predefinedInputs[i] + '\n');
        i++;
      });
    } catch (e) {
      reject(e);
    }
  });
}

function setDefaultApp() {
  return new Promise((resolve, reject) => {

    const projectName = flags.get('project');
    if (!projectName) reject('Missing parameter: --project');
    console.log('Set default app: "%s" ...', projectName);

    try {
      const cwd = path.join(__dirname, '../build');
      execSync(`b4a add "${projectName}"`, { cwd });

      const child = spawn('b4a', ['default', projectName], { cwd });
      child.stdout.pipe(process.stdout);
      child.on('exit', resolve);
      child.on('error', reject);
      child.on('message', console.log);
    } catch (e) {
      if (e.message.includes('has already been added')) {
        return resolve(0);
      }
      reject(e);
    }
  });
}

if (!noDownload) downloadCLI();
if (!downloadOnly) setupAccountKey()
  .then(() => {
    return setupProject();
  })
  .then(() => {
    return setDefaultApp();
  })
  .then(code => {
    if (code) console.error('Exit with error code ', code);
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
