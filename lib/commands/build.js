const { docGenerate } = require('../../lib/doc-generator');
const { execBin } = require('../../lib/util/index');
const { resolve } = require('path');
const { defaultDistDir, cwd} = require('../../lib/config/constants.js')

module.exports = async (sourceDir, options) => {
  sourceDir = resolve(cwd, sourceDir);
  docGenerate(sourceDir, options);
  execBin('vuepress', ['build', defaultDistDir, '--dest', options.output]);
}