import { $ } from "bun";
import { homedir } from "os";
import { join } from "path";

export function getClaudeConfigHomeDir(): string {
  // BUG: https://github.com/anthropics/claude-code/issues/1455
  // if (process.env.XDG_CONFIG_HOME) {
  //   return join(process.env.XDG_CONFIG_HOME, "claude");
  // }
  return join(homedir(), ".claude");
}
export async function setupClaudeCodeSettings() {
  const home = homedir();
  const settingsPath = `${home}/.claude/settings.json`;
  console.log(`Setting up Claude settings at: ${settingsPath}`);

  // Ensure .claude directory exists
  console.log(`Creating .claude directory...`);
  await $`mkdir -p ${home}/.claude`.quiet();

  let settings: Record<string, unknown> = {};
  try {
    const existingSettings = await $`cat ${settingsPath}`.quiet().text();
    if (existingSettings.trim()) {
      settings = JSON.parse(existingSettings);
      console.log(
        `Found existing settings:`,
        JSON.stringify(settings, null, 2),
      );
    } else {
      console.log(`Settings file exists but is empty`);
    }
  } catch (e) {
    console.log(`No existing settings file found, creating new one`);
  }

  settings.enableAllProjectMcpServers = true;
  console.log(`Updated settings with enableAllProjectMcpServers: true`);

  await $`echo ${JSON.stringify(settings, null, 2)} > ${settingsPath}`.quiet();
  console.log(`Settings saved successfully`);
}
