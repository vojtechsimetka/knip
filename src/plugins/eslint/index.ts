import path from 'node:path';
import { ESLint } from 'eslint';
import { compact } from '../../util/array.js';
import { getPackageName } from '../../util/modules.js';
import { timerify } from '../../util/performance.js';
import { getDependenciesFromSettings } from './helpers.js';
import type { IsPluginEnabledCallback, GenericPluginCallback } from '../../types/plugins.js';
import type { ESLintConfig } from './types.js';

export const isEnabled: IsPluginEnabledCallback = ({ dependencies }) => {
  return dependencies.has('eslint');
};

export const CONFIG_FILE_PATTERNS = ['eslint.config.js', '.eslintrc', '.eslintrc.json', '.eslintrc.js'];

const resolvePluginPackageName = (pluginName: string) => {
  return pluginName.startsWith('@')
    ? pluginName.includes('/')
      ? pluginName
      : `${pluginName}/eslint-plugin`
    : `eslint-plugin-${pluginName}`;
};

const findESLintDependencies: GenericPluginCallback = async (configFilePath, { cwd }) => {
  if (path.basename(configFilePath) === 'eslint.config.js') {
    // New: https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new
    // We can handle eslint.config.js just like other source code (as dependencies are imported)
    // Alternatively, we could do the same as in legacy mode, but it would be less reliable and more maintenance
    return [];
  } else {
    // Legacy: https://eslint.org/docs/latest/user-guide/configuring/configuration-files
    // The only way to reliably resolve legacy configuration is through ESLint itself
    // This is also required when something like @rushstack/eslint-patch/modern-module-resolution is used

    const engine = new ESLint({ cwd, overrideConfigFile: configFilePath, useEslintrc: false });
    const jsConfig: ESLintConfig = await engine.calculateConfigForFile('__placeholder__.js');
    const tsConfig: ESLintConfig = await engine.calculateConfigForFile('__placeholder__.ts');
    const tsxConfig: ESLintConfig = await engine.calculateConfigForFile('__placeholder__.spec.tsx');

    const dependencies = [jsConfig, tsConfig, tsxConfig].map(config => {
      if (!config) return [];
      const plugins = config.plugins?.map(resolvePluginPackageName) ?? [];
      const parsers = config.parser ? [config.parser] : [];
      const extraParsers = config.parserOptions?.babelOptions?.presets ?? [];
      const settings = config.settings ? getDependenciesFromSettings(config.settings) : [];
      return [...parsers, ...extraParsers, ...plugins, ...settings].map(getPackageName);
    });

    return compact(dependencies.flat());
  }
};

export const findDependencies = timerify(findESLintDependencies);