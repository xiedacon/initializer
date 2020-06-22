/**
 * xiedacon created at 2020-05-17 17:14:12
 *
 * Copyright (c) 2020 xiedacon, all rights reserved.
 */
'use strict';

require('colors');

const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const yargs = require('yargs');
const inquirer = require('inquirer');
const { mkdirp } = require('mz-modules');
const glob = require('glob');
const isTextOrBinary = require('istextorbinary');
const template = require('art-template');

module.exports = class Command {
  constructor() {
    this.inquirer = inquirer;
    this.yargs = yargs
      .usage('init program from boilerplate.\nUsage: $0 [dir] --type=javascript')
      .options({
        boilerplate: {
          type: 'string',
          description: 'boilerplate name',
        },
        dir: {
          type: 'string',
          description: 'target directory',
        },
      })
      .alias('h', 'help')
      .version()
      .help();
  }

  /**
   *
   * @param {string} cwd
   * @param {Array<string>} args
   */
  async run(cwd, args) {
    this.cwd = cwd;
    this.argv = this.yargs.parse(args);

    this.boilerplates = await this.loadBoilerplates();
    this.targetDir = await this.getTargetDir();
    this.boilerplate = await this.askForBoilerplate();
    this.variables = await this.askForVariables();

    await this.processFiles();
  }

  async getTargetDir() {
    let dir = this.argv._[0] || this.argv.dir || '';

    /**
     *
     * @param {string} dir
     */
    const validate = dir => {
      if (!fs.existsSync(dir)) {
        mkdirp.sync(dir);
        return true;
      }

      if (!fs.statSync(dir).isDirectory()) {
        return `${dir} already exists as a file`.red;
      }

      const files = fs.readdirSync(dir).filter(name => name[0] !== '.');
      if (files.length > 0) {
        return `${dir} already exists and not empty: ${JSON.stringify(files)}`.red;
      }

      return true;
    };

    if (validate(path.resolve(this.cwd, dir)) !== true) {
      const answer = await this.inquirer.prompt({
        name: 'dir',
        message: 'Please enter target dir: ',
        default: dir || '.',
        type: 'input',
        validate,
      });

      dir = answer.dir;
    }

    return path.resolve(this.cwd, dir);
  }

  async askForBoilerplate() {
    const boilerplateName = this.boilerplates[this.argv.boilerplate]
      ? this.argv.boilerplate
      : await (async () => {
        const answers = await inquirer.prompt({
          name: 'boilerplate',
          type: 'list',
          message: 'Please select a boilerplate',
          choices: Object.values(this.boilerplates).filter(b => b.visible).map(b => ({ name: [ b.name, b.desc ].filter(Boolean).join(' - '), value: b.name })),
        });

        return answers.boilerplate;
      })();

    return await this.mergeBoilerplate(this.boilerplates[boilerplateName]);
  }

  /**
   *
   * @param {import('../index').Boilerplate} boilerplate
   */
  async mergeBoilerplate(boilerplate) {
    const newBoilerplate = _.cloneDeep(boilerplate);

    if (newBoilerplate.extend) {
      const extend = Array.isArray(newBoilerplate.extend)
        ? newBoilerplate.extend
        : [ newBoilerplate.extend ];

      let parentVariables = [];
      let parentFiles = [];
      for (const name of extend) {
        const boilerplate = this.boilerplates[name];
        if (!boilerplate) continue;

        const parent = await this.mergeBoilerplate(boilerplate);

        parentVariables = parentVariables.concat(parent.variables);
        parentFiles = parent.files.concat(parentFiles);
      }

      newBoilerplate.variables = parentVariables.concat(newBoilerplate.variables);
      newBoilerplate.files = _.unionBy(newBoilerplate.files, parentFiles, 'name');
    }

    return newBoilerplate;
  }

  async loadBoilerplates() {
    const globalBoilerplatePath = `${process.env.HOME}/.initializer/boilerplates`;
    const localBoilerplatePath = `${__dirname}/boilerplates`;
    if (!fs.existsSync(globalBoilerplatePath)) {
      mkdirp.sync(globalBoilerplatePath);
    }

    /** @type {{ [k: string]: import('../index').Boilerplate }} */
    const boilerplates = {};
    for (const file of [
      ...fs.readdirSync(globalBoilerplatePath).map(file => `${globalBoilerplatePath}/${file}`),
      ...fs.readdirSync(localBoilerplatePath).map(file => `${localBoilerplatePath}/${file}`),
    ]) {
      const boilerplate = await this.getBoilerplate(file);
      boilerplates[boilerplate.name] = boilerplate;
    }

    return boilerplates;
  }

  /**
   *
   * @param {string} file
   * @returns {Promise<import('../index').Boilerplate>}
   */
  async getBoilerplate(file) {
    let boilerplateConfig;
    try {
      boilerplateConfig = require(file);
    } catch (err) {
      try {
        boilerplateConfig = require(`${file}/_boilerplate`);
      } catch (err) {
        console.log(`Failed to get boilerplate from ${file}`);
        console.log(err);
      }
    } finally {
      if (typeof boilerplateConfig === 'function') {
        try {
          boilerplateConfig = await boilerplateConfig(this);
        } catch (err) {
          console.log(`Failed to get boilerplate from ${file}`);
          console.log(err);
        }
      }
    }

    const boilerplate = {
      name: path.parse(file).name,
      dir: file,
      desc: (boilerplateConfig && boilerplateConfig.desc) || '',
      visible: boilerplateConfig && (boilerplateConfig.visible !== undefined) ? boilerplateConfig.visible : true,
      variables: (boilerplateConfig && boilerplateConfig.variables) || [],
      extend: boilerplateConfig && boilerplateConfig.extend,
      files: ((boilerplateConfig && boilerplateConfig.files) || []).concat(
        fs.existsSync(file) && fs.statSync(file).isDirectory()
          ? glob.sync('**/*', {
            cwd: file,
            dot: true,
            nodir: true,
            ignore: [ '_boilerplate', '_boilerplate.js', '_boilerplate/**' ],
          }).map(name => ({ name, path: path.join(file, name) }))
          : []
      ),
    };

    return boilerplate;
  }

  async askForVariables() {
    return {
      ...this.argv,
      ...this.boilerplate.variables.length === 0
        ? {}
        : await inquirer.prompt(this.boilerplate.variables.filter(variable => this.argv[variable.name] === undefined)),
    };
  }

  async processFiles() {
    for (const file of this.boilerplate.files) {
      const from = file.path;
      const to = path.join(this.targetDir, this.replaceTemplate(file.name, this.variables));
      const content = fs.readFileSync(from);
      const fileStat = fs.statSync(from);

      // check if content is a text file
      const result = isTextOrBinary.isTextSync(from, content)
        ? this.replaceTemplate(content.toString('utf8'), this.variables)
        : content;

      mkdirp.sync(path.dirname(to));
      fs.writeFileSync(to, result, { mode: fileStat.mode });
    }
  }

  /**
   *
   * @param {string} content
   * @param {any} variables
   */
  replaceTemplate(content, variables) {
    return content.length === 0
      ? content
      : template.render(
        content,
        new Proxy(global, {
          get(target, key) {
            return key in variables ? variables[key] : target[key];
          },
        }),
        {
          imports: {
            boilerplate: this.boilerplate,
            command: this,
          },
        }
      );
  }

};
