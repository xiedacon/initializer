'use strict';

const { Controller } = require('egg');

module.exports = class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }
};
