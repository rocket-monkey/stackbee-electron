export default () => {
  console.log(`
usage: sbm <command> <subcommand> [parameters]

possible commands:

- ecs [create name=<name>] kill name=<name>]
- sbusr [create name=<name> domain=<domain> email=<email> pw=<password>] [kill email=<email>]
- cron [users task=owncloud]

  `);
}