const del = require('del');
const fse = require('fs-extra');
const fs = require('fs');
const { src, dest } = require('gulp');
const { spawnSync } = require('child_process');
const resolveBin = require('resolve-bin');
const { DEFAULT_MODE, defaultDistDir } = require('../config/constants');
const path = require('path');

function getModeAndParams (params) {
	const modeIndex = params.findIndex(item => item === '--mode');
	let mode = null;
	if (modeIndex !== -1) {
		if (params[modeIndex + 1]) {
			mode = params[modeIndex + 1];
			params.splice(modeIndex + 1, 1);
		} else {
			mode = DEFAULT_MODE;
		}
		params.splice(modeIndex, 1);
	} else {
		mode = DEFAULT_MODE;
	}
	return { mode, params };
}
exports.getModeAndParams = getModeAndParams;

/**
 * 将指定存放静态资源的目录全部删除
 */
function cleanAll () {
	del.sync(defaultDistDir);
}
exports.cleanAll = cleanAll;

function copyMd (srcPath) {
	return new Promise(resolve => {
		// src()方法，创建一个流，用于从文件系统读取元数据对象
		const stream = src(`${srcPath}/**/*.md`).pipe(dest('.docs'));
		stream.on('finish', () => resolve());
	});
}
exports.copyMd = copyMd;

function copyPicture (srcPath) {
	return new Promise(resolve => {
		const stream = src(`${srcPath}/**/*.{png,jpg,gif}`).pipe(dest('.docs'));
		stream.on('finish', () => resolve());
	});
}
exports.copyPicture = copyPicture;

/**
 * 判断指定path是否为.md文件
 * @param {String} fullPath 
 * @returns {Boolean}
 */
function isMdFile (fullPath = '',) {
	const stat = fse.lstatSync(fullPath);
	if (stat.isFile() && path.extname(fullPath) === '.md') {
		return true;
	}
	return false;
}
exports.isMdFile = isMdFile;

/**
 * 判断当前指定path是否为目录，或当前目录下是否包含.md文件
 * @param {String} src 
 * @returns {Boolean}
 */
function hasMdFile (src = 'src') {
	const dirs = fse.readdirSync(src);
	for (let index = 0; index < dirs.length; index++) {
		const dirName = dirs[index];
		const currentPath = `${src}/${dirName}`;
		const stat = fse.lstatSync(currentPath);
		if (stat.isDirectory()) {
			const result = hasMdFile(currentPath);
			if (result) return true;
		}
		if (isMdFile(currentPath)) return true;
	}
	return false;
}
exports.hasMdFile = hasMdFile;

/**
 * 查找指定path中的.md文件，返回对应的文件目录
 * 查找指定目录下的index.md文件作为文件夹的入口文件；
 * @param {String} src 
 * @returns {String}
 */
function searchMainMdFileName (src) {
	const dirs = fse.readdirSync(src);
	let mdFile = '';
	let mainMdFileName = dirs.find(item => item === 'index.md');
	if (mainMdFileName) return mainMdFileName;

	// 查找当前文件夹下是否包含.md文件；直接返回
	const findResult = dirs.find(fileName => isMdFile(`${src}/${fileName}`));
	if (findResult) return findResult;

	// 当前文件夹下没有.md文件，则递归查询；
	for (let index = 0; index < dirs.length; index++) {
		const dirName = dirs[index];
		const currentPath = `${src}/${dirName}`;
		const stat = fse.lstatSync(currentPath);
		if (stat.isDirectory() && hasMdFile(currentPath)) {
			mdFile += `${dirName}/`;
			const result = searchMainMdFileName(currentPath);
			if (result) return `${mdFile}${result}`;
		}
	}
}
exports.searchMainMdFileName = searchMainMdFileName;

// 仅查找指定目录下的index.md或readme.md文件作为目录的入口文件，不进行深层查询
function searchMainMdFile (path) {
	const dirs = fse.readdirSync(path);
	let mainMdFileName = dirs.find(item => item === 'index.md' || item === 'readme.md');
	// if (mainMdFileName) return mainMdFileName;
	return mainMdFileName;
}
exports.searchMainMdFile = searchMainMdFile;

function execBinSync (packageName, args, options = {}) {
	return new Promise(resolve => {
		const binPath = resolveBin.sync(packageName, { executable: packageName });
		spawnSync('node', ['--max_old_space_size=4096', binPath].concat(args), {
			stdio: (_c = options.stdio) !== null && _c !== void 0 ? _c : 'inherit',
			shell: process.platform === 'win32'
		});
		resolve();
	});
}
exports.execBinSync = execBinSync;

/**
 * 复制主题配置
 */
function copyTheme () {
	fse.copySync(path.resolve(__dirname, '../theme'), `${defaultDistDir}/.vitepress/theme`);
}
exports.copyTheme = copyTheme;

// 获取md文件中的h1标题内容，作为目录结构
function getHeaderContent (path) {
	const file = fs.readFileSync(path);
	const reg = /^#\s+(([\s\S])*?)[\r\n]/;
	return reg.exec(file)?.[1] || '';
}
exports.getHeaderContent = getHeaderContent;
