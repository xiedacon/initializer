
import { app, assert } from 'egg-mock/bootstrap';

describe('test/app/controller/home.test.js', () => {
  it('should assert', () => {
    const pkg = require('../../../package.json');
    assert(app.config.keys.startsWith(pkg.name));
  });

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, egg-ts')
      .expect(200);
  });
});
