/**
 * xiedacon created at 2020-06-06 15:37:43
 *
 * Copyright (c) 2020 xiedacon, all rights reserved.
 */
'use strict';

/** @type {Partial<import('../../../index').BoilerplateConfig>} */
module.exports = {
  extend: [ 'node', 'egg-basic' ],
  usage: command => {
    console.log([
      `> cd ${command.targetDir}`,
      '> npm install',
      '> npm run dev',
    ].join('\n'));
  },
};
