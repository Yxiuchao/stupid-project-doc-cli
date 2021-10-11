const fse = require('fs-extra');
const { docGenerate } = require('../../lib/doc-generator');
const { execBinSync } = require('../../lib/util/index');
const { resolve } = require('path');
const { defaultDistDir, cwd} = require('../../lib/config/constants.js')

module.exports = async (sourceDir, options) => {
  sourceDir = resolve(cwd, sourceDir);
  await docGenerate(sourceDir, options);
  await execBinSync('vitepress', ['build', defaultDistDir]);
  fse.move(resolve(cwd, defaultDistDir, '.vitepress/dist'), options.output, {
    overwrite: true
  });
}