'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.PowerPartial<Egg.EggAppConfig>}
   */
  const config = {
    // use for cookie sign key, should change to your own and keep security
    keys: `${appInfo.name}_{{keys}}`,
    // add your middleware config here
    middleware: [],
  };

  /**
   * user config
   * @type {Egg.EggUserConfig}
   */
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
