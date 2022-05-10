const { watch } = require('gulp');
const fse = require('fs-extra');
const { docGenerate } = require('../../lib/doc-generator');
const { execBinSync, copyPicture } = require('../../lib/util/index');
const { resolve } = require('path');
const { defaultDistDir, cwd } = require('../../lib/config/constants.js');

module.exports = (sourceDir, options) => {
	sourceDir = resolve(cwd, sourceDir); // 将参数解析为绝对路径
	const mdWatcher = watch(`${sourceDir}/**/*.md`, { ignoreInitial: true, cwd }); // 监听指定路径下是否有文件变化，以触发并执行任务
	mdWatcher.on('change', (srcPath) => {
		srcPath = resolve(cwd, srcPath); // 将路径片段解析成绝对路径
		const targetPath = srcPath.replace(sourceDir, defaultDistDir);
		fse.copySync(srcPath, targetPath);
	})
		.on('add', (srcPath) => {
			srcPath = resolve(cwd, srcPath);
			const targetPath = srcPath.replace(sourceDir, defaultDistDir);
			fse.copySync(srcPath, targetPath);
		})
		.on('ready', async () => {
			await docGenerate(sourceDir, options);
			execBinSync('vitepress', ['dev', defaultDistDir]);
		});
	watch(`${sourceDir}/**/*.{png,jpg,gif}`, { ignoreInitial: true, cwd }, cb => copyPicture(sourceDir, cb));
};
