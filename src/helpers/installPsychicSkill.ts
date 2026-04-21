import { execFileSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

const PSYCHIC_SKILL_REPO = 'https://github.com/daniel-nelson/psychic-skill.git'

export type AgentSkill = 'claude' | 'codex'

export default function installPsychicSkill(appRoot: string, agentSkill: AgentSkill) {
  const agentRoot = agentSkill === 'claude' ? '.claude' : '.codex'
  const skillDir = path.join(appRoot, agentRoot, 'skills', 'psychic-skill')

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
