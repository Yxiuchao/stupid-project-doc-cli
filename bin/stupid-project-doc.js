#!/usr/bin/env node

const commander = require('commander');
const program = new commander.Command();
program
  .version(require('../package.json').version)
  .usage("<command>")

program
  .command('dev <sourceDir>')
  .description('start development server')
  .option('-n, --no-nav', 'not automatically generate navigation')
  .action((...args) => {
    require('../lib/commands/dev.js')(...args);
  })

program
  .command('build <sourceDir>')
  .description('build dir as static site')
  .option('-n, --no-nav', 'not automatically generate navigation')
  .option('-o, --output <outputDir>', 'product output target loaction', 'docs')
  .action((...args) => {
    require('../lib/commands/build.js')(...args);
  });

program.parse(process.argv);