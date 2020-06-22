#!/usr/bin/env node

/**
 * xiedacon created at 2020-05-17 17:13:19
 *
 * Copyright (c) 2020 xiedacon, all rights reserved.
 */
'use strict';

const Command = require('../lib/command')

;(async () => {
  await new Command().run(process.cwd(), process.argv.slice(2));
})().catch(err => {
  console.error(err.stack);
  process.exit(1);
});
