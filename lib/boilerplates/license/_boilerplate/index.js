/**
 * xiedacon created at 2020-06-06 15:37:43
 *
 * Copyright (c) 2020 xiedacon, all rights reserved.
 */
'use strict';

const fs = require('fs');

/** @type {import('../../../../index').BoilerplateConfig} */
module.exports = command => ({
  visible: false,
  variables: [
    {
      /**
       * https://developer.github.com/v3/licenses/#get-all-commonly-used-licenses
       */
      name: 'license',
      type: 'list',
      message: 'program license ( Choose a License https://choosealicense.com/appendix/ )',
      choices: fs.readdirSync(`${__dirname}/licenses`),
      default: 'mit',
      filter: license => {
        command.boilerplate.files.push({ name: 'LICENSE', path: `${__dirname}/licenses/${license}` });

        return license;
      },
    },
  ],
});
