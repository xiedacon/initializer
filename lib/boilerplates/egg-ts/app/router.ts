
export default (app: Egg.Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);
};
