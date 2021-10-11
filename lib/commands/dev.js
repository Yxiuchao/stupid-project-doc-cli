const { watch } = require('gulp')
const fse = require('fs-extra');
const { docGenerate } = require('../../lib/doc-generator');
const { execBinSync } = require('../../lib/util/index');
const { resolve } = require('path');
const { defaultDistDir, cwd} = require('../../lib/config/constants.js')

module.exports = (sourceDir, options) => {
  sourceDir = resolve(cwd, sourceDir);
  const mdWatcher = watch(`${sourceDir}/**/*.md`, { ignoreInitial: true, cwd });
  mdWatcher.on('change', (srcPath) => {
    srcPath = resolve(cwd, srcPath);
    const targetPath = srcPath.replace(sourceDir, defaultDistDir);
    fse.copySync(srcPath, targetPath);
  })
  .on('add', (srcPath) => {
    srcPath = resolve(cwd, srcPath);
    const targetPath = srcPath.replace(sourceDir, defaultDistDir);
    fse.copySync(srcPath, targetPath);
  })
  .on('ready', async() => {
    await docGenerate(sourceDir, options);
    execBinSync('vitepress', ['dev', defaultDistDir]);
  });
  watch(`${sourceDir}/**/*.{png,jpg,gif}`, { ignoreInitial: true, cwd }, cb => copyPicture(sourceDir, cb));
}