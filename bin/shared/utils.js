const execSync = require('child_process').execSync;

export const exec = (cmd) => {
  const options = {
    encoding: 'utf8'
  };

  return execSync(cmd, options);
};
