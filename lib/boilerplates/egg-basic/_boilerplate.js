/**
 * xiedacon created at 2020-06-06 15:37:43
 *
 * Copyright (c) 2020 xiedacon, all rights reserved.
 */
'use strict';

/**
 *
 * @param {number} start
 * @param {number} end
 */
function random(start, end) {
  return Math.floor(Math.random() * (end - start) + start);
}

/** @type {Partial<import('../../../index').BoilerplateConfig>} */
module.exports = {
  visible: false,
  variables: [
    {
      name: 'keys',
      desc: 'cookie security keys',
      default: Date.now() + '_' + random(100, 10000),
    },
  ],
};
