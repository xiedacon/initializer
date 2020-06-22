/**
 * xiedacon created at 2020-06-06 15:37:43
 *
 * Copyright (c) 2020 xiedacon, all rights reserved.
 */
'use strict';

const path = require('path');
const { execSync } = require('child_process');

/**
 *
 * @param {string} field
 */
function gitConfig(field) {
  try {
    return execSync(`git config ${field}`, { encoding: 'utf8' }).slice(0, -1);
  } catch (err) {
    return '';
  }
}

/** @type {import('../../../index').BoilerplateConfig} */
module.exports = command => ({
  visible: false,
  variables: [
    {
      name: 'name',
      message: 'program name',
      validate: Boolean,
      default: () => path.basename(command.targetDir),
    },
    {
      name: 'desc',
      message: 'program description',
    },
    {
      name: 'author',
      message: 'program author',
      default: gitConfig('user.name'),
    },
    {
      name: 'email',
      message: 'program author\'s email',
      default: gitConfig('user.email'),
    },
  ],
});
