const del = require('del');
const fse = require('fs-extra');
const { src, dest } = require('gulp');
const { spawn } = require('child_process');
const resolveBin = require('resolve-bin');
const { DEFAULT_MODE,  defaultDistDir} = require('../config/constants')
const path = require('path');

function getModeAndParams(params) {
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

function cleanAll() {
  del.sync(defaultDistDir);
}
exports.cleanAll = cleanAll;

function copyMd(srcPath) {
  src(`${srcPath}/**/*.md`).pipe(dest('.docs'));
}
exports.copyMd = copyMd;

function copyPicture(srcPath, done = () => ({})) {
  src(`${srcPath}/**/*.{png,jpg,gif}`).pipe(dest('.docs'));
  done();
}
exports.copyPicture = copyPicture;

function isMdFile(fullPath = '',) {
  const stat = fse.lstatSync(fullPath);
  if (stat.isFile() && path.extname(fullPath) === '.md') {
    return true;
  }
  return false;
}
exports.isMdFile = isMdFile;

function hasMdFile(src = 'src') {
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

function searchMainMdFileName(src) {
  const dirs = fse.readdirSync(src);
  let mdFile = '';
  let mainMdFileName = dirs.find(item => item === 'index.md' || item === 'README.md')
  if (mainMdFileName === 'README.md') mainMdFileName = 'index.md';
  if (mainMdFileName) return mainMdFileName;
  const findResult = dirs.find(fileName => isMdFile(`${src}/${fileName}`));
  if (findResult) return findResult;
  for (let index = 0; index < dirs.length; index++){
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

function execBin(packageName, args, options = {}) {
  const binPath = resolveBin.sync(packageName, { executable: packageName });
  spawn('node', ['--max_old_space_size=4096', binPath].concat(args), {
    stdio: (_c = options.stdio) !== null && _c !== void 0 ? _c : 'inherit',
    shell: process.platform === 'win32'
  })
}
exports.execBin = execBin;
