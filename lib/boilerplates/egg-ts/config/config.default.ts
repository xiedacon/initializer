
export default (appInfo: Egg.EggAppInfo) => {
  /**
   * built-in config
   */
  const config = {
    // use for cookie sign key, should change to your own and keep security
    keys: `${appInfo.name}_{{keys}}`,
    // add your middleware config here
    middleware: [],
  } as Egg.PowerPartial<Egg.EggAppConfig>;

  /**
   * user config
   */
  const userConfig = {
    // myAppName: 'egg',
  } as Egg.EggUserConfig;

  return {
    ...config,
    ...userConfig,
  };
};
