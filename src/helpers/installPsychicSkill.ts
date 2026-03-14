import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

const PSYCHIC_SKILL_REPO = 'https://github.com/daniel-nelson/psychic-skill.git'

export default function installPsychicSkill(appRoot: string) {
  const skillDir = path.join(appRoot, '.claude', 'skills', 'psychic-skill')

  fs.mkdirSync(path.join(appRoot, '.claude', 'skills'), { recursive: true })

  execSync(`git clone ${PSYCHIC_SKILL_REPO} ${skillDir}`, { stdio: 'ignore' })

  // Remove .git so it's committed as plain files (not a submodule)
  fs.rmSync(path.join(skillDir, '.git'), { recursive: true, force: true })

  // Run setup to create symlinks
  execSync('./setup', { cwd: skillDir, stdio: 'ignore' })
}
