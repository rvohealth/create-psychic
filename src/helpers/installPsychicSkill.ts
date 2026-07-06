import { execFileSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { PsychicPackageManager } from './newPsychicApp.js'

const PSYCHIC_SKILL_REPO = 'https://github.com/daniel-nelson/psychic-skill.git'
const SKILL = 'psychic-skill'

export type AgentSkill = 'claude' | 'agents'

// Clone one full skill tree into `.claude` or `.agents` and run its `./setup`
// (which creates the sub-skill symlinks). Used when only one agent skill is
// selected, and as the `.agents` source-of-truth clone when both are selected.
export default function installPsychicSkill(appRoot: string, agentSkill: AgentSkill) {
  const agentRoot = agentSkill === 'claude' ? '.claude' : '.agents'
  const skillDir = path.join(appRoot, agentRoot, 'skills', SKILL)

  fs.mkdirSync(path.join(appRoot, agentRoot, 'skills'), { recursive: true })

  // Argv form (R-016): `skillDir` derives from `appRoot`, which is developer
  // CLI input. execFileSync does not spawn a shell, so shell meta-characters
  // in the path are passed literally to git rather than interpreted.
  execFileSync('git', ['clone', PSYCHIC_SKILL_REPO, skillDir], { stdio: 'ignore' })

  // Remove .git so it's committed as plain files (not a submodule)
  fs.rmSync(path.join(skillDir, '.git'), { recursive: true, force: true })

  // Run setup to create symlinks
  execFileSync('./setup', [], { cwd: skillDir, stdio: 'ignore' })
}

export interface InstallPsychicSkillsOptions {
  claude: boolean
  agents: boolean
  packageManager: PsychicPackageManager
}

// Install the psychic-skill for the selected agents. When BOTH Claude and the
// `.agents` (Codex) skill are requested we commit ONE real tree at
// `.agents/skills/psychic-skill` and make `.claude/skills/psychic-skill`
// reference it — a POSIX symlink for pnpm/yarn/bun (the committed
// `postinstall` linker repairs it into a Windows junction on checkout), or a
// real copy for npm (whose `.npmrc` `ignore-scripts=true` blocks the root
// `postinstall`, and whose committed symlink would break on a Windows
// checkout). When only one is selected we keep the plain full clone.
export function installPsychicSkills(appRoot: string, options: InstallPsychicSkillsOptions) {
  const { claude, agents, packageManager } = options

  if (claude && agents) {
    // Source of truth: one real tree at .agents/skills/psychic-skill (+ setup).
    installPsychicSkill(appRoot, 'agents')
    mirrorAgentsIntoClaude(appRoot, packageManager)
    return
  }

  if (claude) installPsychicSkill(appRoot, 'claude')
  if (agents) installPsychicSkill(appRoot, 'agents')
}

// Build the `.claude/skills` mirror of the real `.agents/skills/psychic-skill`
// tree. npm gets a real copy (present on every platform at checkout, no
// script); every other package manager gets POSIX symlinks (repaired into
// junctions by the `postinstall` linker on Windows).
function mirrorAgentsIntoClaude(appRoot: string, packageManager: PsychicPackageManager) {
  const realTree = path.join(appRoot, '.agents', 'skills', SKILL)
  const claudeSkills = path.join(appRoot, '.claude', 'skills')
  fs.mkdirSync(claudeSkills, { recursive: true })

  if (packageManager === 'npm') {
    // Real copy: zero presence risk on any OS at checkout, no install script.
    fs.rmSync(path.join(claudeSkills, SKILL), { recursive: true, force: true })
    fs.cpSync(realTree, path.join(claudeSkills, SKILL), { recursive: true })
    // Recreate the sub-skill sibling links inside .claude/skills.
    execFileSync('./setup', [], { cwd: path.join(claudeSkills, SKILL), stdio: 'ignore' })
    return
  }

  // Symlink shape: `.claude/skills/psychic-skill` -> `../../.agents/skills/psychic-skill`,
  // plus one link per sub-skill (a dir containing SKILL.md) pointing THROUGH it.
  const linkset: { name: string; rel: string; abs: string }[] = [
    { name: SKILL, rel: path.join('..', '..', '.agents', 'skills', SKILL), abs: realTree },
  ]
  for (const entry of fs.readdirSync(realTree)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue
    if (fs.existsSync(path.join(realTree, entry, 'SKILL.md'))) {
      linkset.push({ name: entry, rel: path.join(SKILL, entry), abs: path.join(realTree, entry) })
    }
  }

  const isWindows = process.platform === 'win32'
  for (const { name, rel, abs } of linkset) {
    const linkPath = path.join(claudeSkills, name)
    fs.rmSync(linkPath, { recursive: true, force: true })
    try {
      if (isWindows) fs.symlinkSync(path.resolve(abs), linkPath, 'junction')
      else fs.symlinkSync(rel, linkPath)
    } catch {
      fs.cpSync(path.resolve(abs), linkPath, { recursive: true })
    }
  }
}
