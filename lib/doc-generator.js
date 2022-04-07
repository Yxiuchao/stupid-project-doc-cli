const fse = require('fs-extra');
const { extname, basename, join } = require('path');
const { get } = require('lodash');
const chalk = require('chalk');
const path = require('path');
const { DEFAULT_MODE, cwd, CONFIG_FILE_NAME, GEN_NAV_MODE, defaultDistDir} = require('./config/constants.js');
const { copyMd, cleanAll, copyPicture, hasMdFile, searchMainMdFileName, copyTheme } = require('./util/index');

/**
 * 
 * @param {String} targetDir 
 * @returns 
 */
function generateNavConfig (targetDir = 'src', mode) {
	if (mode === DEFAULT_MODE) return [];
	const dirs = fse.readdirSync(targetDir);
	return dirs.reduce((pre, dirName) => {
		const currentPath = `${targetDir}/${dirName}`;
		const stat = fse.lstatSync(currentPath);
		if (stat.isDirectory() && hasMdFile(currentPath)) {
			let mainMdFileName = searchMainMdFileName(currentPath);
			const ignoreFileNameSuffix = (fileName) => fileName.replace('.md', '');
			pre.push({
				text: dirName,
				link: `/${dirName}/${ignoreFileNameSuffix(mainMdFileName)}`,
				activeMatch: `^/${dirName}/`
			});
		}
		return pre;
	}, []);
}
/**
 * 生成sidebarconfig
 * @param {String} targetDir 
 * @returns 
 */

function generateSidebarConfig (targetDir = 'src', mode) {
	const rootPath = '/';
	let sidebar = {};
	if (mode === DEFAULT_MODE) {
		sidebar[rootPath] = genSidebar(targetDir);
	} else {
		sidebar = genSidebarInDepth(targetDir); 
	}
	return sidebar;
}
function genSidebar (dirPath, prefixRoutePath = '')  {
	const sidebar = [];
	const dirNames = fse.readdirSync(dirPath, { encoding: 'utf-8' });
	dirNames.forEach(dirName => {
		if (extname(dirName) === '.md') {
			const fileName = dirName.replace('.md', '');
			sidebar.push({
				text: fileName,
				link: `${prefixRoutePath}/${fileName}`
			});
		}
		const currentFilePath = join(dirPath, dirName);
		const fileStat = fse.lstatSync(currentFilePath);
		if (fileStat.isDirectory() && hasMdFile(currentFilePath)) {
			const preFixRoute = `${prefixRoutePath}/${dirName}`;
			sidebar.push({
				text: dirName,
				children: genSidebar(currentFilePath, preFixRoute)
			});
		}
	});
	return sidebar;
}
function genSidebarInDepth (targetDir = 'src') {
	const sidebar = {};
	const genDefaultDirSidebar = (dirName) => [{ text: dirName, children: [] }];
	const rootPathSidebar = genDefaultDirSidebar(targetDir);
	const dirs = fse.readdirSync(targetDir);
	dirs.forEach(dirName => {
		if (extname(dirName) === '.md') {
			const rootSideBar = rootPathSidebar[0].children;
			const fileName = dirName.replace('.md', '');
			rootSideBar.push({
				text: fileName,
				link: `/${fileName}`
			});
		}
		const currentPath = join(targetDir, dirName);
		const stat = fse.lstatSync(currentPath);
		if (stat.isDirectory() && hasMdFile(currentPath)) {
			const currentSiderbarKey = `/${dirName}/`;
			sidebar[currentSiderbarKey] = genDefaultDirSidebar(dirName);
			sidebar[currentSiderbarKey][0].children = genSidebar(currentPath, `/${dirName}`);
		}
	});
	sidebar['/'] = rootPathSidebar;
	return sidebar;
}

/**
 * 生成config
 */
function generatorConfig (targetDir, mode) {
	let config = {};
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
	nav = nav ? nav : generateNavConfig(targetDir, mode);
	sidebar = sidebar ? sidebar : generateSidebarConfig(targetDir, mode);
	config = Object.assign({}, config, { themeConfig: { nav, sidebar } });
	const target = `${defaultDistDir}/.vitepress/config.js`;
	fse.ensureFileSync(target);
	fse.writeFileSync(target, `module.exports=${JSON.stringify(config)}`, 'utf-8');
}


async function docGenerate (sourceDir, { nav }) {
	sourceBaseName = basename(sourceDir);
	cleanAll();
	copyTheme();
	await copyMd(sourceBaseName);
	await copyPicture(sourceBaseName);
	generatorConfig(sourceBaseName, nav ? DEFAULT_MODE : GEN_NAV_MODE);
}
exports.docGenerate = docGenerate;
