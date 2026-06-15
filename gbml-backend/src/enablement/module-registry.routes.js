import { registerCustomModule, getCustomModule, listCustomModules, updateCustomModule, disableCustomModule, addContractsToCustomModule } from './module-registry.controller.js';

export function setupCustomModuleRoutes(app, writeLimiter) {
  app.post('/custom-modules', writeLimiter, registerCustomModule);
  app.post('/gbml/custom-modules', writeLimiter, registerCustomModule);

  app.get('/custom-modules/:moduleId', getCustomModule);
  app.get('/gbml/custom-modules/:moduleId', getCustomModule);

  app.get('/custom-modules', listCustomModules);
  app.get('/gbml/custom-modules', listCustomModules);

  app.put('/custom-modules/:moduleId', writeLimiter, updateCustomModule);
  app.put('/gbml/custom-modules/:moduleId', writeLimiter, updateCustomModule);

  app.delete('/custom-modules/:moduleId', disableCustomModule);
  app.delete('/gbml/custom-modules/:moduleId', disableCustomModule);

  app.post('/custom-modules/:moduleId/contracts', writeLimiter, addContractsToCustomModule);
  app.post('/gbml/custom-modules/:moduleId/contracts', writeLimiter, addContractsToCustomModule);
}
