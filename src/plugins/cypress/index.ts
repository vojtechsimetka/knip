import { hasDependency } from '../../util/plugin.js';
import type { IsPluginEnabledCallback } from '../../types/plugins.js';

// https://docs.cypress.io/guides/references/configuration

export const NAME = 'Cypress';

/** @public */
export const ENABLERS = ['cypress'];

export const isEnabled: IsPluginEnabledCallback = ({ dependencies }) => hasDependency(dependencies, ENABLERS);

export const ENTRY_FILE_PATTERNS = [
  'cypress.config.{js,ts,mjs,cjs}',
  'cypress/support/e2e.{js,jsx,ts,tsx}',
  'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  'cypress/plugins/index.js', // Deprecated since Cypress v10
];
