# Spd Cli

这是一个生成文档的工具，将依据指定目录下的md文件生成对应的html，支持文档开发阶段的预览和发布的构建。

## Features

- 基于[vitepress](https://vitepress.vuejs.org/) 的文档功能。

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

对于`build`命令支持了`-o`参数，支持指定文档存放目录。
- **-o, --output <dest>**
  - type: `string`
  - default: `docs`
## config

新建`.spd.js`文件或者`.spd.json`文件进行配置。配置项参考[vitepress config](https://vitepress.vuejs.org/),在配置项中如果进行主题配置了`themeConfig`优先走配置文件，如果配置文件中不存在则依据项目中指定的文件夹自动生成。

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
- 进行读取`.spd.js`文件或者`.spd.json`文件生成配置文件。
  - 针对于用户自定义配置的配置直接保留。
  - 生成配置文件中`themeConfig`中的配置，根据文件夹结构和md文件中的`h1`标题生成目录结构。

## Warn Notice

- 目前`spd`只做了对`md`文件和相对路径的图的解析，暂时还不支持其他hbs文件等。