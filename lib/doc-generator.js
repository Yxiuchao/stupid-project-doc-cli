const fse = require('fs-extra');
const { extname, basename, join } = require('path');
const { get } = require('lodash');
const chalk = require('chalk');
const path = require('path');
const {  cwd, CONFIG_FILE_NAME, defaultDistDir } = require('./config/constants.js');
const { copyMd, cleanAll, copyPicture, hasMdFile, searchMainMdFile, searchMainMdFileName, copyTheme, getHeaderContent } = require('./util/index');

/**
 *根据文件目录生成顶部导航栏配置，default模式下不生成顶部导航配置
 * @param {String} targetDir 
 * @returns 
 */
function generateNavConfig (targetDir = 'src') {
	// 读取指定目录的内容
	const dirs = fse.readdirSync(targetDir);
	return dirs.reduce((pre, dirName) => {
		const currentPath = `${targetDir}/${dirName}`;
		// 获取指定path的引用
		const stat = fse.lstatSync(currentPath);
		// 如果当前path是目录且包含.md文件
		if (stat.isDirectory() && hasMdFile(currentPath)) {
			let mainMdFileName = searchMainMdFileName(currentPath);
			const ignoreFileNameSuffix = (fileName) => fileName.replace('.md', '');
			pre.push({
				text: dirName, // 访问文件夹的入口文件
				link: `/${dirName}/${ignoreFileNameSuffix(mainMdFileName)}`,
				activeMatch: `^/${dirName}/`
			});
		}
		return pre;
	}, []);
}
/**
 * 生成侧边栏配置
 * @param {String} targetDir 
 * @returns 
 */

function generateSidebarConfig (targetDir = 'src') {
	const rootPath = '/';
	let sidebar = {};
	sidebar[rootPath] = genSidebar(targetDir);
	return sidebar;
}

/**
 * 根据.md文件名生成侧边栏目录结构
 * @param {String} dirPath 指定生成sidebar配置的根目录
 * @param {String} prefixRoutePath 前缀路由
 * @returns {Array}
 */
function genSidebar (dirPath, prefixRoutePath = '') { //src
	const sidebar = [];
	const dirNames = fse.readdirSync(dirPath, { encoding: 'utf-8' });
	dirNames.forEach(async dirName => {
		// 根据md文件中h1标题作为目录结构
		if (extname(dirName) === '.md') {
			const header = getHeaderContent(`${dirPath}/${dirName}`);
			const link = dirName.replace('.md', '');
			if (link !== 'index' || !prefixRoutePath) {
				sidebar.push({
					text: header || link,
					link: `${prefixRoutePath}/${link}`
				});				
			}
		} 
		const currentFilePath = join(dirPath, dirName);
		const fileStat = fse.lstatSync(currentFilePath);
		// 目录且包含入口文件，当前文件作为目录
		if (fileStat.isDirectory() && hasMdFile(currentFilePath)) {
			let config = {};
			const mainFileName = searchMainMdFile(currentFilePath);
			let header = '';
			if (mainFileName) {
				header = getHeaderContent(`${currentFilePath}/${mainFileName}`);

				const link = mainFileName.replace('.md', '');
				config.link = prefixRoutePath ? `${prefixRoutePath}/${dirName}/${link}` : `${dirName}/${link}`;
			}
			const preFixRoute = `${prefixRoutePath}/${dirName}`;
			config.text = header || dirName;
			config.children = genSidebar(currentFilePath, preFixRoute);
			sidebar.push(config);
		}
	});
	return sidebar;
}

/**
 * 生成config
 */
function generatorConfig (targetDir) {
	let config = {};
	// 工具配置支持.js和.json两种格式的文件；
	const spdJsConfigPath = path.join(cwd, `${CONFIG_FILE_NAME}.js`);
	const spdJsonConfigPath = path.join(cwd, `${CONFIG_FILE_NAME}.json`);
	if (fse.pathExistsSync(spdJsConfigPath)) {
		// 存在js文件
		config = require(spdJsConfigPath);
	} else if (fse.pathExistsSync(spdJsonConfigPath)) {
		config = fse.readJSONSync(spdJsonConfigPath);
	} else {
		console.log(chalk.yellow('warning >>>>>'), '缺少.spd.js文件或者.spd.json文件，可能会导致部署时静态资源加载失败');
	}
	let nav = get(config, 'themeConfig.nav', undefined),
		sidebar = get(config, 'themeConfig.sidebar', undefined);
	// 配置文件中没有指定nav或sidebar配置时，工具通过扫描.md文件生成
	nav = nav ? nav : generateNavConfig(targetDir);
	sidebar = sidebar ? sidebar : generateSidebarConfig(targetDir);
	config = Object.assign({}, config, { themeConfig: { nav, sidebar } });
	const target = `${defaultDistDir}/.vitepress/config.js`;
	fse.ensureFileSync(target);
	fse.writeFileSync(target, `module.exports=${JSON.stringify(config)}`, 'utf-8');
}


/**
 * 目录结构组织
 * @param {String} sourceDir src
 * @param {Object} object 
 */
async function docGenerate (sourceDir) {
	const sourceBaseName = basename(sourceDir); // 获取path中最后一部分的文件名及后缀
	cleanAll();
	copyTheme();
	await copyMd(sourceBaseName);
	await copyPicture(sourceBaseName);
	// DEFAULT_MODE模式会无法生成汇总的侧边导航目录，每个src下的目录是分散的；
	generatorConfig(sourceBaseName);
}
exports.docGenerate = docGenerate;
