#!/usr/bin/env node

const commander = require('commander'); // 一个npm包，一种处理命令行交互的解决方案
const program = new commander.Command(); // 声明program变量，用于执行提供的命令
program
	.version(require('../package.json').version) // 设置版本，在命令行中会输出当前包的版本
	.usage('<command>'); // 定制使用描述，使用help时进行提示

program
	.command('dev <sourceDir>') // 定义子命令
	.description('start development server') // 命令描述，在使用-h（--help）时显示命令的描述信息
	.option('-n, --no-nav', 'not automatically generate navigation') // 参数，使用该方法时，在help中存在[options]，可选
	.action((...args) => { // handler中传入参数为命令定义、执行时传入的options，以及该命令对象本身；此处可获得src、-n 等
		require('../lib/commands/dev.js')(...args); // 该命令运行时的操作
	});

program
	.command('build <sourceDir>')
	.description('build dir as static site')
	.option('-n, --no-nav', 'not automatically generate navigation') // 不会自动生成顶部导航
	.option('-o, --output <outputDir>', 'product output target loaction', 'docs') // 指定文档存放的目标目录
	.action((...args) => {
		require('../lib/commands/build.js')(...args);
	});

program.parse(process.argv);
