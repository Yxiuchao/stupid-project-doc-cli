const fse = require('fs-extra');
const { basename } = require('path');
const path = require('path');
const { DEFAULT_MODE,cwd, CONFIG_FILE_NAME,GEN_NAV_MODE, defaultDistDir} = require('./config/constants.js');
const { copyMd,cleanAll, copyPicture, hasMdFile, isMdFile, searchMainMdFileName } = require('./util/index')

/**
 * 
 * @param {String} targetDir 
 * @returns 
 */
function generateNavConfig(targetDir = 'src', mode) {
  if (mode === DEFAULT_MODE) return [];
  const dirs = fse.readdirSync(targetDir);
  return dirs.reduce((pre, cur) => {
    const currentPath = `${targetDir}/${cur}`;
    const stat = fse.lstatSync(currentPath);
    if (stat.isDirectory() && hasMdFile(currentPath)) {
      const mainMdFileName = searchMainMdFileName(currentPath);
      pre.push({
        text: cur,
        link: `/${cur}/${mainMdFileName}`
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
function generateSidebarConfig(targetDir = 'src', mode) {
  let sidebar = {};
  const dirs = fse.readdirSync(targetDir);
  const generatorItemConfig = (currentPath = '', result = [], suffix='/') => {
    const nameLists = fse.readdirSync(currentPath);
    nameLists.forEach(item => {
      const dirPath = `${currentPath}/${item}`;
      const stat = fse.lstatSync(dirPath);
      if (isMdFile(dirPath) && path.extname(dirPath) === '.md') {
        let visitPath = `${suffix}${currentPath.split('/').slice(1).join('/')}/`;
        if (!(item === 'index.md' || item === 'README.md')) {
          visitPath = visitPath + item;
        }
        result.push(visitPath);
      } else if (stat.isDirectory() && hasMdFile(dirPath)) {
        const dirSidebar = {
          title: item,
          children: []
        };
        result.push(dirSidebar);
        generatorItemConfig(dirPath, dirSidebar.children);
      }
    })
  }
  if (mode === DEFAULT_MODE) {
    sidebar['/'] = []
    generatorItemConfig(targetDir, sidebar['/'], '');
  } else {
    dirs.forEach(dirName => {
      const currentPath = `${targetDir}/${dirName}`;
      const stat = fse.lstatSync(currentPath);
      if (stat.isDirectory() && hasMdFile(currentPath)) {
        sidebar[`/${dirName}/`] = [];
        generatorItemConfig(currentPath, sidebar[`/${dirName}/`], '/');
      }
    });
  }
  return sidebar;
}

/**
 * 生成config
 */
function generatorConfig(targetDir, mode) {
  let config = {};
  const spdConfigPath = path.join(cwd, `${CONFIG_FILE_NAME}.js`);
  if (fse.pathExistsSync(spdConfigPath)) {
    // 存在js文件
    config = require(spdConfigPath);
  } else {
    config = fse.readJSONSync(path.join(cwd, `${CONFIG_FILE_NAME}.json`));
  }
  let result = {}, nav = [], sidebar= [];
  if (config.themeConfig && config.themeConfig.nav) {
    nav = config.themeConfig.nav;
  } else  {
    nav = generateNavConfig(targetDir, mode);
  }
  if (config.themeConfig && config.themeConfig.sidebar) {
    sidebar = config.themeConfig.sidebar;
  } else{
    sidebar = generateSidebarConfig(targetDir, mode);
  }
  result = Object.assign(result, config, {themeConfig: {nav, sidebar}})
  const target = `${defaultDistDir}/.vuepress/config.js`;
  fse.ensureFileSync(target);
  fse.writeFileSync(target, `module.exports=${JSON.stringify(result)}`, 'utf-8');
}

function docGenerate(sourceDir, { nav }) {
  sourceBaseName = basename(sourceDir);
  cleanAll();
  copyMd(sourceBaseName);
  copyPicture(sourceBaseName);
  generatorConfig(sourceBaseName, nav? DEFAULT_MODE : GEN_NAV_MODE);
}
exports.docGenerate = docGenerate;
