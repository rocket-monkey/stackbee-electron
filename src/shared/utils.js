import colors from 'colors';

const execSync = require('child_process').execSync;

export const exec = (cmd) => {
  const options = {
    encoding: 'utf8'
  };

  return execSync(cmd, options);
};

export const addSlashes = (str) => (
  (str + '').replace(/[\\"']/g, '\\$&').replace(/\  u0000/g, '\\0')
);

export const findArg = (argName) => {
  for (let i = 0, len = process.argv.length; i < len; i += 1) {
    if (process.argv[i].indexOf(argName) > -1) {
      return process.argv[i].split('=')[1];
    }
  }

  return null;
}
