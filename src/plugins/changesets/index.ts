import load from '../../util/loader.js';
import { timerify } from '../../util/performance.js';
import type { IsPluginEnabledCallback, GenericPluginCallback } from '../../types/plugins.js';

type ChangesetsConfig = {
  changelog: string | string[];
};

export const isEnabled: IsPluginEnabledCallback = ({ dependencies }) => dependencies.has('@changesets/cli');

export const CONFIG_FILE_PATTERNS = ['.changeset/config.json'];

const findChangesetsDependencies: GenericPluginCallback = async configFilePath => {
  const config: ChangesetsConfig = await load(configFilePath);
  return Array.isArray(config.changelog)
    ? [config.changelog[0]]
    : typeof config.changelog === 'string'
    ? [config.changelog]
    : [];
};

export const findDependencies = timerify(findChangesetsDependencies);