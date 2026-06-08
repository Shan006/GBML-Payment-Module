import { registerCustomModule, getCustomModule, listCustomModules, updateCustomModule, disableCustomModule } from './module-registry.controller.js';

/**
 * Custom Module Registry Routes
 * Handles registration and management of custom module definitions
 */
export function setupCustomModuleRoutes(app) {
  // Register a new custom module definition
  app.post('/custom-modules', registerCustomModule);

  // Get a specific custom module definition
  app.get('/custom-modules/:moduleId', getCustomModule);

  // List all custom modules (with optional filters)
  app.get('/custom-modules', listCustomModules);

  // Update a custom module definition
  app.put('/custom-modules/:moduleId', updateCustomModule);

  // Disable a custom module definition
  app.delete('/custom-modules/:moduleId', disableCustomModule);
}
