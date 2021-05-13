# Spd Cli

这是一个生成文档的工具，将依据指定目录下的md文件生成对应的html，支持文档开发阶段的预览和发布的构建。

## Features

- 基于[vuepress](https://vuepress.vuejs.org/) 的文档功能。

## Installation

Install `stupid-project-doc-cli` via yarn or npm.

```bash
$ yarn add stupid-project-doc-cli
```

or

```bash
$ npm i stupid-project-doc-cli
```

## Usage

```bash
$ spd <command> [options]

Commands:
	dev [sourceDir]    start development server
	build [sourceDir]  build `sourceDir` as static site 
```

## Command

目前只进行增加了`dev`命令和`build`命令，对于支持的命令行参数如下：

- **-n, --no-nav**
  - type: `boolean`
  - default: `true`
`-n`参数其实是`--no-nav`的简写，默认情况下不指定具体的值的时候不依据`sourceDir`下的一级文件夹生成对应的导航。

对于`dev`和`build`命令来说都支持`-n`参数，同时对于`build`命令来说增加了`-o`参数。
- **-o, --output <dest>**
  - type: `string`
  - default: `docs`
## config

新建`spd.json`文件进行配置。配置项参考[vuepress config](https://vuepress.vuejs.org/zh/config/),在配置项中如果进行主题配置了`themeConfig`优先走配置文件，如果配置文件中不存在则依据项目中指定的文件夹自动生成。

比如：

```json
{
  "dest": "docs",
  "themeConfig": {
    "nav": [
      { "text": "Home", "link": "/" },
      { "text": "Guide", "link": "/guide/" },
      { "text": "External", "link": "https://google.com" },
    ]
  }
}
```

## Generation rules

- 解析指定`sourceDir`进行**md**文件的解析，将对应的md文件和图片生成到指定的路径。
- 进行读取`spd.json`文件生成配置文件。
  - 针对于用户自定义配置的配置直接保留。
  - 生成配置文件中`themeConfig`中的配置。生成的标题规则为对应的文件目录名。

## Warn Notice

- `vuepress`中针对于`README.md`文件和`index.md`文件都会被识别为入口文件，所以请不要同一文件夹下同时存在这样两个文件。
- 目前`spd`只做了对`md`文件和相对路径的图的解析，暂时还不支持其他hbs文件等。