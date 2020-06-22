/**
 * xiedacon created at 2020-06-06 15:34:35
 *
 * Copyright (c) 2020 xiedacon, all rights reserved.
 */

import { DistinctQuestion } from 'inquirer';

import Command from './lib/command'

export interface Boilerplate {
  name: string;
  dir: string;
  desc: string;
  visible: boolean;
  variables: Array<DistinctQuestion>;
  extend: string | Array<string>;
  files: Array<{ name: string, path: string }>;
}

export type BoilerplateConfig = ((command: Command) => Partial<Boilerplate>) | Partial<Boilerplate>;
